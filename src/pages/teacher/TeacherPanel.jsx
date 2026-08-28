import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import NotificationBell from '../../components/NotificationBell'
import CodingGames from '../../components/student/CodingGames'
import LessonTools from '../../components/student/LessonTools'
import HighSchoolAILab from '../../components/student/HighSchoolAILab'
import AssignmentForm from '../../components/teacher/AssignmentForm'
import Attendance from '../../components/teacher/Attendance'
import StudentList from '../../components/teacher/StudentList'
import SubmissionsList from '../../components/teacher/SubmissionsList'
import CurriculumAssigner from '../../components/teacher/CurriculumAssigner'
import ClassSettings from '../../components/teacher/ClassSettings'
import LiveClassControl from '../../components/teacher/LiveClassControl'

const MENU = [
  { id: 'curriculum',  label: 'Müfredat',   icon: '📚' },
  { id: 'assignments', label: 'Görevler',   icon: '📋' },
  { id: 'students',    label: 'Öğrenciler', icon: '👥' },
  { id: 'attendance',  label: 'Yoklama',    icon: '✅' },
  { id: 'submissions', label: 'Üretimler',  icon: '📝' },
  { id: 'games', label: 'Oyunlar', icon: '🎮' },
  { id: 'tools', label: 'Araçlar', icon: '🛠️' },
  { id: 'ailab', label: 'Lise AI Lab', icon: '🧠' },
  { id: 'live', label: 'Canlı Sınıf', icon: '📡' },
  { id: 'settings', label: 'Ayarlar', icon: '⚙️' },
]

export default function TeacherPanel() {
  const { profile, logout } = useAuth()
  const [active,      setActive]      = useState('curriculum')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[#f4f7fc] flex">

      {/* Sol Menü */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 shadow-2xl relative z-20`}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 border border-blue-400/20">
            <img src="/ohep.jpeg" alt="Logo" className="w-6 h-6 object-contain rounded-md" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-slate-100 text-sm font-bold tracking-wide leading-tight whitespace-nowrap">ÖHEP AI Studio</p>
              <p className="text-blue-400 text-xs font-medium mt-0.5 whitespace-nowrap">Öğretmen Paneli</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {MENU.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              title={!sidebarOpen ? item.label : ''}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center px-0'} py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active === item.id
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-inner'
                  : 'text-indigo-100 hover:text-white hover:bg-white/10 border border-transparent'
              }`}>
              <span className={`text-lg flex-shrink-0 transition-transform duration-200 ${active === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              {sidebarOpen && <span className="ml-3 truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10 relative z-10">
          {sidebarOpen && (
            <div className="px-2 mb-3">
              <p className="text-white text-sm font-bold truncate">{profile?.fullName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">{profile?.schoolCode}</p>
              </div>
            </div>
          )}
          <button onClick={logout}
            title={!sidebarOpen ? 'Çıkış Yap' : ''}
            className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-pink-200 hover:text-white hover:bg-pink-500/20 text-sm font-medium transition-all group border border-transparent hover:border-pink-400/30`}>
            <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">🚪</span>
            {sidebarOpen && <span className="ml-3">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/70 backdrop-blur-xl border-b border-indigo-100/50 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(p => !p)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h1 className="text-slate-800 font-bold text-lg leading-tight">
                {MENU.find(m => m.id === active)?.label}
              </h1>
              <p className="text-slate-400 text-xs font-medium">Yönetim ve Takip</p>
            </div>
          </div>
          <NotificationBell />
          <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <span className="text-xl">🎓</span>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Aktif Okul</p>
              <p className="text-slate-700 text-xs font-bold leading-none">{profile?.schoolCode}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {active === 'curriculum'  && <CurriculumAssigner />}
          {active === 'assignments' && <AssignmentForm />}
          {active === 'students'    && <StudentList />}
          {active === 'attendance'  && <Attendance />}
          {active === 'submissions' && <SubmissionsList />}
          {active === 'games'       && <CodingGames />}
          {active === 'tools'       && <LessonTools />}
          {active === 'ailab'       && <HighSchoolAILab />}
          {active === 'settings' && <ClassSettings />}
          {active === 'live' && <LiveClassControl />}
        </div>
      </main>
    </div>
  )
}
