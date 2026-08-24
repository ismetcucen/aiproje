import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { createClass, getClassesBySchool, addStudentToClass, getStudentsByClass } from '../../firebase/schema'
import { GRADES, SECTIONS } from '../../data/curriculum'
import BulkStudentUpload from "./BulkStudentUpload"
import AddStudentModal from './AddStudentModal'

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

  if (loading) return <div className="text-center py-20 text-slate-400">Yukleniyor...</div>

  return (
    <div className="max-w-5xl">
      {showModal && (
        <AddStudentModal
          classInfo={selected}
          schoolCode={schoolCode}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">Sinif Yonetimi</h2>
          <p className="text-slate-400 text-sm mt-0.5">{classes.length} sinif mevcut</p>
        </div>
        <button onClick={loadData} className="text-slate-400 hover:text-white text-sm">Yenile</button>
      </div>

      {error   && <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-800 text-red-300 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-lg bg-green-900/40 border border-green-800 text-green-300 text-sm">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sol */}
        <div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
            <h3 className="text-white font-medium mb-3">Yeni Sinif</h3>
            <div className="flex gap-2 mb-3">
              <select value={newGrade} onChange={e => setNewGrade(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-red-500">
                {GRADES.map(g => <option key={g} value={g}>{g}. Sinif</option>)}
              </select>
              <select value={newSection} onChange={e => setNewSection(e.target.value)}
                className="w-20 bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-red-500">
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={handleCreateClass} disabled={saving}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Olusturuluyor...' : '+ Sinif Olustur'}
            </button>
          </div>

          <div className="space-y-2">
            {classes.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Henuz sinif yok.</p>
            ) : classes.map(cls => (
              <button key={cls.id} onClick={() => selectClass(cls)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                  selected?.id === cls.id
                    ? 'bg-red-600/20 border-red-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}>
                <p className="font-semibold">{cls.name}</p>
                <p className="text-xs text-slate-500">{cls.grade}. sinif — {cls.section} subesi</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sağ */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-500">Sol taraftan bir sinif sec.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">{selected.name} Sinifi</h3>
                <button onClick={() => setShowModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                  + Yeni Ogrenci
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                {[
                  { id: 'students', label: `Ogrenciler (${students.length})` },
                  { id: 'add',      label: 'Mevcut Ekle' },
                  { id: 'excel',    label: 'Excel' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      tab === t.id ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === 'students' && (
                <div className="space-y-2">
                  {students.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 text-sm mb-3">Bu sinifta henuz ogrenci yok.</p>
                      <button onClick={() => setShowModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        + Ilk Ogrenciyi Ekle
                      </button>
                    </div>
                  ) : students.map(s => (
                    <div key={s.id} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-900/60 border border-indigo-800 flex items-center justify-center">
                          <span className="text-indigo-300 text-xs font-semibold">{s.fullName?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{s.fullName}</p>
                          <p className="text-slate-500 text-xs">{s.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-green-400 text-xs">Aktif</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'add' && (
                <div>
                  <p className="text-slate-400 text-xs mb-3">Sistemde kayitli ogrencilerden sec:</p>
                  {available.length === 0 ? (
                    <p className="text-slate-500 text-sm">Eklenebilecek ogrenci yok.</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-auto">
                      {available.map(u => (
                        <div key={u.id} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-white text-sm">{u.fullName}</p>
                            <p className="text-slate-500 text-xs">{u.email}</p>
                          </div>
                          <button onClick={() => handleAddExisting(u.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs transition-colors">
                            Ekle
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'excel' && (
                <BulkStudentUpload
                  classInfo={selected}
                  schoolCode={schoolCode}
                  onSuccess={async (count) => {
                    setSuccess(`${count} ogrenci basariyla eklendi!`)
                    setTimeout(() => setSuccess(''), 4000)
                    await loadData()
                    if (selected) {
                      const studs = await import('../../firebase/schema').then(m => m.getStudentsByClass(selected.id))
                      setStudents(studs)
                    }
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
