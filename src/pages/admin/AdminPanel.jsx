import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import UserManager from '../../components/admin/UserManager'
import SchoolCodes from '../../components/admin/SchoolCodes'
import Stats from '../../components/admin/Stats'
import CurriculumManager from '../../components/admin/CurriculumManager'

const MENU = [
  { id: 'stats',      label: 'İstatistikler' },
  { id: 'users',      label: 'Kullanıcılar'  },
  { id: 'curriculum', label: 'Müfredat'      },
  { id: 'schools',    label: 'Okul Kodları'  },
]

export default function AdminPanel() {
  const { profile, logout } = useAuth()
  const [active, setActive] = useState('stats')

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">A</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">AI Uretim</p>
            <p className="text-red-400 text-xs">Admin Paneli</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {MENU.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active === item.id
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-sm font-medium truncate">{profile?.fullName}</p>
            <p className="text-red-400 text-xs">Admin</p>
          </div>
          <button
            onClick={logout}
            className="w-full px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors text-left"
          >
            Cikis Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-white font-semibold">
            {MENU.find(m => m.id === active)?.label}
          </h1>
          <span className="text-xs bg-red-900/50 text-red-300 border border-red-800 px-2 py-1 rounded-full">
            Admin Erisimi
          </span>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {active === 'stats'      && <Stats />}
          {active === 'users'      && <UserManager />}
          {active === 'curriculum' && <CurriculumManager />}
          {active === 'schools'    && <SchoolCodes />}
        </div>
      </main>
    </div>
  )
}
