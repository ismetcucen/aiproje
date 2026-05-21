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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <span className="text-white text-3xl font-bold">+</span>
          </div>
          <h1 className="text-white text-2xl font-bold">AI Üretim Platformu</h1>
          <p className="text-slate-400 text-sm mt-1">Öğrenci merkezli yapay zeka destekli üretim</p>
        </div>
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="flex border-b border-slate-800">
            <button onClick={() => { setTab(TABS.LOGIN); setError('') }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${tab === TABS.LOGIN ? 'text-white border-b-2 border-indigo-500 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'}`}>
              Giriş Yap
            </button>
            <button onClick={() => { setTab(TABS.REGISTER); setError('') }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${tab === TABS.REGISTER ? 'text-white border-b-2 border-indigo-500 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'}`}>
              Kayıt Ol
            </button>
          </div>
          <div className="p-6">
            {error && <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-800 text-red-300 text-sm">{error}</div>}
            {tab === TABS.LOGIN && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="E-posta" type="email" value={loginData.email} onChange={v => setLoginData(p => ({ ...p, email: v }))} placeholder="ornek@okul.edu.tr" required />
                <Field label="Şifre" type="password" value={loginData.password} onChange={v => setLoginData(p => ({ ...p, password: v }))} placeholder="••••••••" required />
                <Button loading={loading}>Giriş Yap</Button>
              </form>
            )}
            {tab === TABS.REGISTER && (
              <form onSubmit={handleRegister} className="space-y-4">
                <Field label="Ad Soyad" value={regData.fullName} onChange={v => setRegData(p => ({ ...p, fullName: v }))} placeholder="Ali Yılmaz" required />
                <Field label="E-posta" type="email" value={regData.email} onChange={v => setRegData(p => ({ ...p, email: v }))} placeholder="ornek@okul.edu.tr" required />
                <Field label="Şifre" type="password" value={regData.password} onChange={v => setRegData(p => ({ ...p, password: v }))} placeholder="En az 6 karakter" required />
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">Rol</label>
                  <div className="flex gap-3">
                    {[{ value: ROLES.STUDENT, label: 'Öğrenci' }, { value: ROLES.TEACHER, label: 'Öğretmen' }].map(opt => (
                      <button key={opt.value} type="button" onClick={() => setRegData(p => ({ ...p, role: opt.value }))}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${regData.role === opt.value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {regData.role === ROLES.STUDENT && (
                  <>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-1.5">Okul Seviyesi</label>
                      <select value={regData.classLevel} onChange={e => setRegData(p => ({ ...p, classLevel: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                        <option value={CLASS_LEVELS.ILKOKUL}>İlkokul (1-4. sınıf)</option>
                        <option value={CLASS_LEVELS.ORTAOKUL}>Ortaokul (5-8. sınıf)</option>
                        <option value={CLASS_LEVELS.LISE}>Lise (9-12. sınıf)</option>
                      </select>
                    </div>
                    <Field label="Sınıf Numarası" type="number" value={regData.gradeNumber} onChange={v => setRegData(p => ({ ...p, gradeNumber: v }))} placeholder="7" min={1} max={12} />
                  </>
                )}
                <Field label="Okul Kodu" value={regData.schoolCode} onChange={v => setRegData(p => ({ ...p, schoolCode: v.toUpperCase() }))} placeholder="IST001" required />
                <p className="text-slate-500 text-xs -mt-2">Okul kodunu öğretmeninizden alın.</p>
                <Button loading={loading}>Kayıt Ol</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, required, min, max }) {
  return (
    <div>
      <label className="block text-slate-300 text-sm font-medium mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} min={min} max={max}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
    </div>
  )
}

function Button({ children, loading }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2">
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
