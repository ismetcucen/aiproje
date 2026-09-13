import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getCurriculum, updateCurriculumWeek, assignCurriculumWeek } from '../../firebase/schema'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { MODULES } from '../../data/defaultCurriculum'

const GRADES = [3, 4, 5, 6, 7, 8, 9, 10]

const CONTENT_TYPE_LABELS = {
  text: 'Metin / Hikaye',
  code: 'Kod',
  project: 'Proje',
  presentation: 'Sunum'
}

export default function CurriculumManager() {
  const { user } = useAuth()
  const [selectedGrade, setSelectedGrade] = useState(3)
  const [selectedModule, setSelectedModule] = useState('all')
  const [curriculum, setCurriculum] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modals / Actions states
  const [editingWeek, setEditingWeek] = useState(null) // holds week object being edited
  const [assigningWeek, setAssigningWeek] = useState(null) // holds week object being assigned
  const [selectedSchoolCode, setSelectedSchoolCode] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Get valid school codes from env
  const schoolCodes = (import.meta.env.VITE_VALID_SCHOOL_CODES || '').split(',').filter(Boolean)

  useEffect(() => {
    loadCurriculumData()
  }, [selectedGrade])

  useEffect(() => {
    if (schoolCodes.length > 0 && !selectedSchoolCode) {
      setSelectedSchoolCode(schoolCodes[0])
    }
  }, [schoolCodes])

  async function loadCurriculumData() {
    setLoading(true)
    setError('')
    try {
      const data = await getCurriculum(selectedGrade)
      setCurriculum(data)
    } catch (err) {
      console.error(err)
      setError('Müfredat yüklenirken hata oluştu: ' + (err.message || err.toString()))
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateWeek(e) {
    e.preventDefault()
    if (!editingWeek.title.trim()) return setError('Başlık boş olamaz.')
    if (!editingWeek.description.trim()) return setError('Açıklama boş olamaz.')

    setActionLoading(true)
    setError('')
    try {
      await updateCurriculumWeek(selectedGrade, editingWeek.week, {
        title: editingWeek.title.trim(),
        description: editingWeek.description.trim(),
        contentType: editingWeek.contentType
      })
      setSuccess(`${editingWeek.week}. Hafta başarıyla güncellendi!`)
      setEditingWeek(null)
      await loadCurriculumData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('Güncelleme sırasında hata oluştu: ' + (err.message || err.toString()))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAssignWeek(e) {
    e.preventDefault()
    if (!selectedSchoolCode) return setError('Lütfen bir okul kodu seçin.')

    setActionLoading(true)
    setError('')
    try {
      await assignCurriculumWeek({
        gradeNumber: selectedGrade,
        week: assigningWeek.week,
        schoolCode: selectedSchoolCode,
        createdBy: user.uid
      })
      setSuccess(`${selectedGrade}. Sınıf - ${assigningWeek.week}. Hafta görevi (${selectedSchoolCode}) okuluna başarıyla atandı!`)
      setAssigningWeek(null)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error(err)
      setError('Ödev atama sırasında hata oluştu: ' + (err.message || err.toString()))
    } finally {
      setActionLoading(false)
    }
  }

  const filteredCurriculum = curriculum.filter(item => 
    selectedModule === 'all' || item.moduleId === Number(selectedModule)
  )


  async function handleSeedCurriculum() {
    if (!window.confirm(`${selectedGrade}. Sınıf müfredatını varsayılan (Maarif Modeli) ile sıfırlamak istediğinize emin misiniz?`)) return
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const { CURRICULUM } = await import('../../data/curriculum')
      const defaultData = CURRICULUM[selectedGrade] || []
      
      const batch = []
      // We will just overwrite them one by one since it's only 36 items
      for (const w of defaultData) {
        const docRef = doc(db, 'curriculum', `grade_${selectedGrade}_week_${w.week}`)
        batch.push(
          setDoc(docRef, {
            gradeNumber: Number(selectedGrade),
            week: w.week,
            title: w.title,
            description: w.description,
            activity: w.activity || w.description,
            objectives: w.objectives || [],
            contentType: 'topic',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true })
        )
      }
      await Promise.all(batch)
      
      setSuccess(`${selectedGrade}. Sınıf müfredatı başarıyla varsayılan değerlere sıfırlandı!`)
      // refresh
      const data = await getCurriculum(selectedGrade)
      setCurriculum(data)
    } catch (err) {
      console.error(err)
      setError('Müfredat yüklenirken hata oluştu: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="max-w-6xl">
      {/* Üst Kısım */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-slate-800 text-xl font-semibold">Müfredat Yönetimi</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            3-10. sınıflar için 36 haftalık Yapay Zeka müfredat planı. Düzenleyebilir ve sınıflara atayabilirsiniz.
          </p>
        </div>
        <button 
          onClick={loadCurriculumData} 
          className="bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 px-3.5 py-2 rounded-lg text-sm transition-colors flex items-center gap-1.5 self-start"
        >
          🔄 Yenile
        </button>
      </div>

      {error && <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3.5 rounded-xl bg-green-950/40 border border-green-800/80 text-green-300 text-sm">{success}</div>}

      {/* Sınıf Sekmeleri (3-10) */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-1.5 pb-2">
        {GRADES.map(grade => (
          <button
            key={grade}
            onClick={() => { setSelectedGrade(grade); setEditingWeek(null); setAssigningWeek(null); }}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              selectedGrade === grade
                ? 'bg-red-600/10 border border-red-700/50 text-red-400'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-white'
            }`}
          >
            {grade}. Sınıf
          </button>
        ))}
      </div>

      {/* Modül Filtreleri */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedModule('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            selectedModule === 'all'
              ? 'bg-red-600 border-red-500 text-white'
              : 'bg-white shadow-sm border-slate-200 text-slate-500 hover:border-slate-200'
          }`}
        >
          Tüm Müfredat
        </button>
        {MODULES.map(mod => (
          <button
            key={mod.id}
            onClick={() => setSelectedModule(mod.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              selectedModule === mod.id
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-white shadow-sm border-slate-200 text-slate-500 hover:border-slate-200'
            }`}
          >
            {mod.id}. Modül: {mod.name}
          </button>
        ))}
      </div>

      {/* Müfredat Listesi */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
          Yükleniyor...
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCurriculum.length === 0 ? (
            <p className="text-slate-500 text-center py-10">Seçilen kriterde müfredat konusu bulunamadı.</p>
          ) : (
            filteredCurriculum.map(item => (
              <div 
                key={item.id} 
                className="bg-white shadow-sm border border-slate-200 hover:border-slate-200/80 rounded-2xl p-5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                {/* Sol Taraf: Hafta No + Başlık + Detay */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="bg-red-600/10 text-red-400 border border-red-900/40 text-xs font-bold px-2 py-0.5 rounded-md">
                      Hafta {item.week}
                    </span>
                    <span className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold">
                      Modül {item.moduleId}
                    </span>
                    <span className="bg-slate-50 text-slate-700 text-xs px-2 py-0.5 rounded-md">
                      {CONTENT_TYPE_LABELS[item.contentType] || item.contentType}
                    </span>
                  </div>
                  <h3 className="text-slate-800 font-semibold text-base mb-1">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                </div>

                {/* Sağ Taraf: Eylemler */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                  <button
                    onClick={() => { setEditingWeek(item); setAssigningWeek(null); }}
                    className="flex-1 md:flex-none border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
                  >
                    📝 Düzenle
                  </button>
                  <button
                    onClick={() => { setAssigningWeek(item); setEditingWeek(null); }}
                    className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
                  >
                    🚀 Sınıfa Ata
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL 1: Düzenleme Formu */}
      {editingWeek && (
        <div className="fixed inset-0 bg-white backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-slate-800 font-bold text-lg">Haftalık Konuyu Düzenle</h3>
              <button 
                onClick={() => setEditingWeek(null)}
                className="text-slate-500 hover:text-indigo-600 text-xl"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateWeek} className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-red-600/10 text-red-400 border border-red-900/40 text-xs font-bold px-2 py-0.5 rounded-md">
                  {selectedGrade}. Sınıf
                </span>
                <span className="bg-red-600/10 text-red-400 border border-red-900/40 text-xs font-bold px-2 py-0.5 rounded-md">
                  {editingWeek.week}. Hafta
                </span>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">Konu Başlığı</label>
                <input
                  type="text"
                  value={editingWeek.title}
                  onChange={e => setEditingWeek(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">Konu Açıklaması / Yönergesi</label>
                <textarea
                  value={editingWeek.description}
                  onChange={e => setEditingWeek(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">Önerilen Üretim Türü</label>
                <select
                  value={editingWeek.contentType}
                  onChange={e => setEditingWeek(p => ({ ...p, contentType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
                >
                  {Object.entries(CONTENT_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {actionLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingWeek(null)}
                  className="flex-1 bg-slate-50 hover:bg-slate-700 text-slate-700 py-2.5 rounded-lg text-sm transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Görev Atama Formu */}
      {assigningWeek && (
        <div className="fixed inset-0 bg-white backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-slate-800 font-bold text-lg">Müfredat Haftasını Ata</h3>
              <button 
                onClick={() => setAssigningWeek(null)}
                className="text-slate-500 hover:text-indigo-600 text-xl"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAssignWeek} className="p-6 space-y-4">
              <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3.5">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Seçilen Müfredat</p>
                <h4 className="text-slate-800 font-semibold text-sm">{selectedGrade}. Sınıf · Hafta {assigningWeek.week}</h4>
                <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{assigningWeek.title}</p>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">Hedef Okul Kodu</label>
                <select
                  value={selectedSchoolCode}
                  onChange={e => setSelectedSchoolCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  required
                >
                  {schoolCodes.length === 0 ? (
                    <option value="">Kayıtlı okul kodu bulunamadı</option>
                  ) : (
                    schoolCodes.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))
                  )}
                </select>
                <p className="text-slate-500 text-[10px] mt-1.5">
                  Bu görev, seçtiğiniz okulun tüm **{selectedGrade}. sınıf** öğrencilerine otomatik olarak atanacaktır.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading || !selectedSchoolCode}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {actionLoading ? 'Atanıyor...' : 'Görevi Sınıflara Ata'}
                </button>
                <button
                  type="button"
                  onClick={() => setAssigningWeek(null)}
                  className="flex-1 bg-slate-50 hover:bg-slate-700 text-slate-700 py-2.5 rounded-lg text-sm transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
