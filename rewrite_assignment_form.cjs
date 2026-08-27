const fs = require('fs');

const content = `import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createAssignment, getAssignmentsByTeacher, CLASS_LEVELS, CONTENT_TYPES, getStudentsBySchool, createNotification } from '../../firebase/schema'

const CLASS_LEVEL_LABELS = {
  'all': 'Tüm Seviyeler',
  [CLASS_LEVELS.ILKOKUL]: 'İlkokul (1-4)',
  [CLASS_LEVELS.ORTAOKUL]: 'Ortaokul (5-8)',
  [CLASS_LEVELS.LISE]: 'Lise (9-12)'
}

const CONTENT_TYPE_LABELS = {
  [CONTENT_TYPES.TEXT]: '📝 Metin',
  [CONTENT_TYPES.CODE]: '💻 Kod',
  [CONTENT_TYPES.PROJECT]: '🚀 Proje',
  [CONTENT_TYPES.PRESENTATION]: '📊 Sunum'
}

export default function AssignmentForm() {
  const { user, profile } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
      setError('Görevler yüklenemedi.')
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

  async function notifyStudents(assignmentTitle, classLevel) {
    try {
      const students = await getStudentsBySchool(profile.schoolCode)
      const targetStudents = classLevel === 'all' 
        ? students 
        : students.filter(s => s.classLevel === classLevel)
      
      for (const student of targetStudents) {
        await createNotification(student.id, {
          title: \`Yeni Görev: \${assignmentTitle}\`,
          message: \`Öğretmeniniz \${profile.fullName} yeni bir görev ekledi.\`,
          type: 'assignment_new',
          link: '/student/assignments'
        })
      }
    } catch (err) {
      console.error('Bildirimler gönderilemedi', err)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim())             return setError('Görev başlığı gerekli.')
    if (!form.description.trim())       return setError('Görev açıklaması gerekli.')
    if (form.contentTypes.length === 0) return setError('En az bir içerik türü seçin.')

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
      
      await notifyStudents(form.title.trim(), form.classLevel)
      
      setSuccess('Görev başarıyla oluşturuldu ve öğrencilere bildirildi!')
      setForm({ title: '', description: '', classLevel: 'all', contentTypes: ['text'] })
      setShowForm(false)
      await loadAssignments()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error(err)
      setError('Görev oluşturulamadı. Tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto p-2">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-white text-3xl font-black tracking-tight">Görev Yönetimi</h2>
          <p className="text-slate-400 text-sm mt-1">
            Toplam <span className="text-indigo-400 font-bold">{assignments.length}</span> aktif görev bulunuyor.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(p => !p); setError('') }}
          className={\`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg \${
            showForm 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25'
          }\`}
        >
          {showForm ? 'Vazgeç' : '+ Yeni Görev Oluştur'}
        </button>
      </div>

      {error   && <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-800/50 text-red-300 text-sm font-medium">{error}</div>}
      {success && <div className="mb-6 p-4 rounded-xl bg-emerald-900/30 border border-emerald-800/50 text-emerald-300 text-sm font-medium">{success}</div>}

      {showForm && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8 mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <h3 className="text-white font-bold text-xl mb-6 relative z-10 flex items-center gap-3">
            <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">📝</span>
            Yeni Görev Detayları
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Görev Başlığı</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Örn: Yapay Zeka ile Kendi Hikayeni Yaz"
                className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Görev Açıklaması</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Öğrenciden ne yapmasını bekliyorsunuz? Kriterler nelerdir?"
                rows={4}
                className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none custom-scrollbar"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">Hedef Sınıf Seviyesi</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(CLASS_LEVEL_LABELS).map(([value, label]) => (
                    <button key={value} type="button"
                      onClick={() => setForm(p => ({ ...p, classLevel: value }))}
                      className={\`py-3 px-3 rounded-xl text-xs font-bold border transition-all \${
                        form.classLevel === value
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }\`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">İçerik Formatları</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
                    <button key={value} type="button"
                      onClick={() => toggleContentType(value)}
                      className={\`py-3 px-3 rounded-xl text-xs font-bold border transition-all \${
                        form.contentTypes.includes(value)
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20 scale-[1.02]'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }\`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6 border-t border-slate-800/60 mt-8">
              <button type="submit" disabled={saving}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/30">
                {saving ? 'Oluşturuluyor...' : 'Görevi Yayınla'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/50 border-dashed rounded-3xl p-12 text-center">
          <div className="text-5xl mb-4 opacity-50">📚</div>
          <p className="text-white font-bold text-lg mb-2">Henüz Aktif Görev Yok</p>
          <p className="text-slate-400 text-sm">Yukarıdaki butona tıklayarak öğrencilerinize ilk görevi verebilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(a => (
            <div key={a.id} className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 hover:border-slate-600 hover:bg-slate-800/40 transition-all group flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full">
                  {CLASS_LEVEL_LABELS[a.classLevel] || a.classLevel}
                </span>
                <span className="text-slate-500 text-[10px] font-bold">
                  {a.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}
                </span>
              </div>
              
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
                {a.title}
              </h3>
              
              <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                {a.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-800/50">
                {(a.contentTypes || []).map(ct => (
                  <span key={ct} className="text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    {CONTENT_TYPE_LABELS[ct] || ct}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
`
fs.writeFileSync('src/components/teacher/AssignmentForm.jsx', content, 'utf8');
console.log('AssignmentForm updated');
