import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getSubmissionsBySchool, getAssignmentsByTeacher, getStudentsBySchool, upsertFeedback } from '../../firebase/schema'

const CONTENT_TYPE_LABELS = {
  text: 'Metin', code: 'Kod', project: 'Proje', presentation: 'Sunum',
}

export default function SubmissionsList() {
  const { user, profile } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [assignments, setAssignments] = useState({})
  const [students,    setStudents]    = useState({})
  const [loading,     setLoading]     = useState(true)
  const [selected,    setSelected]    = useState(null)
  const [filterAssignment, setFilterAssignment] = useState('all')
  const [score,   setScore]   = useState('')
  const [comment, setComment] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => { if (user) loadData() }, [user])

  async function loadData() {
    setLoading(true)
    try {
      const [subs, asgns, studs] = await Promise.all([
        getSubmissionsBySchool(profile.schoolCode),
        getAssignmentsByTeacher(user.uid),
        getStudentsBySchool(profile.schoolCode),
      ])
      setSubmissions(subs)
      const amap = {}
      asgns.forEach(a => { amap[a.id] = a })
      setAssignments(amap)
      const smap = {}
      studs.forEach(s => { smap[s.id] = s })
      setStudents(smap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openSubmission(sub) {
    setSelected(sub)
    setScore(sub.score !== null && sub.score !== undefined ? String(sub.score) : '')
    setComment(sub.feedback || '')
    setSaved(false)
  }

  async function handleFeedback() {
    if (!selected) return
    if (score === '' || isNaN(Number(score)) || Number(score) < 0 || Number(score) > 100) {
      alert('0-100 arasi bir puan girin.')
      return
    }
    setSaving(true)
    try {
      await upsertFeedback({ submissionId: selected.id, teacherId: user.uid, comment: comment.trim(), score: Number(score) })
      setSaved(true)
      await loadData()
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const assignmentList = Object.values(assignments)
  const filtered = submissions.filter(s =>
    filterAssignment === 'all' || s.assignmentId === filterAssignment
  )

  if (loading) return <div className="text-center py-20 text-slate-400">Yukleniyor...</div>

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">Uretimler</h2>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} teslim</p>
        </div>
        <button onClick={loadData} className="text-slate-400 hover:text-white text-sm">Yenile</button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilterAssignment('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            filterAssignment === 'all' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
          }`}>Tumu</button>
        {assignmentList.map(a => (
          <button key={a.id} onClick={() => setFilterAssignment(a.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterAssignment === a.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
            }`}>{a.title}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white font-medium mb-2">Henuz teslim yok</p>
              <p className="text-slate-400 text-sm">Ogrenciler gorev teslim ettiginde burada gorunecek.</p>
            </div>
          ) : filtered.map(sub => {
            const student = students[sub.userId]
            return (
              <div key={sub.id} onClick={() => openSubmission(sub)}
                className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-colors ${
                  selected?.id === sub.id ? 'border-indigo-500' : 'border-slate-800 hover:border-slate-700'
                }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-indigo-900/60 border border-indigo-800 flex items-center justify-center">
                        <span className="text-indigo-300 text-xs font-semibold">
                          {student?.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="text-white text-sm font-medium">
                        {student?.fullName || 'Bilinmeyen Ogrenci'}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {student?.gradeNumber ? `${student.gradeNumber}. sinif` : ''}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-1">{assignments[sub.assignmentId]?.title || 'Gorev bulunamadi'}</p>
                    <p className="text-slate-500 text-xs">{sub.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}</p>
                    <p className="text-slate-400 text-xs mt-2 line-clamp-2">{sub.content}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {sub.score !== null && sub.score !== undefined ? (
                      <span className={`text-sm font-bold ${sub.score >= 70 ? 'text-green-400' : sub.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {sub.score}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">Puansiz</span>
                    )}
                    {sub.aiUsed && <span className="text-xs bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded">AI</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {selected ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-fit sticky top-0">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-800 flex items-center justify-center">
                  <span className="text-indigo-300 text-sm font-semibold">
                    {students[selected.userId]?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{students[selected.userId]?.fullName || 'Bilinmeyen Ogrenci'}</p>
                  <p className="text-slate-500 text-xs">{assignments[selected.assignmentId]?.title || ''}</p>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                  {CONTENT_TYPE_LABELS[selected.contentType] || selected.contentType}
                </span>
                {selected.aiUsed && (
                  <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-md">AI kullanildi</span>
                )}
              </div>
              <div className="bg-slate-800 rounded-lg p-3 max-h-48 overflow-auto">
                <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{selected.content}</p>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <p className="text-white text-sm font-medium">Geri Bildirim</p>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Puan (0-100)</label>
                <input type="number" min={0} max={100} value={score} onChange={e => setScore(e.target.value)}
                  placeholder="85"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Yorum</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Harika bir uretim!..." rows={3}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleFeedback} disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                {saved && <span className="text-green-400 text-xs">Kaydedildi!</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-center min-h-48">
            <p className="text-slate-600 text-sm">Detay icin bir uretim sec.</p>
          </div>
        )}
      </div>
    </div>
  )
}
