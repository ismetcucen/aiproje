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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sol Taraf - Tema / Giriş */}
      <div className="md:w-1/2 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex flex-col justify-center items-center p-8 md:p-16 text-white relative overflow-hidden">
        {/* Dekoratif elementler */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute top-1/4 -right-24 w-72 h-72 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center justify-center w-36 h-36 rounded-full bg-white mx-auto mb-8 border-4 border-white/20 shadow-2xl overflow-hidden">
            <img src="/ohep.jpeg" alt="ÖHEP Logosu" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
            Geleceği Yapay Zeka ile Şekillendir
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed font-light">
            ÖHEP AI Studio ile ilkokuldan liseye kadar uzanan interaktif programımızla yapay zeka dünyasını keşfet, kendi modellerini eğit ve geleceğin teknolojilerine yön ver.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-blue-100">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Kapsamlı Müfredat
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
              </span>
              İnteraktif Projeler
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
              </span>
              21. YY Yetkinlikleri
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
              </span>
              Beceri Temelli Yaklaşım
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Giriş Kartı */}
      <div className="md:w-1/2 flex items-center justify-center p-6 bg-slate-50 relative">
        {/* Mobilde arkada hafif bir desen */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50 md:hidden"></div>
        
        <div className="w-full max-w-md relative z-10">

          {/* Logo (Sadece mobilde görünür) */}
          <div className="text-center mb-8 md:hidden">
            <div className="flex items-center justify-center w-32 h-32 rounded-full bg-white mx-auto mb-6 shadow-lg border border-slate-200 overflow-hidden">
              <img src="/ohep.jpeg" alt="ÖHEP Logosu" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-slate-800 text-2xl font-bold">ÖHEP OKULLARI AI STUDIO</h1>
            <p className="text-slate-500 text-sm mt-1">Yapay Zeka Eğitim Platformu</p>
          </div>

          {/* Kart */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button onClick={() => { setTab(TABS.LOGIN); setError('') }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                tab === TABS.LOGIN ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
              }`}>Giriş Yap</button>
            <button onClick={() => { setTab(TABS.REGISTER); setError('') }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                tab === TABS.REGISTER ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
              }`}>Kayıt Ol</button>
          </div>

          <div className="p-6">
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            {tab === TABS.LOGIN && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="E-posta" type="email" value={loginData.email} onChange={v => setLoginData(p => ({...p, email: v}))} placeholder="ornek@okul.edu.tr" required />
                <Field label="Şifre" type="password" value={loginData.password} onChange={v => setLoginData(p => ({...p, password: v}))} placeholder="••••••••" required />
                <Button loading={loading}>Giriş Yap</Button>
              </form>
            )}

            {tab === TABS.REGISTER && (
              <form onSubmit={handleRegister} className="space-y-4">
                <Field label="Ad Soyad" value={regData.fullName} onChange={v => setRegData(p => ({...p, fullName: v}))} placeholder="Ali Yılmaz" required />
                <Field label="E-posta" type="email" value={regData.email} onChange={v => setRegData(p => ({...p, email: v}))} placeholder="ornek@okul.edu.tr" required />
                <Field label="Şifre" type="password" value={regData.password} onChange={v => setRegData(p => ({...p, password: v}))} placeholder="En az 6 karakter" required />
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Rol</label>
                  <div className="flex gap-3">
                    {[{ value: ROLES.STUDENT, label: 'Öğrenci' }, { value: ROLES.TEACHER, label: 'Öğretmen' }].map(opt => (
                      <button key={opt.value} type="button" onClick={() => setRegData(p => ({...p, role: opt.value}))}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                          regData.role === opt.value ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400'
                        }`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                {regData.role === ROLES.STUDENT && (
                  <>
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-1.5">Okul Seviyesi</label>
                      <select value={regData.classLevel} onChange={e => setRegData(p => ({...p, classLevel: e.target.value}))}
                        className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                        <option value={CLASS_LEVELS.ILKOKUL}>İlkokul (1-4. sınıf)</option>
                        <option value={CLASS_LEVELS.ORTAOKUL}>Ortaokul (5-8. sınıf)</option>
                        <option value={CLASS_LEVELS.LISE}>Lise (9-12. sınıf)</option>
                      </select>
                    </div>
                    <Field label="Sınıf Numarası" type="number" value={regData.gradeNumber} onChange={v => setRegData(p => ({...p, gradeNumber: v}))} placeholder="7" min={1} max={12} />
                  </>
                )}
                <Field label="Okul Kodu" value={regData.schoolCode} onChange={v => setRegData(p => ({...p, schoolCode: v.toUpperCase()}))} placeholder="OHEP" required />
                <p className="text-slate-400 text-xs -mt-2">Okul kodunu öğretmeninizden alın.</p>
                <Button loading={loading}>Kayıt Ol</Button>
              </form>
            )}
          </div>
        </div>
        <p className="text-center text-slate-400 text-xs mt-6">ÖHEP OKULLARI AI STUDIO © 2025</p>
      </div>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, required, min, max }) {
  return (
    <div>
      <label className="block text-slate-700 text-sm font-medium mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} min={min} max={max}
        className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-3 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors" />
    </div>
  )
}

function Button({ children, loading }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2 shadow-sm">
      {loading ? 'Lütfen bekleyin...' : children}
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
