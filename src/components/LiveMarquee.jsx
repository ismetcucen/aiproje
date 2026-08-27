import { useState, useEffect } from 'react'
import { getLatestAnnouncements } from '../firebase/schema'
import { useAuth } from '../hooks/useAuth'

export default function LiveMarquee() {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    if (!profile) return
    loadData()
    const interval = setInterval(loadData, 60000) // 1 dakikada bir yenile
    return () => clearInterval(interval)
  }, [profile])

  async function loadData() {
    try {
      const data = await getLatestAnnouncements(profile?.role)
      setAnnouncements(data)
    } catch(err) {}
  }

  if (announcements.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden py-2 px-4 shadow-md flex items-center relative z-50">
      <span className="font-bold flex-shrink-0 mr-4 bg-white/20 px-2 py-0.5 rounded text-sm uppercase tracking-wider animate-pulse">
        📢 Duyuru
      </span>
      <div className="flex-1 overflow-hidden whitespace-nowrap relative">
        <div className="inline-block animate-[marquee_20s_linear_infinite] hover:pause">
          {announcements.map((a, i) => (
            <span key={a.id} className="mx-8 font-medium">
              {a.message}
              {i !== announcements.length - 1 && <span className="mx-8 text-white/50">|</span>}
            </span>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .hover\:pause:hover { animation-play-state: paused; }
      `}} />
    </div>
  )
}
