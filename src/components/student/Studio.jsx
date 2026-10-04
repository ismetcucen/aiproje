import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createSubmission, updateSubmission, getSubmissionsByStudent, uploadFile } from '../../firebase/schema'
import { CURRICULUM } from '../../data/curriculum'
import { getToolUrl } from '../../data/aiToolUrls'

export default function Studio({ assignment, onBack }) {
  const { user, profile } = useAuth()
  const [content,  setContent]  = useState('')
  const [files,    setFiles]    = useState([])
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')
  const [aiUsed,   setAiUsed]   = useState(false)
  
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const [existingSubmission, setExistingSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !assignment) return;
    async function loadSub() {
      try {
        const subs = await getSubmissionsByStudent(user.uid)
        const sub = subs.find(s => s.assignmentId === assignment.id)
        if (sub) {
          setExistingSubmission(sub)
          setContent(sub.content || '')
          setFiles(sub.files || [])
          setAiUsed(sub.aiUsed || false)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSub()
  }, [user, assignment])

  if (!assignment) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-700 font-medium mb-4">Hiçbir görev seçilmedi.</p>
        <button onClick={onBack} className="text-blue-600 hover:text-blue-500 text-sm">
          ← Görevlere Dön
        </button>
      </div>
    )
  }

  const grade      = profile?.gradeNumber?.toString()
  const weekData   = CURRICULUM[grade]?.find(w => w.week === assignment.week) || null
  const aiTools    = weekData?.aiTools || assignment.aiTools || []
  const objectives = weekData?.objectives || []

  async function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const uploaded = await uploadFile(user.uid, file, (p) => setProgress(p))
      setFiles(prev => [...prev, uploaded])
    } catch (err) {
      console.error(err)
      setError('Dosya yüklenirken hata oluştu.')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  async function handleSave() {
    if (!content.trim() && files.length === 0) return setError('Lütfen bir içerik yaz veya dosya yükle.')
    setError(''); setSaving(true)
    try {
      if (existingSubmission) {
        if (existingSubmission.score !== null && existingSubmission.score !== undefined) {
          return setError('Bu ödev notlandırıldığı için tekrar gönderilemez.')
        }
        await updateSubmission(existingSubmission.id, {
          content: content.trim(),
          aiUsed,
          aiNotes: aiUsed ? 'Onerilen arac kullanildi' : null,
          files: files,
        })
      } else {
        const newSubId = await createSubmission({
          userId:       user.uid,
          assignmentId: assignment.id,
          content:      content.trim(),
          contentType:  assignment.contentTypes?.[0] || 'text',
          aiUsed,
          aiNotes:      aiUsed ? 'Onerilen arac kullanildi' : null,
          schoolCode:   profile.schoolCode,
          files:        files,
        })
        setExistingSubmission({ id: newSubId, score: null })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 8000)
    } catch (err) {
      console.error(err)
      setError('Kaydetme başarısız. Tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-600 transition-colors text-sm flex items-center gap-1">
          ← Geri
        </button>
        <div className="w-px h-4 bg-slate-300" />
        <h2 className="text-slate-800 font-semibold">{assignment.title}</h2>
        {assignment.week && (
          <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
            Hafta {assignment.week}
          </span>
        )}
      </div>

      {existingSubmission && !saved && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl flex-shrink-0 font-bold">
            ℹ️
          </div>
          <div>
            <h3 className="text-blue-800 font-bold text-lg">Bu görevi daha önce gönderdiniz.</h3>
            <p className="text-blue-600 text-sm">Aşağıdaki alanları düzenleyip "Gönderimi Güncelle" butonuna basarak ödevinizi güncelleyebilirsiniz.</p>
          </div>
        </div>
      )}

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xl flex-shrink-0 font-bold">
            ✓
          </div>
          <div>
            <h3 className="text-emerald-800 font-bold text-lg">Ödeviniz Öğretmene Gönderildi!</h3>
            <p className="text-emerald-600 text-sm">Göreviniz başarıyla kaydedildi ve öğretmeninize iletildi. Değerlendirme sonucunu bu ekrandan takip edebilirsiniz.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Görev</p>
          <p className="text-slate-700 text-sm">{assignment.description}</p>
          {weekData?.activity && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Aktivite</p>
              <p className="text-slate-600 text-sm">{weekData.activity}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {objectives.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-blue-700 text-xs font-medium uppercase tracking-wide mb-2">Kazanımlar</p>
              <ul className="space-y-1">
                {objectives.map((obj, i) => (
                  <li key={i} className="text-slate-600 text-xs flex gap-1.5">
                    <span className="text-blue-500 flex-shrink-0">•</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiTools.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">Önerilen Araçlar</p>
              <div className="flex flex-wrap gap-1.5">
                {aiTools
                  .filter(t => !['Tum araclari kullanir', 'Tum araçlar', 'Tum ogrenilen araclar', 'Tum proje araclari', 'Tüm araçlar', 'Tüm proje araçları', 'Tüm sunum araçları', 'Sunum araclari', 'Sunum araçları', 'Proje araçlari', 'Python araclari', 'İlgi alanına özel araçlar'].includes(t))
                  .map((tool, i) => {
                    const url = getToolUrl(tool)
                    return url ? (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        onClick={() => setAiUsed(true)}
                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                        {tool}
                        <span className="text-blue-200">↗</span>
                      </a>
                    ) : (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                        {tool}
                      </span>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
        <label className="block text-slate-700 text-sm font-medium mb-2">Medya / Dosya Yükle</label>
        
        <div className="flex flex-wrap gap-3 mb-3">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="text-slate-600 text-xs truncate max-w-[150px]">{f.name}</span>
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 text-xs">Aç</a>
              <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-600 font-bold ml-1 text-xs">✕</button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200">
            {uploading ? `Yükleniyor... %${Math.round(progress)}` : '📁 Dosya / Görsel Seç'}
            <input type="file" className="hidden" onChange={handleFileSelect} disabled={uploading} />
          </label>
          <span className="text-slate-500 text-xs">Maks 10MB. (Resim, Ses, PDF)</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <label className="block text-slate-700 text-sm font-medium mb-2">Metin / Link</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Buraya yazın, açıklama ekleyin veya oluşturduğunuz içeriğin linkini yapıştırın..."
          className="w-full min-h-32 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-xs">{content.length} karakter</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={aiUsed} onChange={e => setAiUsed(e.target.checked)}
                className="w-4 h-4 accent-blue-600" />
              <span className="text-slate-500 text-xs">AI aracı kullandım</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            {error  && <span className="text-red-500 text-xs">{error}</span>}
            {saved  && <span className="text-green-600 text-xs font-medium">✓ Başarıyla Gönderildi!</span>}
            <button onClick={handleSave} disabled={saving || uploading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              {saving ? 'Kaydediliyor...' : existingSubmission ? 'Gönderimi Güncelle' : 'Gönder & Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
