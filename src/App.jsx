import { useAuth, AuthProvider } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import TeacherPanel from './pages/teacher/TeacherPanel'
import StudentPanel from './pages/student/StudentPanel'
import AdminPanel from './pages/admin/AdminPanel'
import ParentPortfolio from './pages/ParentPortfolio'
import OhepAssistant from './components/OhepAssistant'

function AppContent() {
  
  const path = window.location.pathname;
  if (path.startsWith('/p/')) {
    const studentId = path.split('/')[2];
    return <ParentPortfolio studentId={studentId} />
  }

  const { user, profile } = useAuth()

  if (!user || !profile) return <LoginPage />
  if (profile.role === 'admin')   return <AdminPanel />
  if (profile.role === 'teacher') return <TeacherPanel />
  if (profile.role === 'student') return <StudentPanel />

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-white">Rol tanimlanamadi. Lutfen tekrar giris yapin.</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <OhepAssistant />
    </AuthProvider>
  )
}
