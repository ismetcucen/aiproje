import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import UserManager from '../../components/admin/UserManager'
import SchoolCodes from '../../components/admin/SchoolCodes'
import Stats from '../../components/admin/Stats'
import ClassManager from '../../components/admin/ClassManager'
import CurriculumEditor from '../../components/admin/CurriculumEditor'

const MENU = [
  { id: 'stats',      label: 'İstatistikler', icon: '📊' },
  { id: 'classes',    label: 'Sınıflar',      icon: '🏫' },
  { id: 'curriculum', label: 'Müfredat',      icon: '📚' },
  { id: 'users',      label: 'Kullanıcılar',  icon: '👥' },
  { id: 'schools',    label: 'Okul Kodları',  icon: '🔑' },
]

export default function AdminPanel() {
  const { profile, logout } = useAuth()
  const [active, setActive] = useState('stats')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xl font-bold">A</span>
          </div>
          <div>
            <p className="text-slate-800 text-sm font-semibold leading-tight">ÖHEP AI Studio</p>
            <p className="text-red-500 text-xs">Admin Paneli</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {MENU.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active === item.id
                  ? 'bg-red-50 text-red-600'
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
            <p className="text-red-500 text-xs">Admin</p>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm transition-colors">
            <span>🚪</span>
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-slate-800 font-semibold">{MENU.find(m => m.id === active)?.label}</h1>
          <span className="text-xs bg-red-50 text-red-500 border border-red-200 px-2 py-1 rounded-full">Admin Erişimi</span>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {active === 'stats'      && <Stats />}
          {active === 'classes'    && <ClassManager schoolCode={profile?.schoolCode} />}
          {active === 'curriculum' && <CurriculumEditor />}
          {active === 'users'      && <UserManager />}
          {active === 'schools'    && <SchoolCodes />}
        </div>
      </main>
    </div>
  )
}
