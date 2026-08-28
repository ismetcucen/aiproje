import { useState, useEffect } from 'react'
import { createTubitakProject, getTubitakProjects, deleteTubitakProject, updateTubitakProject, getStudentsBySchool } from '../../firebase/schema'
import { useAuth } from '../../hooks/useAuth'

export default function TubitakProjects() {
  const { profile } = useAuth()
  const [projects, setProjects] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '', category: 'TÜBİTAK 2204-B', summary: '', description: '', materials: '', status: 'Fikir Aşamasında', teamMembers: []
  })

  useEffect(() => {
    loadData()
  }, [profile])

  async function loadData() {
    setLoading(true)
    if (profile?.schoolCode) {
      const [projRes, stuRes] = await Promise.all([
        getTubitakProjects(),
        getStudentsBySchool(profile.schoolCode)
      ])
      setProjects(projRes)
      setStudents(stuRes)
    }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      await updateTubitakProject(editingId, formData)
    } else {
      await createTubitakProject(formData)
    }
    setShowForm(false)
    setEditingId(null)
    setFormData({ title: '', category: 'TÜBİTAK 2204-B', summary: '', description: '', materials: '', status: 'Fikir Aşamasında', teamMembers: [] })
    loadData()
  }

  function handleEdit(proj) {
    setFormData({
      title: proj.title,
      category: proj.category,
      summary: proj.summary,
      description: proj.description,
      materials: proj.materials,
      status: proj.status || 'Fikir Aşamasında',
      teamMembers: proj.teamMembers || []
    })
    setEditingId(proj.id)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (confirm('Bu projeyi kütüphaneden silmek istediğinize emin misiniz?')) {
      await deleteTubitakProject(id)
      loadData()
    }
  }

  function toggleStudent(studentId) {
    setFormData(prev => {
      const isSelected = prev.teamMembers.includes(studentId)
      if (isSelected) {
        return { ...prev, teamMembers: prev.teamMembers.filter(id => id !== studentId) }
      } else {
        return { ...prev, teamMembers: [...prev.teamMembers, studentId] }
      }
    })
  }

  if (showForm) {
    return (
      <div className="max-w-4xl">
        <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ title: '', category: 'TÜBİTAK 2204-B', summary: '', description: '', materials: '', status: 'Fikir Aşamasında', teamMembers: [] }) }} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
          <span>←</span> Kütüphaneye Dön
        </button>
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">{editingId ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-sm mb-1">Proje Adı</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white shadow-sm border border-slate-200 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-500 text-sm mb-1">Kategori</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white shadow-sm border border-slate-200 rounded-lg px-3 py-2 text-white">
                  <option>TÜBİTAK 2204-A</option>
                  <option>TÜBİTAK 2204-B</option>
                  <option>TEKNOFEST</option>
                  <option>eTwinning</option>
                  <option>Diğer</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-slate-500 text-sm mb-1">Kısa Özet (1-2 Cümle)</label>
              <input required value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full bg-white shadow-sm border border-slate-200 rounded-lg px-3 py-2 text-white" />
            </div>

            <div>
              <label className="block text-slate-500 text-sm mb-1">Detaylı Açıklama / Amacı</label>
              <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white shadow-sm border border-slate-200 rounded-lg px-3 py-2 text-white"></textarea>
            </div>

            <div>
              <label className="block text-slate-500 text-sm mb-1">Kullanılacak Malzemeler (Virgülle ayırın)</label>
              <textarea rows="2" value={formData.materials} onChange={e => setFormData({...formData, materials: e.target.value})} className="w-full bg-white shadow-sm border border-slate-200 rounded-lg px-3 py-2 text-white"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-sm mb-1">Proje Durumu</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white shadow-sm border border-slate-200 rounded-lg px-3 py-2 text-white">
                  <option>Fikir Aşamasında</option>
                  <option>Ekip Kuruluyor</option>
                  <option>Geliştiriliyor</option>
                  <option>Tamamlandı</option>
                  <option>Başvuru Yapıldı</option>
                </select>
              </div>
              
              <div>
                <label className="block text-slate-500 text-sm mb-2">Proje Ekibi (Öğrenciler)</label>
                <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                  {students.map(stu => (
                    <label key={stu.id} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.teamMembers.includes(stu.id)}
                        onChange={() => toggleStudent(stu.id)}
                        className="w-4 h-4 rounded border-slate-200 bg-white shadow-sm text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-950"
                      />
                      <span className="text-slate-700 text-sm group-hover:text-white">{stu.fullName} <span className="text-slate-500 text-xs">({stu.classLevel})</span></span>
                    </label>
                  ))}
                  {students.length === 0 && <p className="text-slate-500 text-xs">Okulda kayıtlı öğrenci bulunamadı.</p>}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                {editingId ? 'Güncelle' : 'Kütüphaneye Ekle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-slate-800 text-2xl font-bold mb-2">Tübitak & Teknofest Projeleri</h2>
          <p className="text-slate-500">Öğrencilerle geliştireceğiniz ulusal ve uluslararası proje fikirlerini arşivleyin.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl font-bold transition-colors">
          + Yeni Proje Ekle
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-10">Yükleniyor...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white shadow-sm border border-slate-200 rounded-2xl">
          <p className="text-4xl mb-4">🏆</p>
          <p className="text-slate-700 font-medium">Henüz kayıtlı proje yok</p>
          <p className="text-slate-500 text-sm mt-1">Hemen sağ üstten bir proje ekleyerek kütüphaneyi oluşturmaya başlayın.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => {
            const teamNames = (proj.teamMembers || []).map(id => {
              const student = students.find(s => s.id === id)
              return student ? student.fullName : 'Bilinmeyen Öğrenci'
            })
            
            return (
              <div key={proj.id} className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 relative group flex flex-col hover:border-indigo-500/50 transition-colors">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(proj)} className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors">✏️</button>
                  <button onClick={() => handleDelete(proj.id)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors">🗑️</button>
                </div>
                
                <div className="mb-4">
                  <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md font-medium border border-indigo-500/30">
                    {proj.category}
                  </span>
                  <span className="text-xs bg-slate-50 text-slate-700 px-2 py-1 rounded-md font-medium ml-2 border border-slate-200">
                    {proj.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{proj.title}</h3>
                <p className="text-slate-500 text-sm flex-1">{proj.summary}</p>
                
                {(proj.materials || teamNames.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    {proj.materials && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Gerekli Malzemeler</h4>
                        <p className="text-slate-700 text-xs truncate" title={proj.materials}>
                          {proj.materials}
                        </p>
                      </div>
                    )}
                    
                    {teamNames.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">👥 Proje Ekibi ({teamNames.length})</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {teamNames.map((name, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
