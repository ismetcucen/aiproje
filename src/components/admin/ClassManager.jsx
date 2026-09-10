import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { createClass, getClassesBySchool, addStudentToClass, getStudentsByClass } from '../../firebase/schema'
import { GRADES, SECTIONS } from '../../data/curriculum'
import BulkStudentUpload from "./BulkStudentUpload"
import AddStudentModal from './AddStudentModal'
import { exportStudentCredentials } from '../../utils/exportCredentials'


export default function ClassManager({ schoolCode }) {
  const [classes,    setClasses]    = useState([])
  const [selected,   setSelected]   = useState(null)
  const [students,   setStudents]   = useState([])
  const [allUsers,   setAllUsers]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState('students')
  const [newGrade,   setNewGrade]   = useState('3')
  const [newSection, setNewSection] = useState('A')
  const [saving,     setSaving]     = useState(false)
  const [success,    setSuccess]    = useState('')
  const [error,      setError]      = useState('')
  const [showModal,  setShowModal]  = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [cls, users] = await Promise.all([
        getClassesBySchool(schoolCode),
        getDocs(query(collection(db, 'users'), where('schoolCode', '==', schoolCode || 'OHEP'), where('role', '==', 'student'))),
      ])
      setClasses(cls)
      setAllUsers(users.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  
  async function handleDeleteClass(classId) {
    if (!window.confirm("Bu sınıfı silmek istediğinize emin misiniz? (Öğrenciler silinmez, sadece sınıftan çıkarılır)")) return;
    try {
      await deleteClass(classId);
      setSuccess("Sınıf başarıyla silindi!");
      if (selected?.id === classId) setSelected(null);
      await loadData();
    } catch(err) {
      setError(err.message || "Sınıf silinirken hata oluştu.");
    }
  }

  async function handleRemoveStudent(studentId) {
    if (!selected) return;
    if (!window.confirm("Bu öğrenciyi sınıftan çıkarmak istediğinize emin misiniz?")) return;
    try {
      await forceRemoveStudentFromClass(selected.id, studentId);
      setSuccess("Öğrenci sınıftan çıkarıldı.");
      const m = await import('../../firebase/schema');
      const studs = await m.getStudentsByClass(selected.id);
      setStudents(studs);
      await loadData();
    } catch(err) {
      setError(err.message || "Öğrenci çıkarılırken hata oluştu.");
    }
  }

  async function handleCreateClass() {
    const exists = classes.find(c => c.grade === newGrade && c.section === newSection)
    if (exists) return setError(`${newGrade}/${newSection} sinifi zaten var.`)
    setSaving(true); setError('')
    try {
      await createClass({ grade: newGrade, section: newSection, schoolCode: schoolCode || 'OHEP' })
      await loadData()
      setSuccess(`${newGrade}/${newSection} sinifi olusturuldu.`)
      setTimeout(() => setSuccess(''), 3000)
    } catch(e) { setError('Sinif olusturulamadi.') }
    finally { setSaving(false) }
  }

  async function selectClass(cls) {
    setSelected(cls)
    setTab('students')
    const studs = await getStudentsByClass(cls.id)
    setStudents(studs)
  }

  async function handleAddExisting(userId) {
    if (!selected) return
    try {
      await addStudentToClass(selected.id, userId)
      const studs = await getStudentsByClass(selected.id)
      setStudents(studs)
      setSuccess('Ogrenci sinifa eklendi.')
      setTimeout(() => setSuccess(''), 2000)
    } catch(e) { setError('Ogrenci eklenemedi.') }
  }

  async function handleModalSuccess() {
    setShowModal(false)
    setSuccess('Ogrenci basariyla eklendi!')
    setTimeout(() => setSuccess(''), 3000)
    await loadData()
    if (selected) {
      const studs = await getStudentsByClass(selected.id)
      setStudents(studs)
    }
  }

  async function handleExcelUpload(e) {
    const file = e.target.files[0]
    if (!file || !selected) return
    try {
      const { default: XLSX } = await import('xlsx')
      const reader = new FileReader()
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws)
        const names = data.map(r => r['Ad Soyad'] || r.fullName || r.name || '?').join(', ')
        setSuccess(`${data.length} ogrenci okundu: ${names}. Tam entegrasyon yakinda.`)
      }
      reader.readAsBinaryString(file)
    } catch(e) { setError('Excel okunamadi.') }
  }

  const studentsInClass = students.map(s => s.id)
  const available = allUsers.filter(u => !studentsInClass.includes(u.id))

  if (loading) return <div className="text-center py-20 text-slate-500">Yukleniyor...</div>

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {showModal && (
        <AddStudentModal
          classInfo={selected}
          schoolCode={schoolCode}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-slate-800 text-3xl font-bold tracking-tight mb-1">Sınıf Yönetimi</h2>
          <p className="text-slate-500 text-base">{classes.length} aktif sınıf mevcut</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 bg-slate-50 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm">
          <span>🔄</span> Yenile
        </button>
      </div>

      {error   && <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/50 text-red-300 text-sm font-medium flex items-center gap-2"><span>⚠️</span>{error}</div>}
      {success && <div className="mb-6 p-4 rounded-xl bg-green-900/30 border border-green-500/50 text-green-300 text-sm font-medium flex items-center gap-2"><span>✅</span>{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sol Menü: Sınıflar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
            <h3 className="text-slate-800 text-lg font-bold mb-4 relative z-10">Yeni Sınıf Oluştur</h3>
            <div className="flex gap-3 mb-4 relative z-10">
              <select value={newGrade} onChange={e => setNewGrade(e.target.value)}
                className="flex-1 bg-white shadow-sm border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all">
                {GRADES.map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
              </select>
              <select value={newSection} onChange={e => setNewSection(e.target.value)}
                className="w-24 bg-white shadow-sm border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all">
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={handleCreateClass} disabled={saving}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white py-3.5 rounded-xl text-base font-bold transition-all shadow-lg shadow-red-600/20 relative z-10">
              {saving ? 'Oluşturuluyor...' : '+ Sınıfı Ekle'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-slate-500 font-semibold uppercase tracking-wider text-xs px-2">Mevcut Sınıflar</h3>
            {classes.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-base">Henüz sınıf yok.</p>
              </div>
            ) : classes.map(cls => (
              <div key={cls.id} className={`group relative w-full flex items-center px-5 py-4 rounded-2xl border transition-all duration-200 ${
                  selected?.id === cls.id
                    ? 'bg-red-900/20 border-red-500/50 shadow-lg shadow-red-900/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-200'
                }`}>
                <button onClick={() => selectClass(cls)} className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className={`text-lg font-bold ${selected?.id === cls.id ? 'text-red-400' : 'text-slate-800'}`}>{cls.name}</p>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selected?.id === cls.id ? 'bg-red-500/20 text-red-400' : 'bg-slate-50 text-slate-500'}`}>{cls.section}</span>
                  </div>
                  <p className={`text-sm mt-1 ${selected?.id === cls.id ? 'text-red-300/70' : 'text-slate-500'}`}>{cls.grade}. Sınıf Seviyesi</p>
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id); }}
                  title="Sınıfı Sil"
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all">
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ Alan: Sınıf Detayı */}
        <div className="lg:col-span-8">
          {!selected ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-4xl">🏫</div>
              <p className="text-slate-500 text-lg font-medium">İşlem yapmak için sol taraftan bir sınıf seçin.</p>
            </div>
          ) : (
            <div className="bg-white backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 relative z-10">
                <div>
                  <h3 className="text-slate-800 text-3xl font-black mb-1">{selected.name} Sınıfı</h3>
                  <p className="text-slate-500 text-base">{students.length} öğrenci kayıtlı</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => exportStudentCredentials(students, selected ? selected.name : 'Sınıf')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 whitespace-nowrap">
                    <span>📄</span> Şifreleri İndir
                  </button>
                  <button onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 whitespace-nowrap">
                    <span>+</span> Yeni Öğrenci Ekle
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8 relative z-10 bg-white shadow-sm p-1.5 rounded-2xl border border-slate-200 w-fit">
                {[
                  { id: 'students', label: `Kayıtlı Öğrenciler (${students.length})`, icon: '🎓' },
                  { id: 'add',      label: 'Mevcut Öğrenci Seç', icon: '🔍' },
                  { id: 'excel',    label: 'Excel ile Yükle', icon: '📄' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      tab === t.id ? 'bg-slate-50 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                    }`}>
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>

              <div className="relative z-10">
                {tab === 'students' && (
                  <div className="space-y-3">
                    {students.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/50 border-dashed">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-slate-500 text-lg mb-4">Bu sınıfta henüz öğrenci yok.</p>
                        <button onClick={() => setShowModal(true)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">
                          İlk Öğrenciyi Ekle
                        </button>
                      </div>
                    ) : students.map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-slate-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg font-bold">{s.fullName?.charAt(0)?.toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-slate-700 text-lg font-semibold">{s.fullName}</p>
                            <p className="text-slate-500 text-sm">{s.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Aktif</span>
                          </div>
                          <button onClick={() => handleRemoveStudent(s.id)} title="Öğrenciyi Sınıftan Çıkar" className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 p-2 rounded-xl transition-colors">
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'add' && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <p className="text-slate-500 text-sm font-medium mb-6">Okul sistemine kayıtlı olup bir sınıfa atanmamış öğrenciler:</p>
                    {available.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-slate-500 text-base">Eklenebilecek boştaki öğrenci bulunmuyor.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {available.map(u => (
                          <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-4 hover:border-slate-600 transition-colors">
                            <div>
                              <p className="text-slate-700 font-semibold">{u.fullName}</p>
                              <p className="text-slate-500 text-xs mt-1">{u.email}</p>
                            </div>
                            <button onClick={() => handleAddExisting(u.id)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap">
                              Sınıfa Ekle
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'excel' && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <BulkStudentUpload
                      classInfo={selected}
                      schoolCode={schoolCode}
                      onSuccess={async (count) => {
                        setSuccess(`${count} öğrenci başarıyla eklendi!`)
                        setTimeout(() => setSuccess(''), 4000)
                        await loadData()
                        if (selected) {
                          const studs = await import('../../firebase/schema').then(m => m.getStudentsByClass(selected.id))
                          setStudents(studs)
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
