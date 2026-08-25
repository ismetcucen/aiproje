import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import AssignmentForm from '../../components/teacher/AssignmentForm'
import Attendance from '../../components/teacher/Attendance'
import StudentList from '../../components/teacher/StudentList'
import SubmissionsList from '../../components/teacher/SubmissionsList'
import CurriculumAssigner from '../../components/teacher/CurriculumAssigner'

const MENU = [
  { id: 'curriculum',  label: 'Müfredat',   icon: '📚' },
  { id: 'assignments', label: 'Görevler',   icon: '📋' },
  { id: 'students',    label: 'Öğrenciler', icon: '👥' },
  { id: 'attendance',  label: 'Yoklama',    icon: '✅' },
  { id: 'submissions', label: 'Üretimler',  icon: '📝' },
]

export default function TeacherPanel() {
  const { profile, logout } = useAuth()
  const [active,      setActive]      = useState('curriculum')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sol Menü */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-slate-200 flex flex-col transition-all duration-200 shadow-sm`}>
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xl font-bold">+</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-slate-800 text-sm font-semibold leading-tight">ÖHEP AI Studio</p>
              <p className="text-slate-500 text-xs">Öğretmen Paneli</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {MENU.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active === item.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-1">
              <p className="text-slate-800 text-sm font-medium truncate">{profile?.fullName}</p>
              <p className="text-slate-500 text-xs">{profile?.schoolCode}</p>
            </div>
          )}
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm transition-colors">
            <span className="text-base flex-shrink-0">🚪</span>
            {sidebarOpen && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(p => !p)}
              className="text-slate-400 hover:text-slate-600 transition-colors text-xl">☰</button>
            <h1 className="text-slate-800 font-semibold">
              {MENU.find(m => m.id === active)?.label}
            </h1>
          </div>
          <div className="text-slate-500 text-sm">
            Okul: <span className="text-slate-800 font-medium">{profile?.schoolCode}</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {active === 'curriculum'  && <CurriculumAssigner />}
          {active === 'assignments' && <AssignmentForm />}
          {active === 'students'    && <StudentList />}
          {active === 'attendance'  && <Attendance />}
          {active === 'submissions' && <SubmissionsList />}
        </div>
      </main>
    </div>
  )
}
