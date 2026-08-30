import { useState, useEffect } from 'react'
import { getDigitalBoardSettings, getLatestAnnouncements } from '../firebase/schema'
import LiveMarquee from '../components/LiveMarquee'

export default function DigitalBoardViewer() {
  const [settings, setSettings] = useState(null)
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [robotState, setRobotState] = useState({ visible: false, message: '' })

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




  // F1 Robot Facts (Kullanıcı girdiyse onu, girmediyse varsayılanı kullanır)
  const defaultFacts = [
    "Biliyor muydunuz? Mars'ta gün batımı mavi renktir.",
    "İnsan beyni, çalışırken yaklaşık 20 watt elektrik üretir.",
    "Venüs'te bir gün, Dünya'daki bir yıldan daha uzundur.",
    "Ahtapotların 3 kalbi ve mavi renkte kanları vardır.",
    "Everest Dağı her yıl yaklaşık 4 milimetre yükselmektedir.",
    "Bal bozulmayan tek yiyecektir. 3000 yıllık bal bile yenebilir.",
    "DNA'mızın %50'si muzlarınkiyle aynıdır."
  ]
  const FACTS = (settings?.robotFacts && settings.robotFacts.length > 0) ? settings.robotFacts : defaultFacts;

  // Slayt Gösterisi (Background Rotation)
  useEffect(() => {
    if (!settings?.backgroundImages || settings.backgroundImages.length <= 1) return;
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % settings.backgroundImages.length)
    }, 15000) // Change every 15 seconds
    return () => clearInterval(slideTimer)
  }, [settings?.backgroundImages])

  // F1 Robot Popup Logic
  useEffect(() => {
    const showRobot = () => {
      // Use the latest settings or fallback
      const activeFacts = (settings?.robotFacts && settings.robotFacts.length > 0) ? settings.robotFacts : defaultFacts;
      const randomFact = activeFacts[Math.floor(Math.random() * activeFacts.length)]
      setRobotState({ visible: true, message: randomFact })
      setTimeout(() => setRobotState({ visible: false, message: '' }), 20000)
    }
    
    const initialTimer = setTimeout(showRobot, 15000) // Show first fact after 15 seconds!
    const intervalTimer = setInterval(showRobot, 180000) // Then every 3 minutes
    
    return () => {
      clearTimeout(initialTimer)
      clearInterval(intervalTimer)
    }
  }, [])

  if (!settings) {
    return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Yükleniyor...</div>
  }

  // Calculate Full Countdowns
  const getCountdown = (targetDate) => {
    if (!targetDate) return null
    const target = new Date(targetDate)
    const now = new Date()
    const diff = target - now
    if (diff <= 0) return { expired: true }
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24))
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const m = Math.floor((diff / 1000 / 60) % 60)
    return { d, h, m, expired: false }
  }
  
  const renderCountdown = (targetDate) => {
    const cd = getCountdown(targetDate)
    if (!cd) return <span className="text-xl text-slate-500">-</span>
    if (cd.expired) return <span className="text-2xl font-black text-green-400 animate-pulse">GELDİ!</span>
    
    return (
      <div className="flex items-baseline gap-2">
        <div className="flex flex-col items-center"><span className="text-3xl font-black text-white">{cd.d}</span><span className="text-[10px] text-slate-400">GÜN</span></div>
        <span className="text-xl text-slate-600">:</span>
        <div className="flex flex-col items-center"><span className="text-3xl font-black text-white">{cd.h}</span><span className="text-[10px] text-slate-400">SAAT</span></div>
        <span className="text-xl text-slate-600">:</span>
        <div className="flex flex-col items-center"><span className="text-3xl font-black text-white">{cd.m}</span><span className="text-[10px] text-slate-400">DK</span></div>
      </div>
    )
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
        backgroundImage: `url('${
          settings.backgroundImages?.length > 0 
            ? (settings.backgroundImages[currentSlideIndex] || settings.backgroundImageUrl)
            : (settings.backgroundImageUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=3540&auto=format&fit=crop")
        }')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1.5s ease-in-out'
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0"></div>

      {/* Main Content Area */}
      <div className="relative z-10 h-full flex flex-col p-4 md:p-6 pb-16 md:pb-20 box-border">
        
        {/* Header: Logo / School Name & Clock */}
        <header className="flex justify-between items-center mb-4 md:mb-6 shrink-0">
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
        <div className="flex-1 grid grid-cols-12 gap-4 md:gap-6 min-h-0">
          
          {/* LEFT: Timetable & Menu */}
          <div className="col-span-4 flex flex-col gap-4 md:gap-6 min-h-0">
            {/* Zaman Çizelgesi */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl flex-1 flex flex-col min-h-0">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-indigo-300 mb-6 flex items-center gap-3">
                <span>⏱️</span> Zaman Çizelgesi
              </h2>
              <div className="space-y-2 md:space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl relative overflow-hidden shrink-0">
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
          <div className="col-span-4 flex flex-col gap-4 md:gap-6 min-h-0">
            
            {/* Hava Durumu */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl flex items-center justify-between shrink-0">
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
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl flex-1 flex flex-col min-h-0">
               <h2 className="text-xl font-bold uppercase tracking-widest text-fuchsia-300 mb-6 flex items-center gap-3">
                 <span>🎯</span> Sınavlara Kalan Zaman
               </h2>
               <div className="flex flex-col gap-3 flex-1 justify-center">
                 {/* LGS */}
                 <div className="bg-white/5 rounded-2xl p-3 flex items-center justify-between border border-white/10 shadow-inner">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-10 bg-gradient-to-b from-fuchsia-500 to-purple-500 rounded-full"></div>
                     <span className="text-xl font-black text-white tracking-widest">LGS</span>
                   </div>
                   {renderCountdown(settings.examDates?.lgs || '2027-06-13T09:00')}
                 </div>
                 {/* TYT */}
                 <div className="bg-white/5 rounded-2xl p-3 flex items-center justify-between border border-white/10 shadow-inner">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-10 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                     <span className="text-xl font-black text-white tracking-widest">TYT</span>
                   </div>
                   {renderCountdown(settings.examDates?.tyt || '2027-06-19T10:15')}
                 </div>
                 {/* AYT */}
                 <div className="bg-white/5 rounded-2xl p-3 flex items-center justify-between border border-white/10 shadow-inner">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-10 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                     <span className="text-xl font-black text-white tracking-widest">AYT</span>
                   </div>
                   {renderCountdown(settings.examDates?.ayt || '2027-06-20T10:15')}
                 </div>
                 {/* YDT */}
                 <div className="bg-white/5 rounded-2xl p-3 flex items-center justify-between border border-white/10 shadow-inner">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-10 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                     <span className="text-xl font-black text-white tracking-widest">YDT</span>
                   </div>
                   {renderCountdown(settings.examDates?.ydt || '2027-06-20T15:45')}
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT: Duty Teachers & Quote */}
          <div className="col-span-4 flex flex-col gap-4 md:gap-6 min-h-0">
            {/* Nöbetçi Öğretmenler */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl flex-1 flex flex-col min-h-0">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-emerald-300 mb-6 flex items-center gap-3">
                <span>🛡️</span> Nöbetçi Öğretmenler
              </h2>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
              <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-xl rounded-3xl p-4 md:p-6 border border-indigo-500/30 shadow-2xl text-center relative overflow-hidden shrink-0">
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

            {/* F1 Robot Asistan Popup */}
      <div className={`absolute bottom-24 right-8 z-40 flex items-end gap-4 transition-all duration-700 transform ${robotState.visible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'}`}>
        <div className="bg-white text-slate-800 p-5 rounded-3xl rounded-br-none shadow-2xl max-w-sm border-2 border-indigo-500 relative animate-bounce-slight">
          <div className="absolute w-4 h-4 bg-white border-r-2 border-b-2 border-indigo-500 transform rotate-45 -bottom-2 right-4"></div>
          <p className="font-bold text-lg leading-relaxed">{robotState.message}</p>
        </div>
        <div className="w-32 h-32 relative group">
           <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
           <div className="relative w-full h-full bg-slate-900 border-4 border-indigo-400 rounded-full overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center text-6xl">
             🤖
           </div>
           <div className="absolute -bottom-2 bg-indigo-600 text-white text-xs font-black px-4 py-1 rounded-full left-1/2 transform -translate-x-1/2 whitespace-nowrap shadow-lg">F1 ASİSTAN</div>
        </div>
      </div>

      {/* Marquee Banner (Absolute Bottom) */}
      <div className="absolute bottom-0 left-0 w-full z-20">
        <LiveMarquee />
      </div>

    </div>
  )
}
