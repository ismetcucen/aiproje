import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { createUserProfile, addStudentToClass, ROLES, CLASS_LEVELS } from '../../firebase/schema'

export default function AddStudentModal({ classInfo, schoolCode, onClose, onSuccess }) {
  const [form, setForm] = useState({
    fullName:    '',
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
    if (!form.email.trim())    return setError('Email gerekli.')
    if (!form.password || form.password.length < 6) return setError('Sifre en az 6 karakter olmali.')
    setError(''); setSaving(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password)
      await updateProfile(cred.user, { displayName: form.fullName.trim() })
      await createUserProfile(cred.user.uid, {
        fullName:    form.fullName.trim(),
        email:       form.email.trim(),
        role:        ROLES.STUDENT,
        classLevel:  classLevelFromGrade(form.gradeNumber),
        gradeNumber: Number(form.gradeNumber),
        schoolCode,
      })
      if (classInfo) {
        await addStudentToClass(classInfo.id, cred.user.uid)
      }
      onSuccess()
    } catch(err) {
      if (err.code === 'auth/email-already-in-use') setError('Bu email zaten kayitli.')
      else setError('Ogrenci eklenemedi: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">Yeni Ogrenci Ekle</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">x</button>
        </div>
        {classInfo && (
          <div className="bg-indigo-900/30 border border-indigo-800 rounded-lg px-3 py-2 mb-4">
            <p className="text-indigo-300 text-xs">Sinif: <span className="font-semibold">{classInfo.name}</span></p>
          </div>
        )}
        {error && <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-800 text-red-300 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Ad Soyad</label>
            <input value={form.fullName} onChange={e => setForm(p => ({...p, fullName: e.target.value}))}
              placeholder="Ali Yilmaz" required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
              placeholder="ali@okul.edu.tr" required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Sifre</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
              placeholder="En az 6 karakter" required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Sinif Numarasi</label>
            <input type="number" min={3} max={10} value={form.gradeNumber}
              onChange={e => setForm(p => ({...p, gradeNumber: e.target.value}))}
              placeholder="7"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Ekleniyor...' : 'Ogrenci Ekle'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Iptal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
