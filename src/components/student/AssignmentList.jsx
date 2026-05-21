import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getAssignmentsForStudent } from '../../firebase/schema'

const CONTENT_TYPE_LABELS = {
  text:         'Metin',
  code:         'Kod',
  project:      'Proje',
  presentation: 'Sunum',
}

export default function AssignmentList({ onStart }) {
  const { user, profile } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    if (profile) loadAssignments()
  }, [profile])

  async function loadAssignments() {
    setLoading(true)
    try {
      const data = await getAssignmentsForStudent({
        classLevel: profile.classLevel,
        schoolCode: profile.schoolCode,
        gradeNumber: profile.gradeNumber,
      })
      setAssignments(data)
    } catch (err) {
      console.error(err)
      setError('Gorevler yuklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Yukleniyor...</div>
  if (error)   return <div className="text-center py-20 text-red-400">{error}</div>

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-white text-xl font-semibold">Gorevlerim</h2>
        <p className="text-slate-400 text-sm mt-0.5">{assignments.length} gorev seni bekliyor</p>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white font-medium mb-2">Henuz gorev yok</p>
          <p className="text-slate-400 text-sm">Ogretmenin gorev olusturduğunda burada gorunecek.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{a.title}</h3>
                  <p className="text-slate-400 text-sm mb-3">{a.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(a.contentTypes || []).map(ct => (
                      <span key={ct} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                        {CONTENT_TYPE_LABELS[ct] || ct}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onStart(a)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
                >
                  Goreve Basla
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
