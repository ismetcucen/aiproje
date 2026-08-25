import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { logAttendance } from '../../firebase/schema'
import AssignmentList from '../../components/student/AssignmentList'
import Studio from '../../components/student/Studio'
import Portfolio from '../../components/student/Portfolio'
import StudentHome from '../../components/student/StudentHome'

const MENU = [
  { id: 'home',        label: 'Ana Sayfa', icon: '🏠' },
  { id: 'assignments', label: 'Görevler',  icon: '📋' },
  { id: 'studio',      label: 'Üret',      icon: '✏️' },
  { id: 'portfolio',   label: 'Portfolyo', icon: '🗂️' },
]

export default function StudentPanel() {
  const { user, profile, logout } = useAuth()
  const [active, setActive]                     = useState('home')
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  useEffect(() => {
    if (user?.uid) {
      logAttendance(user.uid).catch(console.error)
    }
  }, [user])

  function goToStudio(assignment) {
    setSelectedAssignment(assignment)
    setActive('studio')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sol Menü */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xl font-bold">+</span>
          </div>
          <div>
            <p className="text-slate-800 text-sm font-semibold leading-tight">ÖHEP AI Studio</p>
            <p className="text-slate-500 text-xs">Öğrenci Paneli</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {MENU.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="px-3 py-2 mb-1">
            <p className="text-slate-800 text-sm font-medium truncate">{profile?.fullName}</p>
            <p className="text-slate-500 text-xs">
              {profile?.classLevel} {profile?.gradeNumber ? `· ${profile.gradeNumber}. sınıf` : ''}
            </p>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm transition-colors">
            <span>🚪</span>
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-slate-800 font-semibold">
            {MENU.find(m => m.id === active)?.label}
          </h1>
          <div className="text-slate-500 text-sm">{profile?.schoolCode}</div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {active === 'home'        && <StudentHome onNavigate={setActive} />}
          {active === 'assignments' && <AssignmentList onStart={goToStudio} />}
          {active === 'studio'      && <Studio assignment={selectedAssignment} onBack={() => setActive('assignments')} />}
          {active === 'portfolio'   && <Portfolio />}
        </div>
      </main>
    </div>
  )
}
