import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { createEvent, getUserEvents, deleteEvent, markEventAsNotified, createNotification } from '../firebase/schema'

export default function CalendarPlanner() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', time: ''
  })

  useEffect(() => {
    if (user?.uid) {
      loadEvents()
      requestNotificationPermission()
    }
  }, [user])

  // Gerçek zamanlı bildirim kontrolü (Her 30 saniyede bir kontrol et)
  useEffect(() => {
    if (!events.length) return;
    
    const interval = setInterval(() => {
      const now = new Date()
      events.forEach(async (event) => {
        if (!event.notified && event.eventDate) {
          const evDate = event.eventDate.toDate ? event.eventDate.toDate() : new Date(event.eventDate)
          // Eğer etkinlik saati geldiyse veya geçtiyse (en fazla 15 dakika geçmişse)
          if (now >= evDate && (now - evDate) < 15 * 60 * 1000) {
            triggerNotification(event)
          }
        }
      })
    }, 30000)
    
    return () => clearInterval(interval)
  }, [events])

  async function loadEvents() {
    setLoading(true)
    try {
      const res = await getUserEvents(user.uid)
      setEvents(res)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }

  async function triggerNotification(event) {
    // 1. Tarayıcı (Masaüstü) Bildirimi
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ Yaklaşan Etkinlik / Toplantı", {
        body: event.title + "\n" + event.description,
        icon: "/ohep.jpeg" // Varsa logo eklenebilir
      })
    }
    
    // 2. Sistem İçi Bildirim (Çan ikonu)
    await createNotification(user.uid, {
      title: "Takvim Hatırlatıcısı",
      message: `${event.title} saati geldi.`,
      type: "system",
      link: "#"
    })

    // 3. Veritabanında işaretle
    await markEventAsNotified(event.id)
    
    // State'i güncelle
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, notified: true } : e))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      // Tarih ve saati birleştir
      const datetimeStr = `${formData.date}T${formData.time}:00`
      
      await createEvent({
        userId: user.uid,
        title: formData.title,
        description: formData.description,
        eventDate: datetimeStr
      })
      
      setShowForm(false)
      setFormData({ title: '', description: '', date: '', time: '' })
      loadEvents()
    } catch (err) {
      alert('Kaydedilirken hata oluştu: ' + err.message)
      console.error(err)
    }
  }

  async function handleDelete(id) {
    if (confirm('Bu etkinliği takvimden silmek istediğinize emin misiniz?')) {
      await deleteEvent(id)
      loadEvents()
    }
  }

  // Yaklaşan ve geçmiş olarak ikiye ayır
  const now = new Date()
  const upcomingEvents = events.filter(e => {
    const d = e.eventDate?.toDate ? e.eventDate.toDate() : new Date(e.eventDate)
    return d >= now || (!e.notified && (now - d) < 15 * 60 * 1000)
  })
  
  const pastEvents = events.filter(e => {
    const d = e.eventDate?.toDate ? e.eventDate.toDate() : new Date(e.eventDate)
    return d < now && e.notified
  })

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-white text-2xl font-bold mb-2">Ajanda ve Takvim</h2>
          <p className="text-slate-400">Toplantı, ders ve görüşmelerinizi planlayın, vakti geldiğinde bildirim alın.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold transition-colors"
        >
          {showForm ? 'Kapat' : '+ Yeni Etkinlik'}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-white mb-4">Etkinlik Ekle</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Tarih</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Saat</label>
                <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white" />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Başlık</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white" placeholder="Örn: Veli Toplantısı" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Açıklama (Opsiyonel)</label>
              <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white" placeholder="Toplantı linki veya notlar..." />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Kaydet ve Hatırlatıcı Kur
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400">Yükleniyor...</div>
      ) : (
        <div className="space-y-8">
          {/* Yaklaşan Etkinlikler */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-emerald-400">●</span> Yaklaşanlar
            </h3>
            {upcomingEvents.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
                Yaklaşan bir etkinlik yok.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(ev => {
                  const d = ev.eventDate?.toDate ? ev.eventDate.toDate() : new Date(ev.eventDate)
                  return (
                    <div key={ev.id} className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                      <div className="flex items-center gap-4">
                        <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg px-4 py-2 text-center min-w-[80px]">
                          <div className="text-xl font-black leading-none mb-1">{d.getDate()}</div>
                          <div className="text-[10px] uppercase font-bold">{d.toLocaleString('tr-TR', { month: 'short' })}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold">{ev.title}</span>
                            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-medium border border-slate-700 flex items-center gap-1">
                              <span>⏰</span> {d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {ev.description && <p className="text-slate-400 text-sm truncate max-w-md">{ev.description}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(ev.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all">
                        🗑️ İptal Et
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Geçmiş Etkinlikler */}
          {pastEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Geçmiş</h3>
              <div className="space-y-2 opacity-60">
                {pastEvents.map(ev => {
                  const d = ev.eventDate?.toDate ? ev.eventDate.toDate() : new Date(ev.eventDate)
                  return (
                    <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs w-24">{d.toLocaleDateString('tr-TR')} {d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-slate-400 line-through text-sm">{ev.title}</span>
                      </div>
                      <button onClick={() => handleDelete(ev.id)} className="text-slate-600 hover:text-red-400 text-xs hidden group-hover:block">Sil</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
