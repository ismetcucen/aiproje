import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { CLASS_LEVELS, ROLES } from '../firebase/schema'

const TABS = { LOGIN: 'login', REGISTER: 'register' }

const SLOGANS = [
  "Geleceği Şekillendir",
  "Sınırları Aş",
  "Üretkenliğini Keşfet",
  "Kendi Hikayeni Yaz"
]

export default function LoginPage() {
  const { login, register } = useAuth()
  const [tab, setTab]         = useState(TABS.LOGIN)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sloganIdx, setSloganIdx] = useState(0)
  
  const [loginData, setLoginData] = useState({ email: '', password: '' })
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
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(loginData.email, loginData.password) }
    catch (err) { setError(turkishError(err.code)) }
    finally { setLoading(false) }
  }

  async function handleRegister(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try { await register({ ...regData, gradeNumber: regData.gradeNumber ? Number(regData.gradeNumber) : null }) }
    catch (err) { setError(err.message || turkishError(err.code)) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
      
      {/* Hareketli Arkaplan Gradientleri */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-violet-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      <div className="w-full max-w-7xl mx-auto p-6 md:p-12 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Sol Taraf - Vitrin */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start w-full">
          
          {/* Logo Container */}
          <div className="relative mb-8 group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center justify-center w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-white border-4 border-slate-100 shadow-2xl overflow-hidden transform group-hover:scale-105 transition duration-500">
              <img src="/ohep.jpeg" alt="ÖHEP Logosu" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 tracking-tight mb-4 leading-tight min-h-[140px] lg:min-h-[160px]">
            Yapay Zeka ile <br />
            <span className="text-blue-400 inline-block transition-all duration-500 ease-in-out">
              {SLOGANS[sloganIdx]}
            </span>
          </h1>
          
          <p className="text-base lg:text-lg text-slate-300 mb-8 leading-relaxed font-light max-w-xl">
            Türkiye'nin öncü yapay zeka entegreli K-12 eğitim platformu. Öğrencilerimizi sadece dijital tüketici değil, inovatif araçlarla <strong className="text-white font-semibold">geleceğin dijital üreticileri</strong> yapıyoruz.
          </p>
          
          {/* Yenilikçi Özellikler Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
            <FeatureBox icon="🧠" title="Uygulamalı LLM Eğitimi" desc="Kendi modellerini eğit ve prompt mühendisliğiyle tanış." />
            <FeatureBox icon="🎨" title="Üretken Stüdyo" desc="Metinden görsele, vizyoner projeleri saniyeler içinde tasarla." />
            <FeatureBox icon="📊" title="Kişiselleştirilmiş Gelişim" desc="Otomatik değerlendirme ve yapay zeka destekli geri bildirim." />
            <FeatureBox icon="🏆" title="Dinamik Portfolyo" desc="Oyunlaştırılmış rozet sistemi ile başarılarını sergile." />
          </div>

        </div>

        {/* Sağ Taraf - Kompakt Giriş Kartı */}
        <div className="w-full max-w-[360px] lg:w-[360px] shrink-0">
          <div className="backdrop-blur-2xl bg-slate-900/40 p-1 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Kart içi ince parlama efekti */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            
            <div className="bg-slate-950/50 backdrop-blur-md rounded-[22px] overflow-hidden shadow-inner border border-slate-800/50">
              <div className="flex border-b border-slate-800/50">
                <button onClick={() => { setTab(TABS.LOGIN); setError('') }}
                  className={`flex-1 py-4 text-xs font-bold tracking-wide uppercase transition-all ${
                    tab === TABS.LOGIN ? 'text-blue-400 bg-blue-900/20 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}>Giriş Yap</button>
                <button onClick={() => { setTab(TABS.REGISTER); setError('') }}
                  className={`flex-1 py-4 text-xs font-bold tracking-wide uppercase transition-all ${
                    tab === TABS.REGISTER ? 'text-blue-400 bg-blue-900/20 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}>Kayıt Ol</button>
              </div>

              <div className="p-6">
                {error && <div className="mb-5 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2">
                  <span className="text-sm">⚠️</span> {error}
                </div>}

                {tab === TABS.LOGIN && (
                  <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Field label="E-posta" type="email" value={loginData.email} onChange={v => setLoginData(p => ({...p, email: v}))} placeholder="ornek@okul.edu.tr" required />
                    <Field label="Şifre" type="password" value={loginData.password} onChange={v => setLoginData(p => ({...p, password: v}))} placeholder="••••••••" required />
                    <Button loading={loading}>Sisteme Gir 🚀</Button>
                  </form>
                )}

                {tab === TABS.REGISTER && (
                  <form onSubmit={handleRegister} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Field label="Ad Soyad" value={regData.fullName} onChange={v => setRegData(p => ({...p, fullName: v}))} placeholder="Ali Yılmaz" required />
                    <Field label="E-posta" type="email" value={regData.email} onChange={v => setRegData(p => ({...p, email: v}))} placeholder="ornek@okul.edu.tr" required />
                    <Field label="Şifre" type="password" value={regData.password} onChange={v => setRegData(p => ({...p, password: v}))} placeholder="En az 6 karakter" required />
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Rol</label>
                      <div className="flex gap-2">
                        {[{ value: ROLES.STUDENT, label: 'Öğrenci' }, { value: ROLES.TEACHER, label: 'Öğretmen' }].map(opt => (
                          <button key={opt.value} type="button" onClick={() => setRegData(p => ({...p, role: opt.value}))}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                              regData.role === opt.value ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                    {regData.role === ROLES.STUDENT && (
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Kademe</label>
                          <select value={regData.classLevel} onChange={e => setRegData(p => ({...p, classLevel: e.target.value}))}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors">
                            <option value={CLASS_LEVELS.ILKOKUL}>İlkokul</option>
                            <option value={CLASS_LEVELS.ORTAOKUL}>Ortaokul</option>
                            <option value={CLASS_LEVELS.LISE}>Lise</option>
                          </select>
                        </div>
                        <div className="w-16">
                          <Field label="Sınıf" type="number" value={regData.gradeNumber} onChange={v => setRegData(p => ({...p, gradeNumber: v}))} placeholder="7" min={1} max={12} />
                        </div>
                      </div>
                    )}
                    <Field label="Okul Kodu" value={regData.schoolCode} onChange={v => setRegData(p => ({...p, schoolCode: v.toUpperCase()}))} placeholder="Örn: OHEP" required />
                    <Button loading={loading}>Kaydı Tamamla ✨</Button>
                  </form>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-[10px] font-medium tracking-wide uppercase">ÖHEP OKULLARI AI STÜDYO © 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureBox({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors text-left backdrop-blur-sm">
      <div className="text-2xl mt-1">{icon}</div>
      <div>
        <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, required, min, max }) {
  return (
    <div>
      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} min={min} max={max}
        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm font-medium placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
    </div>
  )
}

function Button({ children, loading }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg shadow-blue-900/50 mt-4 hover:-translate-y-0.5">
      {loading ? 'İşleniyor...' : children}
    </button>
  )
}

function turkishError(code) {
  const map = {
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/user-not-found': 'Kullanıcı bulunamadı.',
    'auth/wrong-password': 'Şifre hatalı.',
    'auth/email-already-in-use': 'E-posta zaten kullanımda.',
    'auth/weak-password': 'Şifre çok zayıf.',
    'auth/too-many-requests': 'Çok fazla deneme.',
    'auth/invalid-credential': 'E-posta veya şifre hatalı.',
  }
  return map[code] || 'Bir hata oluştu.'
}
