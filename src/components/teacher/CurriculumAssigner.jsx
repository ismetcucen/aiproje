import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getClassesBySchool, assignWeekToClass, getAssignmentsByClass } from '../../firebase/schema'
import { CURRICULUM } from '../../data/curriculum'

export default function CurriculumAssigner() {
  const { user, profile } = useAuth()
  const [classes,     setClasses]     = useState([])
  const [selected,    setSelected]    = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [success,     setSuccess]     = useState('')
  const [error,       setError]       = useState('')
  const [activeWeek,  setActiveWeek]  = useState(1)

  useEffect(() => {
    loadClasses()
  }, [])

  async function loadClasses() {
    setLoading(true)
    try {
      const cls = await getClassesBySchool(profile.schoolCode)
      setClasses(cls)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function selectClass(cls) {
    setSelected(cls)
    const asgns = await getAssignmentsByClass(cls.id)
    setAssignments(asgns)
  }

  async function handleAssign(week) {
    if (!selected) return
    const grade = selected.grade
    const weekData = CURRICULUM[grade]?.find(w => w.week === week)
    if (!weekData) return setError('Bu sinif icin hafta verisi bulunamadi.')

    const alreadyAssigned = assignments.find(a => a.week === week && a.classId === selected.id)
    if (alreadyAssigned) return setError(`Hafta ${week} zaten atanmis.`)

    setSaving(true); setError('')
    try {
      await assignWeekToClass({
        classId:     selected.id,
        schoolCode:  profile.schoolCode,
        grade,
        week:        weekData.week,
        title:       weekData.title,
        description: weekData.description,
        activity:    weekData.activity,
        assignedBy:  user.uid,
      })
      const asgns = await getAssignmentsByClass(selected.id)
      setAssignments(asgns)
      setSuccess(`Hafta ${week}: "${weekData.title}" sinifa atandi!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch(e) {
      console.error(e)
      setError('Atama yapilamadi.')
    } finally {
      setSaving(false)
    }
  }

  function isAssigned(week) {
    return assignments.some(a => a.week === week && a.classId === selected?.id)
  }

  const curriculum = selected ? (CURRICULUM[selected.grade] || []) : []

  if (loading) return <div className="text-center py-20 text-slate-400">Yukleniyor...</div>

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-white text-xl font-semibold">Haftalik Mufredat</h2>
        <p className="text-slate-400 text-sm mt-0.5">Sinifa haftalik ders ata</p>
      </div>

      {error   && <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-800 text-red-300 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-lg bg-green-900/40 border border-green-800 text-green-300 text-sm">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sol — Sınıf Seç */}
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Sinif Sec</p>
          {classes.length === 0 ? (
            <p className="text-slate-500 text-sm">Admin panelinden once sinif olusturun.</p>
          ) : (
            <div className="space-y-2">
              {classes.map(cls => (
                <button key={cls.id} onClick={() => selectClass(cls)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    selected?.id === cls.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}>
                  <p className="font-semibold">{cls.name}</p>
                  <p className="text-xs text-slate-500">{cls.grade}. sinif</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sağ — Hafta Listesi */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-500">Sol taraftan bir sinif sec.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-medium">{selected.name} — {selected.grade}. Sinif Mufredati</p>
                <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 px-2 py-1 rounded-full">
                  {assignments.length} / 36 hafta atandi
                </span>
              </div>

              {/* İlerleme Barı */}
              <div className="bg-slate-800 rounded-full h-2 mb-4">
                <div className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${(assignments.length / 36) * 100}%` }} />
              </div>

              {/* Hafta Listesi */}
              <div className="space-y-2 max-h-96 overflow-auto pr-1">
                {curriculum.map(week => {
                  const assigned = isAssigned(week.week)
                  return (
                    <div key={week.week}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        assigned
                          ? 'bg-green-900/20 border-green-800'
                          : 'bg-slate-900 border-slate-800'
                      }`}>

                      {/* Hafta No */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        assigned ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {week.week}
                      </div>

                      {/* İçerik */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${assigned ? 'text-green-300' : 'text-white'}`}>
                          {week.title} <span className="text-slate-500 font-normal ml-1">({week.dateRange})</span>
                        </p>
                        <p className="text-slate-500 text-xs truncate">{week.activity}</p>
                      </div>

                      {/* Durum / Ata Butonu */}
                      {assigned ? (
                        <span className="text-green-400 text-xs flex-shrink-0 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                          Atandi
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAssign(week.week)}
                          disabled={saving}
                          className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                          Ata
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
