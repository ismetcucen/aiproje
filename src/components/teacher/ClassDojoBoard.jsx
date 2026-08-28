import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { awardDojoPoints } from '../../firebase/schema'

const DOJO_GRADES = ['3', '4', '5', '6', '7']

const BADGES = [
  { id: 'idea', label: 'Harika Fikir', points: 1, icon: '💡', color: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100' },
  { id: 'team', label: 'Takım Çalışması', points: 2, icon: '🤝', color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' },
  { id: 'leader', label: 'Liderlik', points: 2, icon: '👑', color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100' },
  { id: 'task', label: 'Görev Tamamlandı', points: 1, icon: '✅', color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' },
  { id: 'effort', label: 'Büyük Çaba', points: 1, icon: '💪', color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' },
  { id: 'warning', label: 'Derse Katılmadı', points: -1, icon: '⚠️', color: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' },
]

export default function ClassDojoBoard() {
  const { profile } = useAuth()
  const [selectedGrade, setSelectedGrade] = useState(DOJO_GRADES[0])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [awarding, setAwarding] = useState(false)

  // Real-time listener for students in the selected grade to keep points updated
  useEffect(() => {
    if (!profile?.schoolCode) return
    setLoading(true)
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('schoolCode', '==', profile.schoolCode)
    )
    
    const unsub = onSnapshot(q, (snap) => {
      const allStudents = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const gradeStudents = allStudents.filter(s => String(s.gradeNumber) === String(selectedGrade))
      
      // Sort by points descending, then by name
      gradeStudents.sort((a, b) => {
        if ((b.dojoPoints || 0) !== (a.dojoPoints || 0)) {
          return (b.dojoPoints || 0) - (a.dojoPoints || 0)
        }
        return (a.fullName || '').localeCompare(b.fullName || '')
      })
      
      setStudents(gradeStudents)
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })
    
    return () => unsub()
  }, [profile?.schoolCode, selectedGrade])

  async function handleGiveBadge(badge) {
    if (!selectedStudent) return
    setAwarding(true)
    try {
      await awardDojoPoints(selectedStudent.id, badge.points, badge.label)
      setSelectedStudent(null)
    } catch(err) {
      alert("Puan verilirken hata oluştu.")
    } finally {
      setAwarding(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h2 className="text-slate-800 text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
            <span>🌟</span> Sınıf Yıldızları (Dojo)
          </h2>
          <p className="text-slate-500 text-sm">Öğrencilerinize anlık rozet ve puan vererek motivasyonlarını artırın.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          {DOJO_GRADES.map(g => (
            <button key={g} onClick={() => setSelectedGrade(g)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedGrade === g ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'}`}>
              {g}. Sınıf
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 min-h-[500px] relative">
        
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 font-medium">Sınıf listesi yükleniyor...</div>
        ) : students.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400 font-medium">Bu sınıfta kayıtlı öğrenci bulunamadı.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {students.map(stu => (
              <button 
                key={stu.id} 
                onClick={() => setSelectedStudent(stu)}
                className="group flex flex-col items-center bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all active:scale-95 relative"
              >
                {/* Puan Rozeti */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white z-10">
                  {stu.dojoPoints || 0}
                </div>
                
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full border-4 border-white shadow-sm overflow-hidden mb-3 bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {stu.avatarUrl ? (
                    <img src={stu.avatarUrl} alt={stu.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-black text-indigo-300">{stu.fullName?.charAt(0)}</span>
                  )}
                </div>
                
                <p className="text-xs font-bold text-slate-700 text-center leading-tight truncate w-full">{stu.fullName}</p>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Puan Verme Modalı */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            
            <div className="p-6 text-center border-b border-slate-100 relative">
              <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full transition-colors flex items-center justify-center">✕</button>
              
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-white shadow-md overflow-hidden mb-3 bg-indigo-50 flex items-center justify-center">
                {selectedStudent.avatarUrl ? (
                  <img src={selectedStudent.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-indigo-300">{selectedStudent.fullName?.charAt(0)}</span>
                )}
              </div>
              <h3 className="font-black text-xl text-slate-800">{selectedStudent.fullName}</h3>
              <p className="text-slate-500 font-medium text-sm">Öğrenciye hangi rozeti vermek istersiniz?</p>
            </div>

            <div className="p-6 grid grid-cols-2 gap-3 bg-slate-50">
              {BADGES.map(badge => (
                <button 
                  key={badge.id}
                  disabled={awarding}
                  onClick={() => handleGiveBadge(badge)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 disabled:opacity-50 ${badge.color}`}
                >
                  <span className="text-3xl mb-2">{badge.icon}</span>
                  <span className="text-xs font-bold text-center leading-tight">{badge.label}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider mt-1 opacity-80">
                    {badge.points > 0 ? `+${badge.points}` : badge.points} Puan
                  </span>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
