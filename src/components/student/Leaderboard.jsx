import { useState, useEffect } from 'react'
import { getLeaderboard, BADGES } from '../../firebase/schema'
import { useAuth } from '../../hooks/useAuth'

export default function Leaderboard() {
  const { profile } = useAuth()
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (profile?.schoolCode) {
        const data = await getLeaderboard(profile.schoolCode)
        setLeaders(data)
      }
      setLoading(false)
    }
    load()
  }, [profile])

  if (loading) return <div className="text-center py-10 text-slate-500">Yükleniyor...</div>

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🏆</div>
        <h2 className="text-2xl font-black text-slate-800">Liderlik Tablosu</h2>
        <p className="text-slate-500 text-sm">Okulunuzdaki en aktif öğrenciler</p>
      </div>

      <div className="space-y-3">
        {leaders.map((student, idx) => {
          let badge = ''
          if (idx === 0) badge = '🥇'
          else if (idx === 1) badge = '🥈'
          else if (idx === 2) badge = '🥉'

          return (
            <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                  {badge || (idx + 1)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{student.fullName}</p>
                  <p className="text-xs text-slate-500">{student.classLevel} - {student.gradeNumber || '?'} Sınıf</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  {student.badges?.map(bId => BADGES[bId] && (
                    <span key={bId} title={BADGES[bId].title} className="text-lg cursor-help">{BADGES[bId].icon}</span>
                  ))}
                </div>
                <span className="text-xl font-black text-indigo-600">{student.xp || 0}</span>
                <span className="text-xs text-indigo-400 font-bold ml-1">XP</span>
              </div>
            </div>
          )
        })}
        {leaders.length === 0 && <p className="text-center text-slate-500">Henüz puan kazanan öğrenci yok.</p>}
      </div>
    </div>
  )
}
