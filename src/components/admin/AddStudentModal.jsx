import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { createUserProfile, addStudentToClass, ROLES, CLASS_LEVELS } from '../../firebase/schema'

export const VISUAL_PASSWORDS = [
  { id: 'fox', icon: '🦊', label: 'Tilki' },
  { id: 'rocket', icon: '🚀', label: 'Roket' },
  { id: 'cat', icon: '🐱', label: 'Kedi' },
  { id: 'apple', icon: '🍎', label: 'Elma' },
  { id: 'soccer', icon: '⚽', label: 'Top' },
  { id: 'star', icon: '🌟', label: 'Yıldız' },
  { id: 'panda', icon: '🐼', label: 'Panda' },
  { id: 'butterfly', icon: '🦋', label: 'Kelebek' },
  { id: 'balloon', icon: '🎈', label: 'Balon' },
  { id: 'watermelon', icon: '🍉', label: 'Karpuz' },
  { id: 'unicorn', icon: '🦄', label: 'Tekboynuz' },
  { id: 'trex', icon: '🦖', label: 'Dinozor' },
  { id: 'art', icon: '🎨', label: 'Palet' },
  { id: 'rainbow', icon: '🌈', label: 'Gökkuşağı' },
  { id: 'sunflower', icon: '🌻', label: 'Çiçek' },
]

export default function AddStudentModal({ classInfo, schoolCode, onClose, onSuccess }) {
  const [mode, setMode] = useState('visual') // 'visual' or 'email'

  const [form, setForm] = useState({
    fullName:    '',
    studentNo:   '',
    visualId:    'fox', // default
    email:       '',
    password:    '',
    gradeNumber: classInfo?.grade || '',
  })
  
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  function classLevelFromGrade(grade) {
    const g = Number(grade)
    if (g <= 4) return CLASS_LEVELS.ILKOKUL
    if (g <= 8) return CLASS_LEVELS.ORTAOKUL
    return CLASS_LEVELS.LISE
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fullName.trim()) return setError('Ad soyad gerekli.')
    
    let targetEmail = ''
    let targetPassword = ''
    
    if (mode === 'visual') {
      if (!form.studentNo.trim()) return setError('Öğrenci/Okul Numarası gerekli.')
      // Generate deterministic credentials
      targetEmail = `std_${form.studentNo.trim()}_${schoolCode}@ohep.edu.tr`
      targetPassword = `vp_${form.visualId}_2026!`
    } else {
      if (!form.email.trim()) return setError('Email gerekli.')
      if (!form.password || form.password.length < 6) return setError('Şifre en az 6 karakter olmalı.')
      targetEmail = form.email.trim()
      targetPassword = form.password
    }

    setError(''); setSaving(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, targetEmail, targetPassword)
      await updateProfile(cred.user, { displayName: form.fullName.trim() })
      await createUserProfile(cred.user.uid, {
        fullName:    form.fullName.trim(),
        email:       targetEmail,
        role:        ROLES.STUDENT,
        classLevel:  classLevelFromGrade(form.gradeNumber),
        gradeNumber: Number(form.gradeNumber),
        schoolCode,
        studentNo:   mode === 'visual' ? form.studentNo.trim() : null,
        visualId:    mode === 'visual' ? form.visualId : null,
      })
      if (classInfo) {
        await addStudentToClass(classInfo.id, cred.user.uid)
      }
      onSuccess()
    } catch(err) {
      if (err.code === 'auth/email-already-in-use') setError(mode === 'visual' ? 'Bu okul numarası zaten kullanımda.' : 'Bu email zaten kayıtlı.')
      else setError('Öğrenci eklenemedi: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700/60 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-white text-2xl font-black">Yeni Öğrenci Ekle</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none transition-colors">&times;</button>
        </div>

        {/* Tab Seçimi */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-6 relative z-10">
          <button type="button" onClick={() => setMode('visual')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'visual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
            🦄 Görsel Şifre
          </button>
          <button type="button" onClick={() => setMode('email')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'email' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}>
            📧 E-posta
          </button>
        </div>

        {classInfo && (
          <div className="bg-indigo-900/30 border border-indigo-800/50 rounded-xl px-4 py-3 mb-6 relative z-10">
            <p className="text-indigo-300 text-sm">Hedef Sınıf: <span className="font-bold text-white">{classInfo.name}</span></p>
          </div>
        )}
        
        {error && <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-800/50 text-red-300 text-sm font-medium relative z-10">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Ad Soyad</label>
            <input value={form.fullName} onChange={e => setForm(p => ({...p, fullName: e.target.value}))}
              placeholder="Ali Yılmaz" required
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Kaçıncı Sınıf?</label>
              <input type="number" min={1} max={12} value={form.gradeNumber}
                onChange={e => setForm(p => ({...p, gradeNumber: e.target.value}))}
                placeholder="7"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
            </div>
          </div>

          {mode === 'visual' ? (
            <>
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Okul Numarası <span className="text-slate-500 lowercase">(Kullanıcı Adı yerine geçecek)</span></label>
                <input type="text" value={form.studentNo} onChange={e => setForm(p => ({...p, studentNo: e.target.value}))}
                  placeholder="1045" required
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">Gizli Görsel Ataması</label>
                <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  {VISUAL_PASSWORDS.map(vp => (
                    <button type="button" key={vp.id} onClick={() => setForm(p => ({...p, visualId: vp.id}))} title={vp.label}
                      className={`text-3xl p-2 rounded-xl transition-all border-2 ${
                        form.visualId === vp.id ? 'bg-indigo-500/20 border-indigo-500 scale-110 shadow-lg' : 'bg-slate-950 border-transparent hover:border-slate-700 opacity-60 hover:opacity-100'
                      }`}>
                      {vp.icon}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  placeholder="ali@okul.edu.tr" required={mode==='email'}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Şifre</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  placeholder="En az 6 karakter" required={mode==='email'}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4 border-t border-slate-800/60 mt-6">
            <button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/30">
              {saving ? 'Ekleniyor...' : 'Öğrenciyi Sisteme Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
