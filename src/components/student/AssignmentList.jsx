import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getAssignmentsForStudent, getSubmissionsByStudent } from '../../firebase/schema'

const CONTENT_TYPE_LABELS = {
  text: 'Metin', code: 'Kod', project: 'Proje', presentation: 'Sunum',
}

export default function AssignmentList({ onStart }) {
  const { user, profile } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [filter,      setFilter]      = useState('all')

  useEffect(() => { if (profile) loadData() }, [profile])

  async function loadData() {
    setLoading(true)
    try {
      const [asgns, subs] = await Promise.all([
        getAssignmentsForStudent({ classLevel: profile.classLevel, schoolCode: profile.schoolCode }),
        getSubmissionsByStudent(user.uid),
      ])
      setAssignments(asgns)
      setSubmissions(subs)
    } catch (err) {
      console.error(err)
      setError('Gorevler yuklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  function getSubmission(assignmentId) {
    return submissions.find(s => s.assignmentId === assignmentId) || null
  }

  function getStatus(assignmentId) {
    const sub = getSubmission(assignmentId)
    if (!sub) return 'pending'
    if (sub.score !== null && sub.score !== undefined) return 'graded'
    return 'submitted'
  }

  const filtered = assignments.filter(a => {
    if (filter === 'all')       return true
    if (filter === 'pending')   return getStatus(a.id) === 'pending'
    if (filter === 'submitted') return getStatus(a.id) === 'submitted'
    if (filter === 'graded')    return getStatus(a.id) === 'graded'
    return true
  })

  const counts = {
    all:       assignments.length,
    pending:   assignments.filter(a => getStatus(a.id) === 'pending').length,
    submitted: assignments.filter(a => getStatus(a.id) === 'submitted').length,
    graded:    assignments.filter(a => getStatus(a.id) === 'graded').length,
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Yukleniyor...</div>
  if (error)   return <div className="text-center py-20 text-red-500">{error}</div>

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-slate-800 text-xl font-semibold">Görevlerim</h2>
        <p className="text-slate-500 text-sm mt-0.5">{assignments.length} görev</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { id: 'all',       label: 'Tümü',      count: counts.all,       border: 'border-slate-200',  text: 'text-slate-800', bg: 'bg-white' },
          { id: 'pending',   label: 'Bekliyor',  count: counts.pending,   border: 'border-red-200',    text: 'text-red-600',   bg: 'bg-red-50' },
          { id: 'submitted', label: 'Teslim',    count: counts.submitted, border: 'border-yellow-200', text: 'text-yellow-600',bg: 'bg-yellow-50' },
          { id: 'graded',    label: 'Puanlandı', count: counts.graded,    border: 'border-green-200',  text: 'text-green-600', bg: 'bg-green-50' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`rounded-xl p-3 text-center border-2 transition-all shadow-sm ${
              filter === f.id ? `${f.bg} ${f.border}` : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
            <p className={`text-2xl font-bold ${filter === f.id ? f.text : 'text-slate-700'}`}>{f.count}</p>
            <p className={`text-xs mt-0.5 ${filter === f.id ? f.text : 'text-slate-500'}`}>{f.label}</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-700 font-medium mb-2">Görev bulunamadı</p>
          <p className="text-slate-400 text-sm">Öğretmenin görev oluşturduğunda burada görünecek.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const status = getStatus(a.id)
            const sub    = getSubmission(a.id)
            return (
              <div key={a.id} className={`bg-white border-2 rounded-xl p-5 transition-colors shadow-sm ${
                status === 'pending'   ? 'border-slate-200 hover:border-slate-300' :
                status === 'submitted' ? 'border-yellow-200' :
                'border-green-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        status === 'pending'   ? 'bg-red-500' :
                        status === 'submitted' ? 'bg-yellow-400' :
                        'bg-green-500'
                      }`} />
                      <h3 className="text-slate-800 font-medium">{a.title}</h3>
                      {status === 'graded' && sub?.score !== null && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          sub.score >= 70 ? 'bg-green-100 text-green-700 border border-green-200' :
                          sub.score >= 50 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>{sub.score} puan</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm mb-3">{a.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(a.contentTypes || []).map(ct => (
                        <span key={ct} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                          {CONTENT_TYPE_LABELS[ct] || ct}
                        </span>
                      ))}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        status === 'pending'   ? 'bg-red-50 text-red-600 border-red-200' :
                        status === 'submitted' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                        'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        {status === 'pending' ? 'Teslim Edilmedi' : status === 'submitted' ? 'Teslim Edildi' : 'Puanlandı'}
                      </span>
                    </div>
                    {status === 'graded' && sub?.feedback && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-600 text-xs font-medium mb-0.5">Öğretmen Yorumu</p>
                        <p className="text-slate-700 text-xs">{sub.feedback}</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => onStart(a)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                      status === 'pending'
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}>
                    {status === 'pending' ? 'Göreve Başla' : 'Güncelle'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
