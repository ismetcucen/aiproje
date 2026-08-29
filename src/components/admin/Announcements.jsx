import { useState, useEffect } from 'react'
import { createAnnouncement, getLatestAnnouncements, deleteAnnouncement, deleteAllAnnouncements } from '../../firebase/schema'
import { useAuth } from '../../hooks/useAuth'

export default function Announcements() {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [message, setMessage] = useState('')
  const [targetRole, setTargetRole] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const data = await getLatestAnnouncements('all')
    setList(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message) return
    await createAnnouncement({ message, targetRole, createdBy: user.uid })
    setMessage('')
    loadData()
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-slate-800 text-2xl font-bold mb-2">Canlı Duyuru Panosu</h2>
        <p className="text-slate-500">Tüm okula veya sadece öğrencilere/öğretmenlere anlık duyuru geçin.</p>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-slate-500 text-sm mb-2">Duyuru Mesajı</label>
            <input required value={message} onChange={e => setMessage(e.target.value)} className="w-full bg-white shadow-sm border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500" placeholder="Örn: Yarınki kodlama dersi 15:00'e alınmıştır..." />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <label className="block text-slate-500 text-sm mb-2">Hedef Kitle</label>
              <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="bg-white shadow-sm border border-slate-200 rounded-lg px-4 py-2 text-slate-800 outline-none">
                <option value="all">Tüm Okul (Öğrenci + Öğretmen)</option>
                <option value="student">Sadece Öğrenciler</option>
                <option value="teacher">Sadece Öğretmenler</option>
              </select>
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
              Duyuruyu Yayınla
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">Aktif Duyurular (Son 5)</h3>
          {list.length > 0 && (
            <button 
              onClick={async () => {
                if(window.confirm('Tüm duyuruları silmek istediğinize emin misiniz?')) {
                  await deleteAllAnnouncements();
                  loadData();
                }
              }} 
              className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg font-bold transition-colors"
            >
              Tümünü Sil
            </button>
          )}
        </div>
        {list.map(a => (
          <div key={a.id} className="bg-white shadow-sm border border-slate-200 rounded-xl p-4 flex justify-between items-center group">
            <div>
              <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded font-medium mr-3 border border-slate-200 uppercase">
                {a.targetRole === 'all' ? 'Tümü' : (a.targetRole === 'student' ? 'Öğrenci' : 'Öğretmen')}
              </span>
              <span className="text-slate-800">{a.message}</span>
            </div>
            <button onClick={async () => { await deleteAnnouncement(a.id); loadData() }} className="text-slate-500 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Yayından Kaldır
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
