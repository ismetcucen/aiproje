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

  // Kiosk Lock State
  const [isKioskLocked, setIsKioskLocked] = useState(() => {
    return localStorage.getItem('ohep_kiosk_locked') === 'true'
  })
  const [kioskPin, setKioskPin] = useState(() => {
    return localStorage.getItem('ohep_kiosk_pin') || '1923'
  })
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [showChangePin, setShowChangePin] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [pinSuccessMsg, setPinSuccessMsg] = useState('')

  // Config: 'OHEP' is the default school code
  const schoolCode = 'OHEP'

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFs)
    return () => document.removeEventListener('fullscreenchange', handleFs)
  }, [])

  const toggleFullscreen = () => {
    if (isKioskLocked) {
      setShowPinModal(true)
      return
    }
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }
  }

  const handleUnlockAttempt = (enteredPin) => {
    const pinToTest = enteredPin !== undefined ? enteredPin : pinInput
    if (pinToTest === kioskPin) {
      setIsKioskLocked(false)
      localStorage.setItem('ohep_kiosk_locked', 'false')
      setShowPinModal(false)
      setPinInput('')
      setPinError('')
    } else {
      setPinError('Hatalı PIN! Lütfen tekrar deneyin.')
      setPinInput('')
    }
  }

  const handleLockKiosk = () => {
    setIsKioskLocked(true)
    localStorage.setItem('ohep_kiosk_locked', 'true')
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  const handleSaveNewPin = (e) => {
    e?.preventDefault()
    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      setPinError('PIN 4 haneli rakam olmalıdır.')
      return
    }
    setKioskPin(newPin)
    localStorage.setItem('ohep_kiosk_pin', newPin)
    setPinSuccessMsg('Yeni PIN kaydedildi: ' + newPin)
    setNewPin('')
    setPinError('')
    setTimeout(() => {
      setPinSuccessMsg('')
      setShowChangePin(false)
    }, 2000)
  }

  // Kiosk Koruma Listener'ları: Sağ tık, klavye kısayolları ve sayfayı kapatma engelleri
  useEffect(() => {
    if (!isKioskLocked) return

    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }

    const handleKeyDown = (e) => {
      const key = e.key
      const ctrlOrCmd = e.ctrlKey || e.metaKey

      // F12 ve Tarayıcı İnceleme Araçları (Ctrl+Shift+I, J, C vb.)
      if (
        key === 'F12' ||
        (ctrlOrCmd && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(key))
      ) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      // Sayfa Yenileme Engeli (F5, Ctrl+R, Cmd+R)
      if (key === 'F5' || (ctrlOrCmd && (key === 'r' || key === 'R'))) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      // Sekme / Pencere Kapatma Engeli (Ctrl+W, Cmd+W, Ctrl+Q, Cmd+Q)
      if (ctrlOrCmd && ['w', 'W', 'q', 'Q'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      // Kaynak Kodu, Kaydetme, Yazdırma, vb. (Ctrl+U, S, P, A)
      if (ctrlOrCmd && ['u', 'U', 's', 'S', 'p', 'P', 'a', 'A'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      // F11 (Tarayıcı varsayılan tam ekran tuşu)
      if (key === 'F11') {
        e.preventDefault()
        return false
      }
    }

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = 'Kiosk kilidi açık. Sayfayı kapatmak istediğinize emin misiniz?'
      return e.returnValue
    }

    window.addEventListener('contextmenu', handleContextMenu, true)
    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, true)
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isKioskLocked])

  // PIN modal açıkken klavyeden doğrudan yazma desteği
  useEffect(() => {
    if (!showPinModal) return

    const handleModalKey = (e) => {
      if (e.key === 'Escape') {
        setShowPinModal(false)
        setPinInput('')
        setPinError('')
      } else if (e.key === 'Backspace') {
        setPinInput(prev => prev.slice(0, -1))
        setPinError('')
      } else if (/^[0-9]$/.test(e.key)) {
        setPinInput(prev => {
          if (prev.length < 4) {
            const next = prev + e.key
            if (next.length === 4) {
              setTimeout(() => {
                if (next === kioskPin) {
                  setIsKioskLocked(false)
                  localStorage.setItem('ohep_kiosk_locked', 'false')
                  setShowPinModal(false)
                  setPinInput('')
                  setPinError('')
                } else {
                  setPinError('Hatalı PIN! Lütfen tekrar deneyin.')
                  setPinInput('')
                }
              }, 150)
            }
            return next
          }
          return prev
        })
        setPinError('')
      }
    }

    window.addEventListener('keydown', handleModalKey)
    return () => window.removeEventListener('keydown', handleModalKey)
  }, [showPinModal, kioskPin])

  const handlePageClick = () => {
    if (isKioskLocked && !document.fullscreenElement && !showPinModal) {
      document.documentElement.requestFullscreen().catch(() => {})
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

  
  // Get active background image (Default to uploaded school campus photo)
  const validBackgrounds = (settings?.backgroundImages || [])
    .filter(url => typeof url === 'string' && url.trim().length > 0 && !url.includes('photo-1541339907198'))

  const customSingleBg = (settings?.backgroundImageUrl && !settings.backgroundImageUrl.includes('photo-1541339907198'))
    ? settings.backgroundImageUrl.trim()
    : null

  const activeBg = validBackgrounds.length > 0
    ? validBackgrounds[currentSlideIndex % validBackgrounds.length]
    : (customSingleBg || '/ohep-campus.jpg')

  return (
    <div 
      onClick={handlePageClick}
      onDragStart={isKioskLocked ? (e) => e.preventDefault() : undefined}
      className={`fixed inset-0 w-full overflow-hidden text-white font-sans flex flex-col ${isKioskLocked ? 'select-none' : ''}`}
      style={{
        backgroundImage: `url('${activeBg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1.5s ease-in-out',
        userSelect: isKioskLocked ? 'none' : 'auto',
        WebkitUserSelect: isKioskLocked ? 'none' : 'auto'
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px] z-0"></div>

      
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

      {/* Kiosk Mode: Re-fullscreen prompt if student exited fullscreen */}
      {isKioskLocked && !isFullscreen && !showPinModal && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            document.documentElement.requestFullscreen().catch(() => {})
          }}
          className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce cursor-pointer border border-red-300/40"
        >
          <span>⚠️</span>
          <span>Tam Ekrandan Çıkıldı! Geri Dönmek İçin Tıklayın</span>
        </button>
      )}

      {/* Top Right Control Bar: Kiosk & Fullscreen */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="absolute top-2.5 right-3 z-50 flex items-center gap-1.5 sm:gap-2"
      >
        {isKioskLocked ? (
          <button 
            onClick={() => {
              setPinInput('')
              setPinError('')
              setShowPinModal(true)
            }}
            title="Kiosk Modu Kilitli (Kilidi açmak için tıklayın)"
            className="bg-red-600/85 hover:bg-red-500 active:scale-95 text-white px-2.5 sm:px-3 py-1.5 rounded-xl border border-red-400/40 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg"
          >
            <span className="text-sm">🔒</span>
            <span className="hidden sm:inline">Kiosk Kilitli</span>
          </button>
        ) : (
          <>
            <button 
              onClick={handleLockKiosk}
              title="Kiosk Kilidini Aç (Sağ tık, klavye ve pencereyi kilitler)"
              className="bg-emerald-600/85 hover:bg-emerald-500 active:scale-95 text-white px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-400/40 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg"
            >
              <span className="text-sm">🔓</span>
              <span className="hidden sm:inline">Kiosk Kilitle</span>
            </button>

            <button 
              onClick={() => {
                setShowChangePin(!showChangePin)
                setPinError('')
                setPinSuccessMsg('')
              }}
              title="Kilit PIN Kodunu Değiştir"
              className="bg-black/40 hover:bg-black/65 active:scale-95 text-white/90 px-2 sm:px-2.5 py-1.5 rounded-xl border border-white/20 backdrop-blur-md transition-all text-xs font-bold shadow-lg flex items-center gap-1"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">PIN</span>
            </button>

            <button 
              onClick={toggleFullscreen}
              title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap (F11)"}
              className="bg-black/40 hover:bg-black/65 active:scale-95 text-white/90 hover:text-white px-2.5 py-1.5 rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg"
            >
              <span className="text-sm">{isFullscreen ? '✕' : '⛶'}</span>
              <span className="hidden sm:inline">{isFullscreen ? 'Pencere' : 'Tam Ekran'}</span>
            </button>
          </>
        )}
      </div>

      {/* PIN Unlock Modal */}
      {showPinModal && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
        >
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 max-w-xs w-full shadow-2xl text-center relative">
            <button 
              onClick={() => {
                setShowPinModal(false)
                setPinInput('')
                setPinError('')
              }}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white text-base p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <div className="w-12 h-12 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
              🔒
            </div>

            <h3 className="text-lg font-black text-white mb-1 tracking-wide">Kiosk Kilidini Aç</h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Müdahaleleri engellemek için ekran kilitlendi. Kilidi açmak için 4 haneli PIN kodunuzu girin.
            </p>

            {/* PIN Dots */}
            <div className="flex justify-center gap-2.5 mb-3">
              {[0, 1, 2, 3].map(idx => (
                <div 
                  key={idx}
                  className={`w-10 h-11 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all ${
                    pinInput.length > idx 
                      ? 'border-indigo-500 bg-indigo-500/25 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                      : 'border-slate-700 bg-slate-800 text-slate-500'
                  }`}
                >
                  {pinInput.length > idx ? '●' : ''}
                </div>
              ))}
            </div>

            {pinError && (
              <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg py-1 px-2 mb-3">
                {pinError}
              </div>
            )}

            {/* Virtual Numpad */}
            <div className="grid grid-cols-3 gap-2 mb-4 max-w-[210px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (pinInput.length < 4) {
                      const next = pinInput + num
                      setPinInput(next)
                      setPinError('')
                      if (next.length === 4) {
                        setTimeout(() => handleUnlockAttempt(next), 150)
                      }
                    }
                  }}
                  className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-base font-bold text-white border border-slate-700/60 shadow transition-all active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPinInput('')
                  setPinError('')
                }}
                className="h-10 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-700/60 active:scale-95"
              >
                SİL
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pinInput.length < 4) {
                    const next = pinInput + '0'
                    setPinInput(next)
                    setPinError('')
                    if (next.length === 4) {
                      setTimeout(() => handleUnlockAttempt(next), 150)
                    }
                  }
                }}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-base font-bold text-white border border-slate-700/60 shadow transition-all active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  setPinInput(prev => prev.slice(0, -1))
                  setPinError('')
                }}
                className="h-10 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-bold text-rose-400 border border-slate-700/60 active:scale-95 flex items-center justify-center"
              >
                ⌫
              </button>
            </div>

            <p className="text-[10px] text-slate-500 font-mono">
              Varsayılan PIN: <span className="text-indigo-300 font-bold">1923</span>
            </p>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {showChangePin && !isKioskLocked && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center relative">
            <button 
              onClick={() => {
                setShowChangePin(false)
                setNewPin('')
                setPinError('')
                setPinSuccessMsg('')
              }}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white text-base p-1.5 rounded-full hover:bg-white/10"
            >
              ✕
            </button>
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
              🔑
            </div>
            <h3 className="text-base font-bold text-white mb-1">PIN Kodunu Değiştir</h3>
            <p className="text-xs text-slate-400 mb-3">Mevcut PIN: <span className="font-mono text-indigo-300 font-bold">{kioskPin}</span></p>

            <form onSubmit={handleSaveNewPin} className="space-y-3">
              <div>
                <input 
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setNewPin(val)
                    setPinError('')
                  }}
                  placeholder="Yeni PIN (4 Rakam)"
                  className="w-full text-center tracking-[0.4em] text-xl font-mono py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 placeholder:tracking-normal placeholder:text-xs"
                />
              </div>

              {pinError && <p className="text-xs text-rose-400 font-medium">{pinError}</p>}
              {pinSuccessMsg && <p className="text-xs text-emerald-400 font-medium">{pinSuccessMsg}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangePin(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={newPin.length !== 4}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
