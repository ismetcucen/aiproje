import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { CLASS_LEVELS, ROLES } from '../firebase/schema'

const TABS = { LOGIN: 'login', REGISTER: 'register' }

export default function LoginPage() {
  const { login, register } = useAuth()
  const [tab, setTab]         = useState(TABS.LOGIN)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [regData, setRegData] = useState({
    fullName: '', email: '', password: '',
    role: ROLES.STUDENT, classLevel: CLASS_LEVELS.ORTAOKUL,
    gradeNumber: '', schoolCode: '',
  })

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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
      
      {/* Hareketli Arkaplan Gradientleri */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/30 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-indigo-500/20 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="w-full max-w-6xl mx-auto p-6 md:p-12 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* Sol Taraf - Vitrin */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">
          
          {/* Logo Container */}
          <div className="relative mb-10 group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center justify-center w-40 h-40 rounded-full bg-white border-4 border-white shadow-2xl overflow-hidden transform group-hover:scale-105 transition duration-500">
              <img src="/ohep.jpeg" alt="ÖHEP Logosu" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 tracking-tight mb-6 leading-tight">
            Geleceği <br className="hidden lg:block"/> AI ile Şekillendir
          </h1>
          
          <p className="text-lg lg:text-xl text-blue-100/80 mb-10 leading-relaxed font-light max-w-xl">
            ÖHEP AI Studio ile ilkokuldan liseye kadar uzanan interaktif programımızla yapay zeka dünyasını keşfet, kendi modellerini eğit ve geleceğin teknolojisinin önemli bir parçası ol.
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <FeatureBadge color="bg-green-500" text="Kapsamlı Müfredat" />
            <FeatureBadge color="bg-blue-500" text="İnteraktif Projeler" />
            <FeatureBadge color="bg-yellow-500" text="21. YY Yetkinlikleri" />
            <FeatureBadge color="bg-purple-500" text="Beceri Temelli Yaklaşım" />
          </div>
        </div>

        {/* Sağ Taraf - Giriş Kartı */}
        <div className="w-full max-w-md lg:w-[450px]">
          <div className="backdrop-blur-xl bg-white/10 p-1 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Kart içi ince parlama efekti */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            
            <div className="bg-white rounded-[22px] overflow-hidden shadow-inner">
              <div className="flex border-b border-slate-100">
                <button onClick={() => { setTab(TABS.LOGIN); setError('') }}
                  className={`flex-1 py-5 text-sm font-bold transition-all ${
                    tab === TABS.LOGIN ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}>Giriş Yap</button>
                <button onClick={() => { setTab(TABS.REGISTER); setError('') }}
                  className={`flex-1 py-5 text-sm font-bold transition-all ${
                    tab === TABS.REGISTER ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}>Kayıt Ol</button>
              </div>

              <div className="p-8">
                {error && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-3">
                  <span>⚠️</span> {error}
                </div>}

                {tab === TABS.LOGIN && (
                  <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Field label="E-posta" type="email" value={loginData.email} onChange={v => setLoginData(p => ({...p, email: v}))} placeholder="ornek@okul.edu.tr" required />
                    <Field label="Şifre" type="password" value={loginData.password} onChange={v => setLoginData(p => ({...p, password: v}))} placeholder="••••••••" required />
                    <Button loading={loading}>Platforma Gir 🚀</Button>
                  </form>
                )}

                {tab === TABS.REGISTER && (
                  <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Field label="Ad Soyad" value={regData.fullName} onChange={v => setRegData(p => ({...p, fullName: v}))} placeholder="Ali Yılmaz" required />
                    <Field label="E-posta" type="email" value={regData.email} onChange={v => setRegData(p => ({...p, email: v}))} placeholder="ornek@okul.edu.tr" required />
                    <Field label="Şifre" type="password" value={regData.password} onChange={v => setRegData(p => ({...p, password: v}))} placeholder="En az 6 karakter" required />
                    <div>
                      <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Rol</label>
                      <div className="flex gap-2">
                        {[{ value: ROLES.STUDENT, label: 'Öğrenci' }, { value: ROLES.TEACHER, label: 'Öğretmen' }].map(opt => (
                          <button key={opt.value} type="button" onClick={() => setRegData(p => ({...p, role: opt.value}))}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                              regData.role === opt.value ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500'
                            }`}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                    {regData.role === ROLES.STUDENT && (
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Kandeme</label>
                          <select value={regData.classLevel} onChange={e => setRegData(p => ({...p, classLevel: e.target.value}))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors">
                            <option value={CLASS_LEVELS.ILKOKUL}>İlkokul</option>
                            <option value={CLASS_LEVELS.ORTAOKUL}>Ortaokul</option>
                            <option value={CLASS_LEVELS.LISE}>Lise</option>
                          </select>
                        </div>
                        <div className="w-24">
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
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-xs font-medium tracking-wide">ÖHEP OKULLARI AI STÜDYO © 2026</p>
            <p className="text-slate-500/50 text-[10px] mt-1">Geliştirici: İsmet ÇÜÇEN</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureBadge({ color, text }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 transition-colors">
      <span className="relative flex h-2.5 w-2.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`}></span>
      </span>
      <span className="text-white text-sm font-medium">{text}</span>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, required, min, max }) {
  return (
    <div>
      <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} min={min} max={max}
        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-sm transition-all" />
    </div>
  )
}

function Button({ children, loading }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 mt-6 hover:-translate-y-0.5">
      {loading ? 'İşleminiz yapılıyor...' : children}
    </button>
  )
}

function turkishError(code) {
  const map = {
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/user-not-found': 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.',
    'auth/wrong-password': 'Şifre hatalı.',
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
    'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekleyin.',
    'auth/invalid-credential': 'E-posta veya şifre hatalı.',
  }
  return map[code] || 'Bir hata oluştu. Lütfen tekrar deneyin.'
}
