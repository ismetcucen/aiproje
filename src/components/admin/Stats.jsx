import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { collection, getDocs } from 'firebase/firestore'

export default function Stats() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    try {
      const [users, assignments, submissions, aiLogs] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'assignments')),
        getDocs(collection(db, 'submissions')),
        getDocs(collection(db, 'ai_logs')),
      ])

      const userDocs = users.docs.map(d => ({ id: d.id, ...d.data() }))
      const subDocs  = submissions.docs.map(d => ({ id: d.id, ...d.data() }))

      setStats({
        totalUsers:       userDocs.length,
        totalStudents:    userDocs.filter(u => u.role === 'student').length,
        totalTeachers:    userDocs.filter(u => u.role === 'teacher').length,
        totalAssignments: assignments.size,
        totalSubmissions: submissions.size,
        totalAiLogs:      aiLogs.size,
        aiUsedCount:      subDocs.filter(s => s.aiUsed).length,
        scoredCount:      subDocs.filter(s => s.score !== null && s.score !== undefined).length,
        schools:          [...new Set(userDocs.map(u => u.schoolCode).filter(Boolean))],
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Yukleniyor...</div>
  if (!stats)  return <div className="text-center py-20 text-red-400">Veri yuklenemedi.</div>

  const cards = [
    { label: 'Toplam Kullanici',  value: stats.totalUsers,       color: 'text-white'        },
    { label: 'Ogrenci',           value: stats.totalStudents,    color: 'text-indigo-400'   },
    { label: 'Ogretmen',          value: stats.totalTeachers,    color: 'text-purple-400'   },
    { label: 'Toplam Gorev',      value: stats.totalAssignments, color: 'text-amber-400'    },
    { label: 'Toplam Uretim',     value: stats.totalSubmissions, color: 'text-green-400'    },
    { label: 'AI Kullanan Uretim',value: stats.aiUsedCount,      color: 'text-cyan-400'     },
    { label: 'Puanlanan Uretim',  value: stats.scoredCount,      color: 'text-emerald-400'  },
    { label: 'AI Log Sayisi',     value: stats.totalAiLogs,      color: 'text-slate-300'    },
  ]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">Istatistikler</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {stats.schools.length} okul aktif: {stats.schools.join(', ')}
          </p>
        </div>
        <button
          onClick={loadStats}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Yenile
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-slate-400 text-xs mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* AI Kullanım Oranı */}
      {stats.totalSubmissions > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
          <h3 className="text-white font-medium mb-3">AI Kullanim Orani</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-800 rounded-full h-3">
              <div
                className="bg-cyan-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.round((stats.aiUsedCount / stats.totalSubmissions) * 100)}%` }}
              />
            </div>
            <span className="text-cyan-400 text-sm font-semibold">
              {Math.round((stats.aiUsedCount / stats.totalSubmissions) * 100)}%
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-2">
            {stats.totalSubmissions} uretimlerin {stats.aiUsedCount} tanesinde AI kullanildi
          </p>
        </div>
      )}

      {/* Puanlama Oranı */}
      {stats.totalSubmissions > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-medium mb-3">Puanlama Orani</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-800 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.round((stats.scoredCount / stats.totalSubmissions) * 100)}%` }}
              />
            </div>
            <span className="text-emerald-400 text-sm font-semibold">
              {Math.round((stats.scoredCount / stats.totalSubmissions) * 100)}%
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-2">
            {stats.totalSubmissions} uretimlerin {stats.scoredCount} tanesi puanlandi
          </p>
        </div>
      )}
    </div>
  )
}
