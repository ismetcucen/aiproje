import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createSubmission, updateSubmission, getSubmissionsByStudent } from '../../firebase/schema'
import { CURRICULUM } from '../../data/curriculum'
import { getToolUrl } from '../../data/aiToolUrls'

export default function Studio({ assignment, onBack }) {
  const { user, profile } = useAuth()
  const [content,  setContent]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')
  const [aiUsed,   setAiUsed]   = useState(false)

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

  // Görevin müfredattaki hafta verisini bul
  const grade      = profile?.gradeNumber?.toString()
  const weekData   = CURRICULUM[grade]?.find(w => w.week === assignment.week) || null
  const aiTools    = weekData?.aiTools || assignment.aiTools || []
  const objectives = weekData?.objectives || []

  async function handleSave() {
    if (!content.trim()) return setError('Lütfen önce bir şeyler yaz.')
    setError(''); setSaving(true)
    try {
      await createSubmission({
        userId:       user.uid,
        assignmentId: assignment.id,
        content:      content.trim(),
        contentType:  assignment.contentTypes?.[0] || 'text',
        aiUsed,
        aiNotes:      aiUsed ? 'Onerilen arac kullanildi' : null,
        schoolCode:   profile.schoolCode,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
      setError('Kaydetme başarısız. Tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">

      {/* Geri + Başlık */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 transition-colors text-sm flex items-center gap-1">
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

      {/* Görev Bilgileri */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Görev Açıklaması */}
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

        {/* Sağ Bilgi Paneli */}
        <div className="space-y-3">
          {/* Kazanımlar */}
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

          {/* Önerilen Araçlar */}
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
              <p className="text-slate-400 text-xs mt-2">Bir araca tıklarsan AI kullandın olarak işaretlenir.</p>
            </div>
          )}

          {/* Süre ve Çıktı */}
          {weekData && (
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
              {weekData.duration && (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 text-xs">Süre</span>
                  <span className="text-slate-700 text-xs font-medium">{weekData.duration} dk</span>
                </div>
              )}
              {weekData.output && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Çıktı</span>
                  <span className="text-slate-700 text-xs font-medium">{weekData.output}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Yazı Alanı */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <label className="block text-slate-700 text-sm font-medium mb-2">Üretiminiz</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Buraya yazın veya ürettiğiniz içeriği yapıştırın..."
          className="w-full min-h-48 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-xs">{content.length} karakter</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={aiUsed} onChange={e => setAiUsed(e.target.checked)}
                className="w-4 h-4 accent-blue-600" />
              <span className="text-slate-500 text-xs">AI aracı kullandım</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            {error  && <span className="text-red-500 text-xs">{error}</span>}
            {saved  && <span className="text-green-600 text-xs font-medium">✓ Kaydedildi!</span>}
            <button onClick={handleSave} disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
