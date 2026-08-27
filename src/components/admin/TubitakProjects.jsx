import { useState, useEffect } from 'react'
import { createTubitakProject, getTubitakProjects, deleteTubitakProject, updateTubitakProject } from '../../firebase/schema'

export default function TubitakProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '', category: 'TÜBİTAK 2204-B', summary: '', description: '', materials: '', status: 'Fikir Aşamasında'
  })

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    const res = await getTubitakProjects()
    setProjects(res)
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
    setFormData({ title: '', category: 'TÜBİTAK 2204-B', summary: '', description: '', materials: '', status: 'Fikir Aşamasında' })
    loadProjects()
  }

  function handleEdit(proj) {
    setFormData({
      title: proj.title,
      category: proj.category,
      summary: proj.summary,
      description: proj.description,
      materials: proj.materials,
      status: proj.status || 'Fikir Aşamasında'
    })
    setEditingId(proj.id)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (confirm('Bu projeyi kütüphaneden silmek istediğinize emin misiniz?')) {
      await deleteTubitakProject(id)
      loadProjects()
    }
  }

  if (showForm) {
    return (
      <div className="max-w-3xl">
        <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ title: '', category: 'TÜBİTAK 2204-B', summary: '', description: '', materials: '', status: 'Fikir Aşamasında' }) }} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span>←</span> Kütüphaneye Dön
        </button>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">{editingId ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Proje Adı</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Kategori</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white">
                  <option>TÜBİTAK 2204-A</option>
                  <option>TÜBİTAK 2204-B</option>
                  <option>TEKNOFEST</option>
                  <option>eTwinning</option>
                  <option>Diğer</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-slate-400 text-sm mb-1">Kısa Özet (1-2 Cümle)</label>
              <input required value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white" />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Detaylı Açıklama / Amacı</label>
              <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"></textarea>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Kullanılacak Malzemeler (Virgülle ayırın)</label>
              <textarea rows="2" value={formData.materials} onChange={e => setFormData({...formData, materials: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"></textarea>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Proje Durumu</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white">
                <option>Fikir Aşamasında</option>
                <option>Ekip Kuruluyor</option>
                <option>Geliştiriliyor</option>
                <option>Tamamlandı</option>
                <option>Başvuru Yapıldı</option>
              </select>
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
          <h2 className="text-white text-2xl font-bold mb-2">Tübitak & Teknofest Projeleri</h2>
          <p className="text-slate-400">Öğrencilerle geliştireceğiniz ulusal ve uluslararası proje fikirlerini arşivleyin.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl font-bold transition-colors">
          + Yeni Proje Ekle
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-10">Yükleniyor...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-4xl mb-4">🏆</p>
          <p className="text-white font-medium">Henüz kayıtlı proje yok</p>
          <p className="text-slate-400 text-sm mt-1">Hemen sağ üstten bir proje ekleyerek kütüphaneyi oluşturmaya başlayın.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => (
            <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group flex flex-col">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(proj)} className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg">✏️</button>
                <button onClick={() => handleDelete(proj.id)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg">🗑️</button>
              </div>
              
              <div className="mb-4">
                <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md font-medium border border-indigo-500/30">
                  {proj.category}
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md font-medium ml-2">
                  {proj.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{proj.title}</h3>
              <p className="text-slate-400 text-sm flex-1">{proj.summary}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Gerekli Malzemeler</h4>
                <p className="text-slate-300 text-xs truncate" title={proj.materials}>
                  {proj.materials || '-'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
