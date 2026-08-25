import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { CLASS_LEVELS, ROLES } from '../firebase/schema'
import { VISUAL_PASSWORDS } from '../components/admin/AddStudentModal'

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
    if (!loginData.email || !loginData.password) return setError('Email ve şifre gerekli.')
    setError(''); setLoading(true)
    try {
      await login(loginData.email.trim(), loginData.password)
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
    
    const computedEmail = `std_${visualData.gradeNumber}_${normalizeStr(visualData.fullName)}@aistudio.com`
    const computedPassword = `vp_${visualData.visualId}_2026!`
    
    try {
      await login(computedEmail, computedPassword)
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
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

          <div className="grid grid-cols-2 gap-4 max-w-lg mt-4">
            {[
              { i: '🚀', t: 'Yeni Nesil Öğrenme' },
              { i: '🤖', t: 'AI Destekli' },
              { i: '🎨', t: 'Üretkenlik' },
              { i: '🏆', t: 'Dijital Portfolyo' }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-4 shadow-sm hover:bg-slate-800/50 transition-colors">
                <span className="text-2xl">{f.i}</span>
                <span className="text-slate-300 text-sm font-semibold">{f.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Box */}
        <div className="w-full max-w-[480px]">
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-8 relative z-10 border border-slate-800/50">
              <button onClick={() => setTab(TABS.VISUAL)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab === TABS.VISUAL ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                🦄 Görsel
              </button>
              <button onClick={() => setTab(TABS.LOGIN)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab === TABS.LOGIN ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}>
                Giriş
              </button>
              <button onClick={() => setTab(TABS.REGISTER)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab === TABS.REGISTER ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}>
                Kayıt
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
                        className="w-full bg-slate-950/50 border border-slate-700 text-white font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Sınıf</label>
                      <input type="number" min="1" max="12" value={visualData.gradeNumber} onChange={e => setVisualData(p => ({...p, gradeNumber: e.target.value}))}
                        placeholder="5" required
                        className="w-full bg-slate-950/50 border border-slate-700 text-white font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-center" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-3 text-center">Gizli Görselini Seç</label>
                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                      {VISUAL_PASSWORDS.map(vp => (
                        <button type="button" key={vp.id} onClick={() => setVisualData(p => ({...p, visualId: vp.id}))} title={vp.label}
                          className={`text-3xl p-3 rounded-2xl transition-all border-2 ${
                            visualData.visualId === vp.id ? 'bg-indigo-500/20 border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20' : 'bg-slate-950/50 border-slate-800 hover:border-slate-600 opacity-60 hover:opacity-100'
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
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">E-posta</label>
                    <input type="email" value={loginData.email} onChange={e => setLoginData(p => ({...p, email: e.target.value}))}
                      placeholder="ad@okul.edu.tr" required
                      className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Şifre</label>
                    <input type="password" value={loginData.password} onChange={e => setLoginData(p => ({...p, password: e.target.value}))}
                      placeholder="••••••••" required
                      className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
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
                        className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all uppercase" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Ad Soyad</label>
                    <input type="text" value={regData.fullName} onChange={e => setRegData(p => ({...p, fullName: e.target.value}))}
                      placeholder="Ali Yılmaz" required
                      className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Rol</label>
                    <select value={regData.role} onChange={e => setRegData(p => ({...p, role: e.target.value}))}
                      className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all">
                      <option value={ROLES.STUDENT}>Öğrenci</option>
                      <option value={ROLES.TEACHER}>Öğretmen</option>
                    </select>
                  </div>

                  {regData.role === ROLES.STUDENT && (
                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Kaçıncı Sınıf</label>
                      <input type="number" min="1" max="12" value={regData.gradeNumber} onChange={e => setRegData(p => ({...p, gradeNumber: e.target.value}))}
                        placeholder="7" required
                        className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">E-posta</label>
                      <input type="email" value={regData.email} onChange={e => setRegData(p => ({...p, email: e.target.value}))}
                        placeholder="ad@okul.edu.tr" required
                        className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Şifre</label>
                      <input type="password" value={regData.password} onChange={e => setRegData(p => ({...p, password: e.target.value}))}
                        placeholder="••••••••" required
                        className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
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
    </div>
  )
}
