import { useState, useEffect } from 'react'
import { getDigitalBoardSettings, getLatestAnnouncements } from '../firebase/schema'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import LiveMarquee from '../components/LiveMarquee'
import confetti from 'canvas-confetti'
import { getTodaysLunchMenu } from '../data/weeklyMenu'

const PAGE_LOAD_TIME = Date.now();

export default function DigitalBoardViewer() {
  const [settings, setSettings] = useState(null)
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showAchievements, setShowAchievements] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Config: 'OHEP' is the default school code
  const schoolCode = 'OHEP'

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFs)
    return () => document.removeEventListener('fullscreenchange', handleFs)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }
  }


  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'school_settings', `digital_board_${schoolCode}`), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(data);
        
        // Handle Live Events
        if (data.liveEvent && data.liveEvent.timestamp > PAGE_LOAD_TIME) {
           if (!window.lastLiveEventTimestamp || data.liveEvent.timestamp > window.lastLiveEventTimestamp) {
             window.lastLiveEventTimestamp = data.liveEvent.timestamp;
             
             if (data.liveEvent.type === 'confetti') {
               confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, zIndex: 999999 });
             } else if (data.liveEvent.type === 'announcement') {
               try {
                 const u = new SpeechSynthesisUtterance(data.liveEvent.payload);
                 u.lang = 'tr-TR';
                 u.pitch = 1.2;
                 u.rate = 0.9;
                 window.speechSynthesis.speak(u);
               } catch(err) {
                 console.error("Speech error", err)
               }
             } else if (data.liveEvent.type === 'reload') {
               window.location.reload();
             }
           }
        }
      }
    });
    
    return () => unsub();
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




  // Slayt Gösterisi (Background Rotation)
  useEffect(() => {
    if (!settings?.backgroundImages || settings.backgroundImages.length <= 1) return;
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % settings.backgroundImages.length)
    }, 15000) // Change every 15 seconds
    return () => clearInterval(slideTimer)
  }, [settings?.backgroundImages])



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
    if (!cd) return <span className="text-sm lg:text-base text-slate-500">-</span>
    if (cd.expired) return <span className="text-base lg:text-xl font-black text-green-400 animate-pulse">GELDİ!</span>
    
    return (
      <div className="flex items-baseline gap-1 lg:gap-1.5">
        <div className="flex flex-col items-center justify-center min-w-[2rem]"><span className="text-base sm:text-lg lg:text-xl font-black text-white">{cd.d}</span><span className="text-[9px] text-slate-400">GÜN</span></div>
        <span className="text-sm lg:text-base text-slate-600">:</span>
        <div className="flex flex-col items-center justify-center min-w-[2rem]"><span className="text-base sm:text-lg lg:text-xl font-black text-white">{cd.h}</span><span className="text-[9px] text-slate-400">SAAT</span></div>
        <span className="text-sm lg:text-base text-slate-600">:</span>
        <div className="flex flex-col items-center justify-center min-w-[2rem]"><span className="text-base sm:text-lg lg:text-xl font-black text-white">{cd.m}</span><span className="text-[9px] text-slate-400">DK</span></div>
      </div>
    )
  }

  // Achievement Wall Logic
  useEffect(() => {
    const showWall = () => {
      setShowAchievements(true)
      setTimeout(() => setShowAchievements(false), 20000) // Show for 20 seconds
    }
    
    const initialWallTimer = setTimeout(showWall, 60000) // First show after 1 min
    const intervalWallTimer = setInterval(showWall, 300000) // Then every 5 minutes
    
    return () => {
      clearTimeout(initialWallTimer)
      clearInterval(intervalWallTimer)
    }
  }, [])

  if (!settings) {
    return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Yükleniyor...</div>
  }

  // Check current timetable
  const currentMinutes = time.getHours() * 60 + time.getMinutes()

  // Get active lunch menu (from settings if customized, otherwise official weekly schedule)
  const todaysLunch = getTodaysLunchMenu(settings?.dailyMenu, settings?.dailyMenuCalorie, time)

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
      className="fixed inset-0 w-full overflow-hidden text-white font-sans selection:bg-none flex flex-col"
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

      
      {/* BAŞARI DUVARI OVERLAY */}
      {showAchievements && settings?.achievements && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl animate-[fadeIn_0.5s_ease-out]">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-6xl p-8 text-center animate-[slideUp_0.8s_ease-out]">
            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-2xl mb-4 tracking-tight">
              🏆 HAFTANIN YILDIZLARI 🏆
            </h2>
            <p className="text-2xl text-slate-300 mb-16 tracking-widest  font-light">ÖHEP AI STUDİO GURUR TABLOSU</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all">
                <div className="text-6xl mb-4">💻</div>
                <h3 className="text-xl font-bold text-indigo-300  tracking-wider mb-2">HAFTANIN KODLAYICISI</h3>
                <p className="text-3xl font-black text-white">{settings.achievements.coderOfTheWeek}</p>
              </div>
              
              <div className="bg-gradient-to-b from-amber-500/20 to-yellow-500/10 backdrop-blur-md border border-yellow-500/30 p-10 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] transform scale-110 z-10">
                <div className="text-7xl mb-4 animate-bounce">🌟</div>
                <h3 className="text-2xl font-bold text-yellow-300  tracking-wider mb-2">HAFTANIN ÖĞRENCİSİ</h3>
                <p className="text-4xl font-black text-white">{settings.achievements.studentOfTheWeek}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-emerald-300  tracking-wider mb-2">HAFTANIN ROBOTİK PROJESİ</h3>
                <p className="text-3xl font-black text-white">{settings.achievements.roboticProject}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-center justify-center gap-6">
                <div className="text-5xl">🧠</div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-purple-300  tracking-wider mb-1">PROBLEM ÇÖZÜCÜ</h3>
                  <p className="text-2xl font-black text-white">{settings.achievements.problemSolver}</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-center justify-center gap-6">
                <div className="text-5xl">📈</div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-blue-300  tracking-wider mb-1">EN ÇOK GELİŞİM GÖSTEREN</h3>
                  <p className="text-2xl font-black text-white">{settings.achievements.mostImproved}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Button */}
      <button 
        onClick={toggleFullscreen}
        title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap (F11)"}
        className="absolute top-2.5 right-3 z-50 bg-black/40 hover:bg-black/65 active:scale-95 text-white/90 hover:text-white px-2.5 py-1.5 rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg"
      >
        <span className="text-sm">{isFullscreen ? '✕' : '⛶'}</span>
        <span className="hidden sm:inline">{isFullscreen ? 'Pencere Modu' : 'Tam Ekran'}</span>
      </button>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col px-3 sm:px-6 py-2 sm:py-3 box-border overflow-hidden w-full justify-between">
        
        {/* Header: Logo / School Name & Title */}
        <header className="flex flex-col justify-center items-center mb-1 lg:mb-2 shrink-0 w-full relative">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 drop-shadow-2xl">
              CEV ÖHEP OKULLARI
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg font-light text-slate-300 tracking-[0.35em] mt-0.5">DİJİTAL BİLGİ EKRANI</p>
          </div>
        </header>

        {/* 3-Column Layout */}
        <div className="flex-1 grid grid-cols-12 gap-3 sm:gap-4 lg:gap-6 min-h-0 items-stretch">
          
          {/* LEFT: Timetable & Menu */}
          <div className="col-span-12 md:col-span-4 flex flex-col min-h-0">
            {/* Günün Menüsü */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-5 border border-white/10 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between">
              <div className="absolute -right-8 -bottom-8 text-8xl opacity-10 pointer-events-none">🍲</div>
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5 lg:mb-3 relative z-10">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-wider text-orange-300 flex items-center gap-2">
                    <span>🍽️</span> GÜNÜN ÖĞLE YEMEĞİ
                  </h2>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] lg:text-xs font-bold px-2 py-0.5 rounded-full bg-orange-400/20 text-orange-200 border border-orange-400/30">
                      {todaysLunch.dayName}
                    </span>
                    {todaysLunch.calorie && (
                      <span className="text-[10px] lg:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {todaysLunch.calorie}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5 sm:space-y-2 lg:space-y-2.5 relative z-10">
                  {todaysLunch.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm lg:text-base font-medium text-slate-100 bg-white/5 hover:bg-white/10 transition-colors p-2 px-3 rounded-xl border border-white/5">
                      <span className="flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-white text-[10px] lg:text-xs font-bold shadow-md">✓</span>
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                  {todaysLunch.items.length === 0 && (
                    <p className="text-slate-400 italic bg-white/5 p-3 rounded-xl text-center text-xs">Günün menüsü henüz girilmedi.</p>
                  )}
                </ul>
              </div>
              <p className="text-[9px] lg:text-[10px] text-slate-400/70 tracking-wide mt-2 text-right">Hamdullah Emin Paşa Koleji Beslenme Programı</p>
            </div>
          </div>

          {/* MIDDLE: Weather & Quote */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-2.5 sm:gap-3 lg:gap-4 min-h-0 justify-between">
            {/* Hava Durumu */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl lg:rounded-3xl p-2.5 sm:p-3 lg:p-4 border border-white/10 shadow-2xl flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm lg:text-base font-bold tracking-widest text-sky-300 mb-0.5 flex items-center gap-1.5">
                  <span>📍</span> Alanya
                </h2>
                <p className="text-slate-400 text-[11px] lg:text-xs">Anlık Hava Durumu</p>
              </div>
              {weather ? (
                <div className="flex items-center gap-2.5 lg:gap-3">
                  <span className="text-3xl lg:text-4xl drop-shadow-lg">{getWeatherIcon(weather.weathercode)}</span>
                  <div className="flex flex-col">
                    <span className="text-2xl lg:text-3xl font-black text-white leading-none">{Math.round(weather.temperature)}°</span>
                    <span className="text-sky-200 text-[10px] font-bold mt-0.5">{weather.windspeed} km/s</span>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 text-xs">Yükleniyor...</span>
              )}
            </div>
            
            {/* Saat ve Tarih (Kompakt ve Dengeli) */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 border border-white/10 shadow-2xl flex-1 flex flex-col items-center justify-center transform hover:scale-[1.02] transition-all">
              <div className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-black tabular-nums tracking-tighter drop-shadow-2xl flex items-baseline gap-1 lg:gap-2">
                {time.getHours().toString().padStart(2, '0')}
                <span className="text-indigo-400 animate-pulse">:</span>
                {time.getMinutes().toString().padStart(2, '0')}
                <span className="text-xl sm:text-2xl lg:text-3xl text-slate-400 ml-1.5">{time.getSeconds().toString().padStart(2, '0')}</span>
              </div>
              <div className="text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-slate-300 tracking-widest mt-2 uppercase text-center">
                {time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Günün Sözü */}
            {settings.quoteOfTheDay && (
              <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-2.5 sm:p-3 lg:p-4 border border-indigo-500/30 shadow-2xl text-center relative overflow-hidden shrink-0">
                 <div className="text-4xl text-indigo-400/20 absolute -top-2 -left-1 font-serif">"</div>
                 <p className="text-xs sm:text-sm lg:text-base font-medium text-white italic leading-relaxed relative z-10 px-3">
                   "{settings.quoteOfTheDay}"
                 </p>
                 <div className="text-4xl text-indigo-400/20 absolute -bottom-4 -right-1 font-serif">"</div>
              </div>
            )}
          </div>

          {/* RIGHT: Exams */}
          <div className="col-span-12 md:col-span-4 flex flex-col min-h-0">
            {/* Sınavlara Kalan Zaman */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-5 border border-white/10 shadow-2xl flex-1 flex flex-col justify-between">
               <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-wider text-fuchsia-300 mb-2 flex items-center gap-2">
                 <span>🎯</span> Sınavlara Kalan Zaman
               </h2>
               <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 justify-center">
                 {/* LGS */}
                 <div className="bg-white/5 rounded-xl lg:rounded-2xl p-1.5 sm:p-2 px-3 flex items-center justify-between border border-white/10 shadow-sm">
                   <div className="flex items-center gap-2.5">
                     <div className="w-1.5 h-6 lg:h-7 bg-gradient-to-b from-fuchsia-500 to-purple-500 rounded-full"></div>
                     <span className="text-sm sm:text-base lg:text-lg font-black text-white tracking-wider">LGS</span>
                   </div>
                   {renderCountdown(settings.examDates?.lgs || '2027-06-13T09:00')}
                 </div>
                 {/* TYT */}
                 <div className="bg-white/5 rounded-xl lg:rounded-2xl p-1.5 sm:p-2 px-3 flex items-center justify-between border border-white/10 shadow-sm">
                   <div className="flex items-center gap-2.5">
                     <div className="w-1.5 h-6 lg:h-7 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                     <span className="text-sm sm:text-base lg:text-lg font-black text-white tracking-wider">TYT</span>
                   </div>
                   {renderCountdown(settings.examDates?.tyt || '2027-06-19T10:15')}
                 </div>
                 {/* AYT */}
                 <div className="bg-white/5 rounded-xl lg:rounded-2xl p-1.5 sm:p-2 px-3 flex items-center justify-between border border-white/10 shadow-sm">
                   <div className="flex items-center gap-2.5">
                     <div className="w-1.5 h-6 lg:h-7 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                     <span className="text-sm sm:text-base lg:text-lg font-black text-white tracking-wider">AYT</span>
                   </div>
                   {renderCountdown(settings.examDates?.ayt || '2027-06-20T10:15')}
                 </div>
                 {/* YDT */}
                 <div className="bg-white/5 rounded-xl lg:rounded-2xl p-1.5 sm:p-2 px-3 flex items-center justify-between border border-white/10 shadow-sm">
                   <div className="flex items-center gap-2.5">
                     <div className="w-1.5 h-6 lg:h-7 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                     <span className="text-sm sm:text-base lg:text-lg font-black text-white tracking-wider">YDT</span>
                   </div>
                   {renderCountdown(settings.examDates?.ydt || '2027-06-20T15:45')}
                 </div>
               </div>
            </div>
          </div>
          
        </div>
      </div>


      {/* UNIFIED FOOTER: Timetable + Marquee */}
      <div className="w-full shrink-0 bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-full px-6 py-3 flex items-center gap-6">
          <h2 className="text-lg font-black tracking-widest text-indigo-300 flex flex-col items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-2xl">⏱️</span>
            <span className="text-[10px] text-slate-400">ZAMAN ÇİZELGESİ</span>
          </h2>
          
          <div className="flex w-full overflow-x-auto hide-scrollbar">
            <div className="flex flex-row gap-2 w-max pr-6 items-center">
              {(settings.timetable || []).map((t, idx) => {
                let isCurrent = false;
                const isLunch = t.label && (t.label.toLowerCase().includes('yemek') || t.label.toLowerCase().includes('öğle'));
                const isBreak = t.label && (t.label.toLowerCase().includes('teneffüs') || isLunch);
                
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
                
                let boxClass = 'bg-indigo-900/30 border border-indigo-500/20';
                let textClass = 'text-indigo-200';
                let timeClass = 'text-indigo-300';
                
                if (isCurrent && isLunch) {
                   boxClass = 'bg-orange-500 border-2 border-yellow-300 shadow-[0_0_15px_#fb923c] scale-105 transform z-20 relative animate-pulse';
                   textClass = 'text-white';
                   timeClass = 'text-yellow-100';
                } else if (isCurrent && isBreak) {
                   boxClass = 'bg-emerald-500 border-2 border-emerald-300 shadow-[0_0_15px_#10b981] scale-105 transform z-20 relative animate-pulse';
                   textClass = 'text-white';
                   timeClass = 'text-emerald-100';
                } else if (isCurrent) {
                   boxClass = 'bg-indigo-600 border-2 border-fuchsia-400 shadow-[0_0_15px_#e879f9] scale-105 transform z-20 relative animate-pulse';
                   textClass = 'text-white';
                   timeClass = 'text-fuchsia-200';
                } else if (isLunch) {
                   boxClass = 'bg-orange-900/40 border border-orange-500/30';
                   textClass = 'text-orange-200';
                   timeClass = 'text-orange-300';
                } else if (isBreak) {
                   boxClass = 'bg-emerald-900/30 border border-emerald-500/30';
                   textClass = 'text-emerald-200';
                   timeClass = 'text-emerald-300';
                }

                return (
                  <div key={idx} className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-500 w-[120px] flex-shrink-0 ${boxClass}`}>
                    <span className={`font-bold text-[11px] whitespace-nowrap ${textClass}`}>{t.label}</span>
                    <span className={`font-black text-[13px] tracking-tighter whitespace-nowrap ${timeClass}`}>{t.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {/* Marquee Banner */}
        <div className="w-full border-t border-white/5 relative z-20">
          <LiveMarquee />
        </div>
      </div>

    </div>
  )
}
