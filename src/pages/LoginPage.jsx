import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { CLASS_LEVELS, ROLES } from '../firebase/schema'
import { VISUAL_PASSWORDS }
from '../components/admin/AddStudentModal'
import InstagramWidget from '../components/InstagramWidget'
import LiveMarquee from '../components/LiveMarquee'

const TABS = { LOGIN: 'login', VISUAL: 'visual', REGISTER: 'register' }

const SLOGANS = [
  "Geleceği Şekillendir",
  "Sınırları Aş",
  "Üretkenliğini Keşfet",
  "Kendi Hikayeni Yaz"
]


function normalizeStr(str) {
  if (!str) return '';
  return str.trim().toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

export default function LoginPage() {
  const { login, register } = useAuth()
  const [tab, setTab]         = useState(TABS.VISUAL) // Default to visual for students
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sloganIdx, setSloganIdx] = useState(0)
  
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [visualData, setVisualData] = useState({ fullName: '', gradeNumber: '', visualId: '' })
  const [regData, setRegData] = useState({
    fullName: '', email: '', password: '',
    role: ROLES.STUDENT, classLevel: CLASS_LEVELS.ORTAOKUL,
    gradeNumber: '', schoolCode: '',
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setSloganIdx((prev) => (prev + 1) % SLOGANS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    if (!loginData.email || !loginData.password) return setError('Kullanıcı adı ve şifre gerekli.')
    setError(''); setLoading(true)
    try {
      let loginId = loginData.email.trim();
      // If it's just a username (no @ symbol), append the default school domain
      if (!loginId.includes('@')) {
         // Assume ohep.edu.tr or similar. Since we don't know the exact school code, we can try multiple or just the default.
         // Most users are created with @ohep.edu.tr if no email was provided.
         loginId = `${loginId}@ohep.edu.tr`;
      }
      await login(loginId, loginData.password)
    } catch(err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVisualLogin(e) {
    e.preventDefault()
    if (!visualData.fullName || !visualData.gradeNumber || !visualData.visualId) {
      return setError('Lütfen Adınızı, Sınıfınızı ve Gizli Görselinizi eksiksiz girin.')
    }
    setError(''); setLoading(true)
    
    const legacyEmail = `std_${visualData.gradeNumber}_${normalizeStr(visualData.fullName)}@aistudio.com`
    const legacyPassword = `vp_${visualData.visualId}_2026!`
    
    const newEmail = `${normalizeStr(visualData.fullName).replace(/[^a-z0-9]/g, '')}_${visualData.visualId}@aistudio.com`
    const newPassword = `${visualData.visualId}_123456`

    try {
      try {
        await login(newEmail, newPassword)
      } catch (e1) {
        // Fallback for students created before this fix
        await login(legacyEmail, legacyPassword)
      }
    } catch(err) {
      setError('Giriş başarısız. İsminizi yanlış yazmış veya yanlış görsel seçmiş olabilirsiniz.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!regData.fullName || !regData.email || !regData.password || !regData.schoolCode) return setError('Lütfen tüm alanları doldurun.')
    if (regData.role === ROLES.STUDENT && !regData.gradeNumber) return setError('Lütfen sınıf seviyenizi seçin.')
    setError(''); setLoading(true)
    try {
      await register(regData)
    } catch(err) {
      setError(err.message || 'Kayıt olurken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <div className="fixed top-0 left-0 w-full z-[100]">
        <LiveMarquee />
      </div>
      
      <div className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 flex flex-col items-center justify-center relative overflow-hidden pt-12">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-[1200px] z-10 px-4 md:px-8 py-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* Left Side: Branding */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">
          <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm mb-8 shadow-lg">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">Yapay Zeka Eğitim Platformu</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400 mb-6 tracking-tight leading-tight">
            ÖHEP AI Studio
          </h1>
          
          <div className="h-20 mb-8 flex items-center justify-center lg:justify-start">
            <p className="text-2xl lg:text-4xl text-slate-300 font-medium flex gap-3 transition-all duration-500 transform">
              Yapay Zeka ile 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-bold">
                {SLOGANS[sloganIdx]}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-2 max-w-xl w-full">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-md hover:bg-slate-800/60 transition-colors shadow-lg">
              <span className="text-4xl">🤖</span>
              <div>
                <h3 className="text-white font-black text-lg">Yapay Zeka Destekli LMS</h3>
                <p className="text-slate-300 text-sm leading-relaxed mt-1">Ödevlerinizi ve projelerinizi Gemini AI ile değerlendiren yeni nesil öğrenim yönetim sistemi.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-md hover:bg-slate-800/60 transition-colors shadow-lg">
              <span className="text-4xl">📺</span>
              <div>
                <h3 className="text-white font-black text-lg">İnteraktif Canlı Sınıf</h3>
                <p className="text-slate-300 text-sm leading-relaxed mt-1">Öğretmen tahtasını öğrenci ekranına kilitleyen, canlı soru-cevap ve anlık ilerleme takibi.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-md hover:bg-slate-800/60 transition-colors shadow-lg">
              <span className="text-4xl">🎮</span>
              <div>
                <h3 className="text-white font-black text-lg">Küresel Kodlama Dünyası</h3>
                <p className="text-slate-300 text-sm leading-relaxed mt-1">Minecraft, VEXcode VR, Code.org ve koordinat tabanlı özel OHEP Amiral Battı oyunu tek çatı altında.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-md hover:bg-slate-800/60 transition-colors shadow-lg">
              <span className="text-4xl">🏆</span>
              <div>
                <h3 className="text-white font-black text-lg">Sınıf Yıldızları (OHEP Dojo)</h3>
                <p className="text-slate-300 text-sm leading-relaxed mt-1">Canlı konfeti animasyonları ile öğrencileri anında motive eden harika bir dijital rozet sistemi.</p>
              </div>
            </div>
            
            <div className="mt-2 w-full max-w-[280px]">
              <InstagramWidget />
            </div>
          </div>
        </div>

        {/* Right Side: Auth Box */}
        <div className="w-full max-w-[480px]">
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden shadow-indigo-500/20">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex bg-black/30 p-1.5 rounded-2xl mb-8 relative z-10 border border-white/10 backdrop-blur-md">
              <button onClick={() => setTab(TABS.LOGIN)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab === TABS.LOGIN ? 'bg-white/20 text-white shadow-sm border border-white/20 backdrop-blur-md' : 'text-white/50 hover:text-white/80'}`}>
                Giriş
              </button>
              <button onClick={() => setTab(TABS.REGISTER)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab === TABS.REGISTER ? 'bg-white/20 text-white shadow-sm border border-white/20 backdrop-blur-md' : 'text-white/50 hover:text-white/80'}`}>
                Kayıt
              </button>
              <button onClick={() => setTab(TABS.VISUAL)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab === TABS.VISUAL ? 'bg-indigo-600 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}>
                🦄 Görsel
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-medium flex items-start gap-3">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="relative z-10">
              {tab === TABS.VISUAL && (
                <form onSubmit={handleVisualLogin} className="space-y-5">
                  <div className="text-center mb-6">
                    <h3 className="text-white text-xl font-bold">Öğrenci Görsel Girişi</h3>
                    <p className="text-slate-400 text-sm mt-1">Adın, sınıfın ve gizli görselinle giriş yap.</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Ad Soyad</label>
                      <input type="text" value={visualData.fullName} onChange={e => setVisualData(p => ({...p, fullName: e.target.value}))}
                        placeholder="Ali Yılmaz" required
                        className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Sınıf</label>
                      <input type="number" min="1" max="12" value={visualData.gradeNumber} onChange={e => setVisualData(p => ({...p, gradeNumber: e.target.value}))}
                        placeholder="5" required
                        className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-center" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-3 text-center">Gizli Görselini Seç</label>
                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                      {VISUAL_PASSWORDS.map(vp => (
                        <button type="button" key={vp.id} onClick={() => setVisualData(p => ({...p, visualId: vp.id}))} title={vp.label}
                          className={`text-3xl p-3 rounded-2xl transition-all border-2 ${
                            visualData.visualId === vp.id ? 'bg-indigo-500/20 border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20' : 'bg-black/20 border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                          }`}>
                          {vp.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white py-4 rounded-2xl text-base font-bold transition-all shadow-lg shadow-indigo-600/30 mt-6">
                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap 🚀'}
                  </button>
                </form>
              )}

              {tab === TABS.LOGIN && (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Kullanıcı Adı veya Email</label>
                    <input type="text" value={loginData.email} onChange={e => setLoginData(p => ({...p, email: e.target.value}))}
                      placeholder="Örn: ali.yilmaz" required
                      className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Şifre</label>
                    <input type="password" value={loginData.password} onChange={e => setLoginData(p => ({...p, password: e.target.value}))}
                      placeholder="••••••••" required
                      className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 disabled:opacity-50 text-white py-4 rounded-2xl text-sm font-bold transition-all shadow-lg mt-6">
                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                  </button>
                </form>
              )}

              {tab === TABS.REGISTER && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Okul Kodu</label>
                      <input type="text" value={regData.schoolCode} onChange={e => setRegData(p => ({...p, schoolCode: e.target.value}))}
                        placeholder="OHEP" required
                        className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all uppercase" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Ad Soyad</label>
                    <input type="text" value={regData.fullName} onChange={e => setRegData(p => ({...p, fullName: e.target.value}))}
                      placeholder="Ali Yılmaz" required
                      className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Rol</label>
                    <select value={regData.role} onChange={e => setRegData(p => ({...p, role: e.target.value}))}
                      className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all">
                      <option value={ROLES.STUDENT}>Öğrenci</option>
                      <option value={ROLES.TEACHER}>Öğretmen</option>
                    </select>
                  </div>

                  {regData.role === ROLES.STUDENT && (
                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Kaçıncı Sınıf</label>
                      <input type="number" min="1" max="12" value={regData.gradeNumber} onChange={e => setRegData(p => ({...p, gradeNumber: e.target.value}))}
                        placeholder="7" required
                        className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">E-posta</label>
                      <input type="email" value={regData.email} onChange={e => setRegData(p => ({...p, email: e.target.value}))}
                        placeholder="ad@okul.edu.tr" required
                        className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Şifre</label>
                      <input type="password" value={regData.password} onChange={e => setRegData(p => ({...p, password: e.target.value}))}
                        placeholder="••••••••" required
                        className="w-full bg-black/20 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 disabled:opacity-50 text-white py-4 rounded-2xl text-sm font-bold transition-all shadow-lg mt-4">
                    {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Geliştirici İmzası */}
      <div className="absolute bottom-4 text-center z-10 w-full opacity-60 hover:opacity-100 transition-opacity">
        <p className="text-white/70 text-sm font-medium tracking-wide">
          İsmet ÇÜÇEN & AI
        </p>
      </div>
      </div>
    </div>
  )
}
