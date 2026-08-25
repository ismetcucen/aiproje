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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-medium">Veriler Yükleniyor...</p>
    </div>
  )
  if (!stats)  return <div className="text-center py-20 text-red-400">Veri yüklenemedi.</div>

  const cards = [
    { label: 'Toplam Kullanıcı',  value: stats.totalUsers,       color: 'text-white',        bg: 'from-slate-700 to-slate-800', icon: '👥' },
    { label: 'Öğrenci',           value: stats.totalStudents,    color: 'text-indigo-400',   bg: 'from-indigo-900/40 to-indigo-800/20', icon: '🎓' },
    { label: 'Öğretmen',          value: stats.totalTeachers,    color: 'text-purple-400',   bg: 'from-purple-900/40 to-purple-800/20', icon: '👨‍🏫' },
    { label: 'Toplam Görev',      value: stats.totalAssignments, color: 'text-amber-400',    bg: 'from-amber-900/40 to-amber-800/20', icon: '📋' },
    { label: 'Toplam Üretim',     value: stats.totalSubmissions, color: 'text-green-400',    bg: 'from-green-900/40 to-green-800/20', icon: '🚀' },
    { label: 'AI Destekli Üretim',value: stats.aiUsedCount,      color: 'text-cyan-400',     bg: 'from-cyan-900/40 to-cyan-800/20', icon: '🤖' },
    { label: 'Puanlanan Üretim',  value: stats.scoredCount,      color: 'text-emerald-400',  bg: 'from-emerald-900/40 to-emerald-800/20', icon: '⭐' },
    { label: 'AI Log Sayısı',     value: stats.totalAiLogs,      color: 'text-slate-300',    bg: 'from-slate-800 to-slate-900', icon: '📈' },
  ]

  const aiPercentage = stats.totalSubmissions > 0 ? Math.round((stats.aiUsedCount / stats.totalSubmissions) * 100) : 0
  const scorePercentage = stats.totalSubmissions > 0 ? Math.round((stats.scoredCount / stats.totalSubmissions) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-white text-3xl font-black tracking-tight mb-1">Genel İstatistikler</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-lg">Aktif Okullar:</span>
            <p className="text-slate-400 text-sm font-medium">
              {stats.schools.length > 0 ? stats.schools.join(', ') : 'Okul Bulunamadı'}
            </p>
          </div>
        </div>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg"
        >
          <span>🔄</span> Yenile
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.bg} border border-slate-700/50 rounded-3xl p-6 relative overflow-hidden group shadow-lg`}>
            <div className="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:scale-110 transition-transform duration-500">
              {card.icon}
            </div>
            <div className="relative z-10">
              <p className={`text-4xl font-black ${card.color} mb-2`}>{card.value}</p>
              <p className="text-slate-300 text-sm font-medium uppercase tracking-wider">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Kullanım Oranı */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2"><span className="text-cyan-400">🤖</span> Yapay Zeka Kullanım Oranı</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${aiPercentage}%` }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <span className="text-cyan-400 text-2xl font-black w-16 text-right">
              {aiPercentage}%
            </span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Toplam <strong className="text-white">{stats.totalSubmissions}</strong> üretimin <strong className="text-cyan-400">{stats.aiUsedCount}</strong> tanesinde yapay zeka asistanı kullanıldı.
          </p>
        </div>

        {/* Puanlama Oranı */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2"><span className="text-emerald-400">⭐</span> Öğretmen Puanlama Oranı</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${scorePercentage}%` }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <span className="text-emerald-400 text-2xl font-black w-16 text-right">
              {scorePercentage}%
            </span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Sisteme yüklenen <strong className="text-white">{stats.totalSubmissions}</strong> üretimden <strong className="text-emerald-400">{stats.scoredCount}</strong> tanesi öğretmenler tarafından değerlendirildi.
          </p>
        </div>
      </div>
    </div>
  )
}
