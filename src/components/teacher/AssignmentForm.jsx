import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createAssignment, getAssignmentsByTeacher, CLASS_LEVELS, CONTENT_TYPES } from '../../firebase/schema'

const CONTENT_TYPE_LABELS = {
  text:         'Metin / Hikaye',
  code:         'Kod',
  project:      'Proje',
  presentation: 'Sunum',
}

const CLASS_LEVEL_LABELS = {
  ilkokul:  'Ilkokul (1-4. sinif)',
  ortaokul: 'Ortaokul (5-8. sinif)',
  lise:     'Lise (9-12. sinif)',
  all:      'Tum Seviyeler',
}

export default function AssignmentForm() {
  const { user, profile } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [showForm, setShowForm]       = useState(false)

  const [form, setForm] = useState({
    title:        '',
    description:  '',
    classLevel:   'all',
    contentTypes: ['text'],
  })

  useEffect(() => {
    if (user?.uid) loadAssignments()
  }, [user])

  async function loadAssignments() {
    setLoading(true)
    try {
      const data = await getAssignmentsByTeacher(user.uid)
      setAssignments(data)
    } catch (err) {
      console.error(err)
      setError('Gorevler yuklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  function toggleContentType(type) {
    setForm(p => ({
      ...p,
      contentTypes: p.contentTypes.includes(type)
        ? p.contentTypes.filter(t => t !== type)
        : [...p.contentTypes, type],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim())             return setError('Gorev basligi gerekli.')
    if (!form.description.trim())       return setError('Gorev aciklamasi gerekli.')
    if (form.contentTypes.length === 0) return setError('En az bir icerik turu secin.')

    setError(''); setSaving(true)
    try {
      await createAssignment({
        title:        form.title.trim(),
        description:  form.description.trim(),
        classLevel:   form.classLevel,
        gradeNumbers: [],
        contentTypes: form.contentTypes,
        dueDate:      null,
        createdBy:    user.uid,
        schoolCode:   profile.schoolCode,
        aiAssisted:   false,
      })
      setSuccess('Gorev basariyla olusturuldu!')
      setForm({ title: '', description: '', classLevel: 'all', contentTypes: ['text'] })
      setShowForm(false)
      await loadAssignments()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('Gorev olusturulamadi. Tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">Gorevler</h2>
          <p className="text-slate-400 text-sm mt-0.5">{assignments.length} aktif gorev</p>
        </div>
        <button
          onClick={() => { setShowForm(p => !p); setError('') }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'X Iptal' : '+ Yeni Gorev'}
        </button>
      </div>

      {error   && <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-800 text-red-300 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-lg bg-green-900/40 border border-green-800 text-green-300 text-sm">{success}</div>}

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Yeni Gorev Olustur</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Gorev Basligi</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="orn: Bir Gunluk Hikaye Yaz"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Gorev Aciklamasi</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Ogrenciden ne yapmasini bekliyorsunuz?"
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Sinif Seviyesi</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Object.entries(CLASS_LEVEL_LABELS).map(([value, label]) => (
                  <button key={value} type="button"
                    onClick={() => setForm(p => ({ ...p, classLevel: value }))}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      form.classLevel === value
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Icerik Turleri</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
                  <button key={value} type="button"
                    onClick={() => toggleContentType(value)}
                    className={`py-2 px-4 rounded-lg text-xs font-medium border transition-colors ${
                      form.contentTypes.includes(value)
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Kaydediliyor...' : 'Gorevi Kaydet'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Iptal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-400">Yukleniyor...</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white font-medium mb-2">Henuz gorev yok</p>
          <p className="text-slate-400 text-sm">Yukaridan yeni gorev olusturun.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{a.title}</h3>
                    <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                      {CLASS_LEVEL_LABELS[a.classLevel] || a.classLevel}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{a.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(a.contentTypes || []).map(ct => (
                      <span key={ct} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                        {CONTENT_TYPE_LABELS[ct] || ct}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-slate-500 text-xs whitespace-nowrap">
                  {a.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
