import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import AssignmentForm from '../../components/teacher/AssignmentForm'
import StudentList from '../../components/teacher/StudentList'
import SubmissionsList from '../../components/teacher/SubmissionsList'

const MENU = [
  { id: 'assignments', label: 'Gorevler'   },
  { id: 'students',    label: 'Ogrenciler' },
  { id: 'submissions', label: 'Uretimler'  },
]

export default function TeacherPanel() {
  const { profile, logout } = useAuth()
  const [active, setActive]           = useState('assignments')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">+</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-white text-sm font-semibold leading-tight">AI Uretim</p>
              <p className="text-slate-400 text-xs">Ogretmen Paneli</p>
            </div>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {MENU.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-1">
              <p className="text-white text-sm font-medium truncate">{profile?.fullName}</p>
              <p className="text-slate-400 text-xs">{profile?.schoolCode}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
          >
            {sidebarOpen && <span>Cikis Yap</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(p => !p)}
              className="text-slate-400 hover:text-white transition-colors text-xl"
            >
              =
            </button>
            <h1 className="text-white font-semibold">
              {MENU.find(m => m.id === active)?.label}
            </h1>
          </div>
          <div className="text-slate-400 text-sm">
            Okul: <span className="text-white font-medium">{profile?.schoolCode}</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {active === 'assignments' && <AssignmentForm />}
          {active === 'students'    && <StudentList />}
          {active === 'submissions' && <SubmissionsList />}
        </div>
      </main>
    </div>
  )
}
