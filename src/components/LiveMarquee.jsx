import { useState, useEffect } from 'react'
import { getLatestAnnouncements } from '../firebase/schema'
import { useAuth } from '../hooks/useAuth'

export default function LiveMarquee() {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    // allow fetching if not logged in
    loadData()
    const interval = setInterval(loadData, 60000) // 1 dakikada bir yenile
    return () => clearInterval(interval)
  }, [profile])

  async function loadData() {
    try {
      const data = await getLatestAnnouncements(profile?.role || 'all')
      console.log("Fetched announcements:", data)
      setAnnouncements(data)
    } catch(err) {
      console.error("Error fetching announcements:", err)
      setAnnouncements([{ id: 'err', message: 'Veri çekilirken hata oluştu: ' + err.message }]);
    }
  }

  const displayAnnouncements = announcements.length > 0 ? announcements : [{ id: 'empty', message: 'Şu an aktif bir duyuru bulunmamaktadır.' }];

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-xl border-b border-white/10 text-slate-200 overflow-hidden shadow-2xl flex items-center relative z-50 h-12">
      {/* Sol Sabit Kısım (Haber Bülteni Tarzı) */}
      <div className="flex-shrink-0 h-full bg-gradient-to-r from-red-600 to-red-700 flex items-center px-4 relative z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <span className="font-black text-white text-xs md:text-sm uppercase tracking-widest">
            ÖHEP BİLİŞİM DUYURU
          </span>
        </div>
        {/* Sağa doğru üçgen kesimi (CSS üçgen hilesi) */}
        <div className="absolute top-0 -right-4 w-0 h-0 border-y-[24px] border-y-transparent border-l-[16px] border-l-red-700"></div>
      </div>

      {/* Kayan Yazı Alanı */}
      <div className="flex-1 overflow-hidden whitespace-nowrap relative ml-6">
        <div className="inline-block animate-[marquee_25s_linear_infinite] hover:pause pl-4">
          {displayAnnouncements.map((a, i) => (
            <span key={a.id} className="inline-flex items-center">
              <span className="text-sm md:text-base font-medium text-slate-100 tracking-wide">
                {a.message}
              </span>
              {i !== displayAnnouncements.length - 1 && (
                <span className="mx-12 text-red-500 font-black text-lg">•</span>
              )}
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
