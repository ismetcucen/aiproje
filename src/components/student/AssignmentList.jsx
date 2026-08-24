import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getAssignmentsForStudent, getSubmissionsByStudent } from '../../firebase/schema'
import { CURRICULUM } from '../../data/curriculum'

const CONTENT_TYPE_LABELS = {
  text: 'Metin', code: 'Kod', project: 'Proje', presentation: 'Sunum',
}

export default function AssignmentList({ onStart }) {
  const { user, profile } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => { if (profile) loadData() }, [profile])

  async function loadData() {
    setLoading(true)
    try {
      const [asgns, subs] = await Promise.all([
        getAssignmentsForStudent({ classLevel: profile.classLevel, schoolCode: profile.schoolCode, gradeNumber: profile.gradeNumber }),
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

  if (loading) return <div className="text-center py-20 text-slate-400">Yükleniyor...</div>
  if (error)   return <div className="text-center py-20 text-red-500">{error}</div>

  // profile.gradeNumber might be "3", "4" etc.
  const gradeStr = profile?.gradeNumber ? String(profile.gradeNumber) : "3"
  const curriculum = CURRICULUM[gradeStr] || []

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-slate-800 text-2xl font-bold">Yıllık Müfredatım</h2>
        <p className="text-slate-500 mt-1">Bu yıl öğreneceğimiz tüm konular ve sana atanan aktif görevler.</p>
      </div>

      <div className="space-y-4">
        {curriculum.map(week => {
          // Find if there is an assignment for this week
          // It could match by week number or title
          const assignment = assignments.find(a => a.week === week.week || a.title === week.title)
          
          const isAssigned = !!assignment
          const status = assignment ? getStatus(assignment.id) : null
          const sub = assignment ? getSubmission(assignment.id) : null

          if (isAssigned) {
            // PROMINENT ACTIVE WEEK
            return (
              <div key={week.week} className={`bg-white border-2 rounded-2xl p-6 transition-all shadow-md transform hover:-translate-y-1 ${
                status === 'pending'   ? 'border-blue-400 ring-4 ring-blue-50' :
                status === 'submitted' ? 'border-yellow-400' :
                'border-green-400'
              }`}>
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-sm ${
                        status === 'pending'   ? 'bg-blue-500' :
                        status === 'submitted' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}>
                        {week.week}
                      </div>
                      <div>
                        <h3 className="text-slate-900 text-xl font-bold">{week.title}</h3>
                        <p className="text-slate-500 text-sm font-medium">{week.dateRange}</p>
                      </div>
                      
                      {status === 'graded' && sub?.score !== null && (
                        <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${
                          sub.score >= 70 ? 'bg-green-100 text-green-700' :
                          sub.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{sub.score} puan</span>
                      )}
                    </div>
                    
                    <p className="text-slate-700 text-base mb-4 leading-relaxed">{week.description}</p>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                      <p className="text-slate-800 font-medium text-sm mb-1">🎯 Bu Haftanın Aktivitesi:</p>
                      <p className="text-slate-600 text-sm">{week.activity}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm px-3 py-1 font-semibold rounded-full border ${
                        status === 'pending'   ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        status === 'submitted' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                        'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        {status === 'pending' ? '🚀 Görev Bekliyor' : status === 'submitted' ? '✅ Teslim Edildi' : '🏆 Puanlandı'}
                      </span>
                    </div>

                    {status === 'graded' && sub?.feedback && (
                      <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <p className="text-indigo-700 text-sm font-bold mb-1">Öğretmen Yorumu</p>
                        <p className="text-indigo-900 text-sm">{sub.feedback}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full md:w-auto flex-shrink-0">
                    <button onClick={() => onStart(assignment)}
                      className={`w-full md:w-auto px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-sm ${
                        status === 'pending'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
                          : 'bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}>
                      {status === 'pending' ? 'Göreve Başla' : 'Görevi İncele'}
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          // INACTIVE WEEK (Just informative)
          return (
            <div key={week.week} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 opacity-75 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold flex-shrink-0">
                {week.week}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-slate-700 font-semibold">{week.title}</h3>
                  <span className="text-slate-400 text-xs font-medium">({week.dateRange})</span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-1">{week.description}</p>
              </div>
              <div className="text-slate-400 text-xs font-medium px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                Kilitli
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
