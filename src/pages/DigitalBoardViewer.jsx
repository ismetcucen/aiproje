import { useState, useEffect } from 'react'
import { getDigitalBoardSettings, getLatestAnnouncements } from '../firebase/schema'
import LiveMarquee from '../components/LiveMarquee'

export default function DigitalBoardViewer() {
  const [settings, setSettings] = useState(null)
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState(null)

  // Config: 'OHEP' is the default school code
  const schoolCode = 'OHEP'

  useEffect(() => {
    // Initial fetch
    getDigitalBoardSettings(schoolCode).then(data => setSettings(data))
    
    // Refresh settings every 10 minutes (600000ms) to catch updates without exhausting reads
    const interval = setInterval(() => {
      getDigitalBoardSettings(schoolCode).then(data => setSettings(data))
    }, 600000)
    
    return () => clearInterval(interval)
  }, [])

  // Hava durumu çek (Alanya)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=36.5438&longitude=31.9998&current_weather=true&timezone=Europe%2FIstanbul')
        const data = await res.json()
        setWeather(data.current_weather)
      } catch (e) {
        console.error("Hava durumu hatası", e)
      }
    }
    fetchWeather()
    const weatherInterval = setInterval(fetchWeather, 1800000) // 30 mins
    return () => clearInterval(weatherInterval)
  }, [])

  // Clock tick every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!settings) {
    return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Yükleniyor...</div>
  }

  // Calculate Countdowns
  const calculateDaysLeft = (targetDate) => {
    if (!targetDate) return '-'
    const target = new Date(targetDate)
    const now = new Date()
    const diff = target - now
    if (diff <= 0) return 'GELDi!'
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // Check current timetable
  const currentMinutes = time.getHours() * 60 + time.getMinutes()

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️' // clear
    if (code === 1 || code === 2 || code === 3) return '⛅' // partly cloudy
    if (code >= 45 && code <= 48) return '🌫️' // fog
    if (code >= 51 && code <= 67) return '🌧️' // rain/drizzle
    if (code >= 71 && code <= 77) return '❄️' // snow
    if (code >= 80 && code <= 82) return '🌦️' // rain showers
    if (code >= 95) return '⛈️' // thunderstorm
    return '🌡️'
  }

  
  return (
    <div 
      className="h-screen w-full relative overflow-hidden text-white font-sans selection:bg-none"
      style={{
        backgroundImage: `url('${settings.backgroundImageUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=3540&auto=format&fit=crop"}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0"></div>

      {/* Main Content Area */}
      <div className="relative z-10 h-full flex flex-col p-8 pb-20">
        
        {/* Header: Logo / School Name & Clock */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              <img src="/ohep.jpeg" alt="Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 drop-shadow-md">
                CEV ÖHEP OKULLARI
              </h1>
              <p className="text-xl font-light text-slate-300 uppercase tracking-[0.3em] mt-1">Dijital Bilgi Ekranı</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-7xl font-black tabular-nums tracking-tighter drop-shadow-2xl flex items-baseline gap-2 justify-end">
              {time.getHours().toString().padStart(2, '0')}
              <span className="text-indigo-400 animate-pulse">:</span>
              {time.getMinutes().toString().padStart(2, '0')}
              <span className="text-3xl text-slate-400 ml-2">{time.getSeconds().toString().padStart(2, '0')}</span>
            </div>
            <div className="text-2xl font-medium text-slate-300 uppercase tracking-widest mt-1">
              {time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* 3-Column Layout */}
        <div className="flex-1 grid grid-cols-12 gap-8">
          
          {/* LEFT: Timetable & Menu */}
          <div className="col-span-4 flex flex-col gap-8">
            {/* Zaman Çizelgesi */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl flex-1 flex flex-col">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-indigo-300 mb-6 flex items-center gap-3">
                <span>⏱️</span> Zaman Çizelgesi
              </h2>
              <div className="space-y-3 flex-1 overflow-hidden">
                {(settings.timetable || []).map((t, idx) => {
                  let isCurrent = false;
                  // Basic time parsing logic for active row highlight (e.g., "08:30 - 09:10")
                  if (t.time && t.time.includes('-')) {
                    const [startStr, endStr] = t.time.split('-').map(s => s.trim())
                    const [sh, sm] = startStr.split(':').map(Number)
                    const [eh, em] = endStr.split(':').map(Number)
                    if (!isNaN(sh) && !isNaN(eh)) {
                      const startMin = sh * 60 + sm
                      const endMin = eh * 60 + em
                      if (currentMinutes >= startMin && currentMinutes <= endMin) {
                        isCurrent = true;
                      }
                    }
                  }
                  
                  return (
                    <div key={idx} className={`flex justify-between items-center p-3 rounded-2xl transition-all duration-500 ${
                      isCurrent 
                        ? 'bg-indigo-600 border border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.5)] scale-105 transform' 
                        : 'bg-white/5 border border-white/5'
                    }`}>
                      <span className={`font-bold text-lg ${isCurrent ? 'text-white' : 'text-slate-300'}`}>{t.label}</span>
                      <span className={`font-black tracking-widest ${isCurrent ? 'text-white' : 'text-indigo-400'}`}>{t.time}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Günün Menüsü */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 text-9xl opacity-10">🍲</div>
              <h2 className="text-2xl font-bold uppercase tracking-widest text-orange-300 mb-5 flex items-center gap-3 relative z-10">
                <span>🍽️</span> Günün Menüsü
              </h2>
              <ul className="space-y-4 relative z-10">
                {(settings.dailyMenu || []).map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-xl font-medium text-slate-200 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold shadow-lg">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
                {(!settings.dailyMenu || settings.dailyMenu.length === 0) && (
                  <p className="text-slate-400 italic bg-white/5 p-4 rounded-xl text-center">Günün menüsü henüz girilmedi.</p>
                )}
              </ul>
            </div>
          </div>

          {/* MIDDLE: Weather & Exams Countdowns */}
          <div className="col-span-4 flex flex-col gap-6">
            
            {/* Hava Durumu */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-sky-300 mb-1 flex items-center gap-2">
                  <span>📍</span> Alanya
                </h2>
                <p className="text-slate-400 text-sm">Anlık Hava Durumu</p>
              </div>
              {weather ? (
                <div className="flex items-center gap-4">
                  <span className="text-6xl drop-shadow-lg">{getWeatherIcon(weather.weathercode)}</span>
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-white">{Math.round(weather.temperature)}°</span>
                    <span className="text-sky-200 text-xs font-bold uppercase">{weather.windspeed} km/s</span>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 text-sm">Yükleniyor...</span>
              )}
            </div>

            {/* Sınavlara Kalan Zaman (Küçültüldü) */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl flex-1 flex flex-col">
               <h2 className="text-xl font-bold uppercase tracking-widest text-fuchsia-300 mb-6 flex items-center gap-3">
                 <span>🎯</span> Sınavlara Kalan Zaman
               </h2>
               <div className="flex flex-col gap-4 flex-1 justify-center">
                 {/* LGS */}
                 <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/10">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-10 bg-gradient-to-b from-fuchsia-500 to-purple-500 rounded-full"></div>
                     <span className="text-2xl font-black text-white tracking-widest">LGS</span>
                   </div>
                   <div className="flex items-baseline gap-1.5">
                     <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">
                       {calculateDaysLeft(settings.examDates?.lgs)}
                     </span>
                     <span className="text-sm text-slate-400 uppercase font-bold">GÜN</span>
                   </div>
                 </div>
                 {/* TYT */}
                 <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/10">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-10 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                     <span className="text-2xl font-black text-white tracking-widest">TYT</span>
                   </div>
                   <div className="flex items-baseline gap-1.5">
                     <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                       {calculateDaysLeft(settings.examDates?.tyt)}
                     </span>
                     <span className="text-sm text-slate-400 uppercase font-bold">GÜN</span>
                   </div>
                 </div>
                 {/* AYT */}
                 <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/10">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-10 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                     <span className="text-2xl font-black text-white tracking-widest">AYT</span>
                   </div>
                   <div className="flex items-baseline gap-1.5">
                     <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                       {calculateDaysLeft(settings.examDates?.ayt)}
                     </span>
                     <span className="text-sm text-slate-400 uppercase font-bold">GÜN</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT: Duty Teachers & Quote */}
          <div className="col-span-4 flex flex-col gap-8">
            {/* Nöbetçi Öğretmenler */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl flex-1">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-emerald-300 mb-6 flex items-center gap-3">
                <span>🛡️</span> Nöbetçi Öğretmenler
              </h2>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">İLKOKUL</span>
                  <span className="text-2xl font-black text-white">{settings.dutyTeachers?.primary || '-'}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">ORTAOKUL</span>
                  <span className="text-2xl font-black text-white">{settings.dutyTeachers?.middle || '-'}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">LİSE</span>
                  <span className="text-2xl font-black text-white">{settings.dutyTeachers?.high || '-'}</span>
                </div>
              </div>
            </div>

            {/* Günün Sözü */}
            {settings.quoteOfTheDay && (
              <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-xl rounded-3xl p-8 border border-indigo-500/30 shadow-2xl text-center relative overflow-hidden">
                 <div className="text-6xl text-indigo-400/20 absolute -top-4 -left-2 font-serif">"</div>
                 <p className="text-xl font-medium text-white italic leading-relaxed relative z-10">
                   "{settings.quoteOfTheDay}"
                 </p>
                 <div className="text-6xl text-indigo-400/20 absolute -bottom-10 -right-2 font-serif">"</div>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Marquee Banner (Absolute Bottom) */}
      <div className="absolute bottom-0 left-0 w-full z-20">
        <LiveMarquee />
      </div>

    </div>
  )
}
