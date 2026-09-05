import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LiveSessionLocker from '../../components/student/LiveSessionLocker'
import StudentStatusWidget from '../../components/student/StudentStatusWidget'
import DojoNotificationListener from '../../components/student/DojoNotificationListener'
import AvatarCreatorModal from '../../components/student/AvatarCreatorModal'
import NotificationBell from '../../components/NotificationBell'
import { logAttendance } from '../../firebase/schema'
import AssignmentList from '../../components/student/AssignmentList'
import Studio from '../../components/student/Studio'
import Portfolio from '../../components/student/Portfolio'
import StudentHome from '../../components/student/StudentHome'
import MyPortfolio from '../../components/student/MyPortfolio'
import CodingGames from '../../components/student/CodingGames'
import LessonTools from '../../components/student/LessonTools'
import Leaderboard from '../../components/student/Leaderboard'
import ShowcaseGallery from '../../components/ShowcaseGallery'
import StudentLiveChat from '../../components/student/StudentLiveChat'
import FocusTracker from '../../components/student/FocusTracker'
import AiAssistant from '../../components/student/AiAssistant'
import LiveMarquee from '../../components/LiveMarquee'
import HighSchoolAILab from '../../components/student/HighSchoolAILab'
import InstagramWidget from '../../components/InstagramWidget'
import { getSchoolSettings } from '../../firebase/schema'

const MENU = [
  { id: 'portfolio', label: 'Benim Portfolyom', icon: '🏆' },
  { id: 'home',        label: 'Ana Sayfa', icon: '🏠' },
  { id: 'assignments', label: 'Görevler',  icon: '📋' },
  { id: 'studio',      label: 'Üret',      icon: '✏️' },
  { id: 'portfolio',   label: 'Portfolyo', icon: '🗂️' },
  { id: 'leaderboard', label: 'Sıralama', icon: '🏆' },
  { id: 'showcase', label: 'Vitrin', icon: '🌟' },

  
]

export default function StudentPanel() {
  const { user, profile, logout } = useAuth()
  const [active, setActive]                     = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
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
  const [settings, setSettings] = useState({ codingModuleEnabled: false, aiAssistantEnabled: false })

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
    <>
      <LiveSessionLocker />
      <StudentStatusWidget />
      <DojoNotificationListener />
    <div className="h-screen bg-[#f4f7fc] flex overflow-hidden relative w-full">

      {/* Sol Menü */}
      <aside className={`bg-[#faf8f5] border-r border-amber-900/10 flex flex-col transition-all duration-300 shadow-2xl relative z-20 overflow-hidden z-50 flex-shrink-0 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"} ${isMobileMenuOpen ? "absolute h-full left-0 shadow-2xl" : "hidden md:flex relative h-full"}`}>
        <div className="p-5 border-b border-amber-900/10 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 border border-white/30">
            <img src="/ohep.jpeg" alt="Logo" className="w-6 h-6 object-contain rounded-md" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-slate-800 text-sm font-bold tracking-wide leading-tight whitespace-nowrap">ÖHEP AI Studio</p>
              <p className="text-slate-500 text-xs font-medium mt-0.5 whitespace-nowrap">Öğrenci Paneli</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {[
            ...MENU, 
            ...(settings.messagingEnabled ? [{ id: 'chat', label: 'Mesajlar', icon: '💬' }] : []),
            ...(settings.codingModuleEnabled ? [
              { id: "games", label: "Oyunlar", icon: "🎮" }, 
              { id: "tools", label: "Araçlar", icon: "🛠️" },
              ...(profile?.gradeNumber >= 9 ? [{ id: "ailab", label: "Lise Yapay Zeka", icon: "🧠" }] : []),
              ...(settings.aiAssistantEnabled ? [{ id: 'ai', label: 'OHEP AI', icon: '🤖' }] : [])
            ] : [])
          ].map(item => (
            <button key={item.id} onClick={() => { setActive(item.id); if(window.innerWidth < 768) setIsMobileMenuOpen(false); }}
              title={!sidebarOpen ? item.label : ""}
              className={`w-full flex items-center justify-start px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active === item.id
                  ? 'bg-white text-indigo-700 border border-slate-200/60 shadow-sm'
                  : 'text-slate-600 hover:text-indigo-700 hover:bg-white/60 border border-transparent'
              }`}>
              <span className={`text-lg flex-shrink-0 transition-transform duration-200 ${active === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              {sidebarOpen && <span className="ml-3 truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <InstagramWidget />
        </div>



        <div className="p-4 border-t border-amber-900/10 bg-amber-900/5 relative z-10">
          <div className="px-2 mb-3 flex items-center gap-3">
              <button onClick={() => setShowAvatarModal(true)} title="Avatarı Değiştir" className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden flex-shrink-0 relative group hover:border-white transition-colors bg-white/10">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">{profile?.fullName?.charAt(0)}</div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs">✏️</span>
                </div>
              </button>
              <div>
            <p className="text-slate-800 text-sm font-bold truncate">{profile?.fullName}</p>
              {(profile?.gradeNumber && ['3','4','5','6','7'].includes(String(profile.gradeNumber))) && (
                <div className="flex items-center gap-1 mt-0.5 bg-yellow-500/20 text-yellow-300 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/30 w-max font-bold">
                  <span>⭐️</span> {profile?.dojoPoints || 0} Puan
                </div>
              )}
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                {profile?.classLevel} {profile?.gradeNumber ? `· ${profile.gradeNumber}. SINIF` : ''}
              </p>
            </div>
            </div>
          </div>
          <button onClick={logout}
            title={!sidebarOpen ? "Çıkış Yap" : ""}
            className={`w-full flex items-center ${sidebarOpen ? "justify-start px-3" : "justify-center px-0"} px-3 py-2.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 text-sm font-medium transition-all group border border-transparent hover:border-red-200`}>
            <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">🚪</span>
            {sidebarOpen && <span className="ml-3">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Ana İçerik */}
      {isMobileMenuOpen && <div className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <main className="flex-1 flex flex-col overflow-hidden w-full h-full">
        <FocusTracker />
        <header className="bg-white/70 backdrop-blur-xl border-b border-indigo-100/50 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-slate-800 font-bold text-lg leading-tight">
                {[...MENU, { id: 'games', label: 'Oyunlar' }, { id: 'tools', label: 'Araçlar' }, { id: 'ailab', label: 'Lise Yapay Zeka' }, { id: 'ai', label: 'OHEP AI' }].find(m => m.id === active)?.label}
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
        
        <LiveMarquee />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {active === 'home'        && <StudentHome onNavigate={setActive} />}
          {active === 'assignments' && <AssignmentList onStart={goToStudio} />}
          {active === 'studio'      && <Studio assignment={selectedAssignment} onBack={() => setActive('assignments')} />}
          {active === 'portfolio'   && <Portfolio />}
          {active === 'portfolio'   && <MyPortfolio />}
          {active === 'games'       && <CodingGames />}
          {active === 'tools'       && <LessonTools />}
          {active === 'leaderboard' && <Leaderboard />}
          {active === 'showcase'    && <ShowcaseGallery />}
          {active === 'ai'          && <AiAssistant />}
          {active === 'ailab'       && <HighSchoolAILab />}
          {active === 'chat'        && <StudentLiveChat />}
        </div>
      </main>
      {settings.messagingEnabled && <StudentLiveChat />}
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
    </>
  )
}
