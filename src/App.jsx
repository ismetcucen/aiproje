import { useAuth, AuthProvider } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import TeacherPanel from './pages/teacher/TeacherPanel'
import StudentPanel from './pages/student/StudentPanel'
import AdminPanel from './pages/admin/AdminPanel'
import ParentPortfolio from './pages/ParentPortfolio'
import DigitalBoardViewer from './pages/DigitalBoardViewer'
import OhepAssistant from './components/OhepAssistant'

function AppContent() {
  
  const { user, profile } = useAuth()

  const path = window.location.pathname;
  if (path === '/pano') return <DigitalBoardViewer />

  if (path.startsWith('/p/') || path.startsWith('/portfolio/')) {
    const parts = path.split('/');
    const studentId = parts[parts.length - 1]; // Takes the last part, robust for both
    return <ParentPortfolio studentId={studentId} />
  }

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
