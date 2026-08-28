import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import NotificationBell from '../../components/NotificationBell'
import { logAttendance } from '../../firebase/schema'
import AssignmentList from '../../components/student/AssignmentList'
import Studio from '../../components/student/Studio'
import Portfolio from '../../components/student/Portfolio'
import StudentHome from '../../components/student/StudentHome'
import CodingGames from '../../components/student/CodingGames'
import LessonTools from '../../components/student/LessonTools'
import Leaderboard from '../../components/student/Leaderboard'
import ShowcaseGallery from '../../components/ShowcaseGallery'
import StudentQnaWidget from '../../components/student/StudentQnaWidget'
import AiAssistant from '../../components/student/AiAssistant'
import LiveMarquee from '../../components/LiveMarquee'
import HighSchoolAILab from '../../components/student/HighSchoolAILab'
import { getSchoolSettings } from '../../firebase/schema'

const MENU = [
  { id: 'home',        label: 'Ana Sayfa', icon: '🏠' },
  { id: 'assignments', label: 'Görevler',  icon: '📋' },
  { id: 'studio',      label: 'Üret',      icon: '✏️' },
  { id: 'portfolio',   label: 'Portfolyo', icon: '🗂️' },
]

export default function StudentPanel() {
  const { user, profile, logout } = useAuth()
  const [active, setActive]                     = useState('home')
  const [showRules, setShowRules] = useState(!localStorage.getItem('aiLabRulesAccepted_v3'))

  useEffect(() => {
    if (!localStorage.getItem('aiLabRulesAccepted_v3')) {
      setShowRules(true)
    }
  }, [])

  const acceptRules = () => {
    localStorage.setItem('aiLabRulesAccepted_v3', 'true')
    setShowRules(false)
  }
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [settings, setSettings] = useState({ codingModuleEnabled: false })

  useEffect(() => {
    if (user?.uid) {
      logAttendance(user.uid).catch(console.error)
      if (true) {
        getSchoolSettings("global_school").then(s => setSettings(s)).catch(console.error)
      }
    }
  }, [user, profile])

  function goToStudio(assignment) {
    setSelectedAssignment(assignment)
    setActive('studio')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sol Menü */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 shadow-2xl relative z-20">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
            <img src="/ohep.jpeg" alt="Logo" className="w-6 h-6 object-contain rounded-md" />
          </div>
          <div className="overflow-hidden">
            <p className="text-slate-100 text-sm font-bold tracking-wide leading-tight whitespace-nowrap">ÖHEP AI Studio</p>
            <p className="text-indigo-400 text-xs font-medium mt-0.5 whitespace-nowrap">Öğrenci Paneli</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {[
            ...MENU, 
            ...(settings.codingModuleEnabled ? [
              { id: "games", label: "Oyunlar", icon: "🎮" }, 
              { id: "tools", label: "Araçlar", icon: "🛠️" },
              ...(profile?.gradeNumber >= 9 ? [{ id: "ailab", label: "Lise Yapay Zeka", icon: "🧠" }] : [])
            ] : [])
          ].map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center justify-start px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active === item.id
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}>
              <span className={`text-lg flex-shrink-0 transition-transform duration-200 ${active === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              <span className="ml-3 truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="px-2 mb-3">
            <p className="text-slate-200 text-sm font-bold truncate">{profile?.fullName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                {profile?.classLevel} {profile?.gradeNumber ? `· ${profile.gradeNumber}. SINIF` : ''}
              </p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-start px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all group border border-transparent hover:border-red-500/20">
            <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">🚪</span>
            <span className="ml-3">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-slate-800 font-bold text-lg leading-tight">
                {MENU.find(m => m.id === active)?.label}
              </h1>
              <p className="text-slate-400 text-xs font-medium">Çalışma Alanı</p>
            </div>
          </div>
          <NotificationBell />
          <div className="hidden md:flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            <span className="text-xl">🏫</span>
            <div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider leading-none mb-0.5">Okul</p>
              <p className="text-indigo-700 text-xs font-bold leading-none">{profile?.schoolCode}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {active === 'home'        && <StudentHome onNavigate={setActive} />}
          {active === 'assignments' && <AssignmentList onStart={goToStudio} />}
          {active === 'studio'      && <Studio assignment={selectedAssignment} onBack={() => setActive('assignments')} />}
          {active === 'portfolio'   && <Portfolio />}
          {active === 'games'       && <CodingGames />}
          {active === 'tools'       && <LessonTools />}
          {active === 'leaderboard' && <Leaderboard />}
          {active === 'showcase'    && <ShowcaseGallery />}
          {active === 'ai'          && <AiAssistant />}
          {active === 'ailab'       && <HighSchoolAILab />}
        </div>
      </main>
      {showRules && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
              <span className="text-4xl block mb-2">🤖</span>
              <h2 className="text-2xl font-bold">Yapay Zeka Lab Kuralları</h2>
            </div>
            <div className="p-6 space-y-5 text-slate-600 text-sm">
              <div className="flex gap-3 items-start">
                <span className="text-xl">🎓</span>
                <p><strong className="text-slate-800">Eğitim Amaçlı Kullanım:</strong> Yapay zeka araçlarını sadece ders ve öğrenme amaçlı kullanın. Oyun oynamak veya konu dışı arayışlara girmek yasaktır.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl">🤝</span>
                <p><strong className="text-slate-800">Etik ve Saygı:</strong> Ürettiğiniz içeriklerde etik kurallara uyun. Kopya çekmek, zorbalık yapmak veya zararlı içerik üretmek kesinlikle yasaktır.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl">🔒</span>
                <p><strong className="text-slate-800">Kişisel Veri Güvenliği:</strong> AI botlarına TC Kimlik numarası, adres, şifre vb. kişisel bilgilerinizi ASLA yazmayın.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl">🖥️</span>
                <p><strong className="text-slate-800">Ekipman Güvenliği:</strong> Bilgisayarlara ve ekipmanlara özen gösterin, izinsiz program kurmayın.</p>
              </div>
              <div className="flex gap-3 items-start text-red-600">
                <span className="text-xl">🚫</span>
                <p><strong className="text-red-700">Sistem Kilitleme:</strong> Ders dışı oyun, internet sitesi veya uygulama açan öğrencilerin bilgisayarları anında kilitlenecektir.</p>
              </div>
              <div className="flex gap-3 items-start text-red-600">
                <span className="text-xl">📡</span>
                <p><strong className="text-red-700">İzleme ve Kayıt:</strong> Hangi bilgisayarda oturduğunuz ve IP adresiniz sistemde şahsi hesabınızla eşleştirilerek takip edilmekte ve kayıt altına alınmaktadır.</p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={acceptRules}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95">
                Okudum ve Kabul Ediyorum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
