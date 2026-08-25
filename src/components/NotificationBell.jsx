import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { listenUserNotifications, markNotificationAsRead } from '../firebase/schema'

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const unsub = listenUserNotifications(user.uid, (data) => {
      setNotifications(data)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  async function handleNotificationClick(notif) {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id)
    }
    setIsOpen(false)
  }

  async function markAllAsRead() {
    const unread = notifications.filter(n => !n.isRead)
    for (let n of unread) {
      await markNotificationAsRead(n.id)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors">
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-slate-950 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <h3 className="text-white font-bold text-sm">Bildirimler</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-indigo-400 text-xs font-semibold hover:text-indigo-300 transition-colors">
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Henüz bildiriminiz yok.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {notifications.map(n => (
                  <div key={n.id} onClick={() => handleNotificationClick(n)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-slate-800/50 flex gap-3 \${!n.isRead ? 'bg-indigo-500/5' : ''}`}>
                    <div className="flex-shrink-0 text-2xl">
                      {n.type === 'assignment_new' ? '📝' : n.type === 'assignment_graded' ? '⭐' : '🔔'}
                    </div>
                    <div>
                      <h4 className={`text-sm mb-1 \${!n.isRead ? 'text-white font-bold' : 'text-slate-300 font-medium'}`}>
                        {n.title}
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <span className="text-slate-500 text-[10px] mt-2 block">
                        {n.createdAt?.toDate ? new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'}).format(n.createdAt.toDate()) : 'Az önce'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
