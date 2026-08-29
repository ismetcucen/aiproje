import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import NotificationBell from '../../components/NotificationBell'
import RobotAnnouncer from '../../components/teacher/RobotAnnouncer'
import CodingGames from '../../components/student/CodingGames'
import LessonTools from '../../components/student/LessonTools'
import HighSchoolAILab from '../../components/student/HighSchoolAILab'
import AIEducationTools from '../../components/admin/AIEducationTools'
import UserManager from '../../components/admin/UserManager'
import RoboticProjects from '../../components/admin/RoboticProjects'
import TubitakProjects from '../../components/admin/TubitakProjects'
import CalendarPlanner from '../../components/CalendarPlanner'
import Announcements from '../../components/admin/Announcements'
import ShowcaseGallery from '../../components/ShowcaseGallery'
import LiveChatInbox from '../../components/teacher/LiveChatInbox'
import Stats from '../../components/admin/Stats'
import ClassManager from '../../components/admin/ClassManager'
import CurriculumEditor from '../../components/admin/CurriculumEditor'
import ClassSettings from '../../components/teacher/ClassSettings'
import ClassDojoBoard from '../../components/teacher/ClassDojoBoard'
import LiveClassControl from '../../components/teacher/LiveClassControl'
import Attendance from '../../components/teacher/Attendance'

const MENU = [
  { id: 'calendar',   label: 'Ajanda', icon: '📅' },
  { id: 'tools', label: 'Araçlar', icon: '🛠️' },
  { id: 'settings',   label: 'Ayarlar',      icon: '⚙️' },
  { id: 'live',       label: 'Canlı Sınıf',  icon: '📡' },
  { id: 'announcements', label: 'Duyurular', icon: '📢' },
  { id: 'aiedu', label: 'Eğitimde YZ', icon: '🏫' },
  { id: 'stats',      label: 'İstatistikler', icon: '📊' },
  { id: 'users',      label: 'Kullanıcılar',  icon: '👥' },
  { id: 'ailab', label: 'Lise AI Lab', icon: '🧠' },
  { id: 'qna', label: 'Mesajlar', icon: '💬' },
  { id: 'curriculum', label: 'Müfredat',      icon: '📚' },
  { id: 'games', label: 'Oyunlar', icon: '🎮' },
  { id: 'robotic',    label: 'Robotik Projeler', icon: '🦾' },
  { id: 'classes',    label: 'Sınıflar',      icon: '🏫' },
  { id: 'dojo',       label: 'Sınıf Yıldızları', icon: '🌟' },
  { id: 'tubitak',    label: 'Tübitak & Teknofest', icon: '🏆' },
  { id: 'showcase', label: 'Vitrin', icon: '🏆' },
  { id: 'attendance', label: 'Yoklama',      icon: '✅' },
]

export default function AdminPanel() {
  const { profile, logout } = useAuth()
  const [active, setActive] = useState('stats')

  return (
    <div className="min-h-screen bg-[#f4f7fc] flex">
      <aside className="w-64 bg-gradient-to-b from-indigo-600 via-purple-600 to-fuchsia-600 border-r border-fuchsia-500/30 flex flex-col transition-all duration-300 shadow-2xl relative z-20 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20 border border-red-400/20">
            <img src="/ohep.jpeg" alt="Logo" className="w-6 h-6 object-contain rounded-md" />
          </div>
          <div className="overflow-hidden">
            <p className="text-slate-100 text-sm font-bold tracking-wide leading-tight whitespace-nowrap">ÖHEP AI Studio</p>
            <p className="text-red-400 text-xs font-medium mt-0.5 whitespace-nowrap">Sistem Yöneticisi</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {MENU.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center justify-start px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active === item.id
                  ? 'bg-red-600/15 text-red-400 border border-red-500/20 shadow-inner'
                  : 'text-indigo-100 hover:text-white hover:bg-white/10 border border-transparent'
              }`}>
              <span className={`text-lg flex-shrink-0 transition-transform duration-200 ${active === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              <span className="ml-3 truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10 relative z-10">
          <div className="px-2 mb-3">
            <p className="text-white text-sm font-bold truncate">{profile?.fullName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Yetkili Hesap</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-start px-3 py-2.5 rounded-xl text-pink-200 hover:text-white hover:bg-pink-500/20 text-sm font-medium transition-all group border border-transparent hover:border-pink-400/30">
            <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">🚪</span>
            <span className="ml-3">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-slate-800 font-semibold">{MENU.find(m => m.id === active)?.label}</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-red-50 text-red-500 border border-red-200 px-2 py-1 rounded-full">Admin Erişimi</span>
            <RobotAnnouncer />
            <NotificationBell />
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {active === 'stats'      && <Stats />}
          {active === 'classes'    && <ClassManager schoolCode={profile?.schoolCode} />}
          {active === 'curriculum' && <CurriculumEditor />}
          {active === 'users'      && <UserManager />}
          {active === 'robotic'    && <RoboticProjects />}
          {active === 'tubitak'    && <TubitakProjects />}
          {active === 'calendar'   && <CalendarPlanner />}
          {active === 'announcements' && <Announcements />}
          {active === 'qna'           && <LiveChatInbox />}
          {active === 'showcase'      && <ShowcaseGallery />}
          {active === 'attendance' && <Attendance />}
          {active === 'games'       && <CodingGames />}
          {active === 'tools'       && <LessonTools />}
          {active === 'ailab'       && <HighSchoolAILab />}
          {active === 'aiedu'       && <AIEducationTools />}
          {active === 'settings'   && <ClassSettings />}
          {active === 'live'       && <LiveClassControl />}
          {active === 'dojo'       && <ClassDojoBoard />}
        </div>
      </main>
    </div>
  )
}
