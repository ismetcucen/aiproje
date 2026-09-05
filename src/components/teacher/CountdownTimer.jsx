import { useState, useEffect, useRef } from 'react'

export default function CountdownTimer() {
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0) // in seconds
  const [isRunning, setIsRunning] = useState(false)
  
  const containerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err))
    } else {
      document.exitFullscreen()
    }
  }

  const timerRef = useRef(null)
  const audioCtxRef = useRef(null)
  const oscRef = useRef(null)
  const lfoRef = useRef(null)

  // Web Audio API for suspense music
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }

  const playSuspenseTick = (timeRemaining, totalTime) => {
    if (!audioCtxRef.current) return
    const ctx = audioCtxRef.current
    
    // Heartbeat / Tick sound
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    // As time gets lower, pitch gets slightly higher
    const urgency = 1 - (timeRemaining / totalTime)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(150 + (urgency * 100), ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  }

  const startSuspenseDrone = () => {
    if (!audioCtxRef.current) return
    const ctx = audioCtxRef.current
    
    // Low drone sound
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const lfo = ctx.createOscillator()
    
    osc.type = 'sawtooth'
    osc.frequency.value = 55 // Low note
    
    lfo.type = 'sine'
    lfo.frequency.value = 2 // 2Hz pulse
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.2
    
    lfo.connect(lfoGain)
    lfoGain.connect(gainNode.gain)
    
    gainNode.gain.value = 0.1 // Base volume
    
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    osc.start()
    lfo.start()
    
    oscRef.current = osc
    lfoRef.current = lfo
  }

  const stopSuspenseDrone = () => {
    if (oscRef.current) {
      oscRef.current.stop()
      oscRef.current = null
    }
    if (lfoRef.current) {
      lfoRef.current.stop()
      lfoRef.current = null
    }
  }

  const playTimeUpSound = () => {
    if (!audioCtxRef.current) return
    const ctx = audioCtxRef.current
    
    // Alarm sound
    const playBeep = (time) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(880, time)
      osc.frequency.setValueAtTime(660, time + 0.1)
      gainNode.gain.setValueAtTime(0.3, time)
      gainNode.gain.linearRampToValueAtTime(0, time + 0.2)
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      osc.start(time)
      osc.stop(time + 0.2)
    }
    
    const now = ctx.currentTime
    playBeep(now)
    playBeep(now + 0.3)
    playBeep(now + 0.6)
    playBeep(now + 0.9)
  }

  // Timer Logic
  const startTimer = () => {
    const totalSeconds = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0)
    if (totalSeconds <= 0) return
    
    initAudio()
    setTimeLeft(totalSeconds)
    setIsRunning(true)
    startSuspenseDrone()
  }

  const pauseTimer = () => {
    setIsRunning(false)
    stopSuspenseDrone()
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(0)
    stopSuspenseDrone()
  }

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const totalInitialTime = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0)
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsRunning(false)
            stopSuspenseDrone()
            playTimeUpSound()
            return 0
          }
          playSuspenseTick(prev - 1, totalInitialTime)
          
          // Increase drone pulse speed as time runs out
          if (lfoRef.current) {
            const urgency = 1 - (prev / totalInitialTime)
            lfoRef.current.frequency.value = 2 + (urgency * 6) // pulses faster
          }
          
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning]) // Re-run effect only when isRunning changes to prevent weird intervals

  // Calculate Display Values
  const displayMins = Math.floor(timeLeft / 60)
  const displaySecs = timeLeft % 60
  
  // Dynamic styling based on time left
  let containerColor = 'from-blue-600 to-indigo-600'
  let textColor = 'text-white'
  let isDanger = false
  
  if (isRunning) {
    const totalInitial = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0)
    const ratio = timeLeft / totalInitial
    
    if (ratio < 0.25) {
      containerColor = 'from-red-600 to-orange-600'
      isDanger = true
    } else if (ratio < 0.5) {
      containerColor = 'from-orange-500 to-yellow-500'
    } else {
      containerColor = 'from-emerald-500 to-teal-500'
    }
  }

  return (
    <div ref={containerRef} className={`p-4 md:p-8 mx-auto flex flex-col items-center justify-center bg-slate-50 w-full transition-all ${isFullscreen ? "h-screen" : "min-h-[80vh]"}`}>
      <button onClick={toggleFullscreen} className="absolute top-4 right-4 z-50 p-3 bg-white/50 hover:bg-white backdrop-blur-md rounded-xl text-slate-800 shadow-sm transition" title="Tam Ekran">
        {isFullscreen ? '↙️ Küçült' : '⛶ Tam Ekran'}
      </button>
      {!isRunning && timeLeft === 0 ? (
        <div className="w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center">
          <div className="text-6xl mb-6">⏱️</div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Zamanlayıcıyı Ayarla</h2>
          <p className="text-slate-500 mb-8">Etkinlik, sınav veya görev için süreyi belirleyin.</p>
          
          <div className="flex items-center justify-center gap-4 text-5xl font-black text-slate-700 mb-10">
            <input 
              type="number" 
              value={minutes} 
              onChange={e => setMinutes(e.target.value)}
              className="w-32 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center py-4 focus:outline-none focus:border-indigo-500"
              min="0"
              max="99"
            />
            <span>:</span>
            <input 
              type="number" 
              value={seconds} 
              onChange={e => setSeconds(e.target.value)}
              className="w-32 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center py-4 focus:outline-none focus:border-indigo-500"
              min="0"
              max="59"
            />
          </div>
          
          <button 
            onClick={startTimer}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg transition-transform transform active:scale-95"
          >
            BAŞLAT
          </button>
        </div>
      ) : (
        <div className={`w-full rounded-[3rem] p-12 shadow-2xl transition-colors duration-1000 bg-gradient-to-br ${containerColor} relative overflow-hidden flex flex-col items-center justify-center min-h-[60vh]`}>
          
          {/* Animated Background Rings */}
          <div className={`absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none ${isDanger ? 'animate-ping' : 'animate-pulse'}`}>
            <div className="w-96 h-96 border-[40px] border-white rounded-full"></div>
            <div className="absolute w-[40rem] h-[40rem] border-[20px] border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <h1 className={`text-[12rem] md:text-[15rem] font-black leading-none tracking-tighter drop-shadow-2xl font-mono ${textColor} ${isDanger && 'animate-[pulse_0.5s_ease-in-out_infinite]'}`}>
              {String(displayMins).padStart(2, '0')}:{String(displaySecs).padStart(2, '0')}
            </h1>
          </div>
          
          <div className="relative z-10 flex gap-6 mt-12">
            {!isRunning ? (
              <button 
                onClick={() => { setIsRunning(true); startSuspenseDrone(); }}
                className="bg-white text-emerald-600 hover:bg-emerald-50 text-xl font-black py-4 px-10 rounded-full shadow-xl transition-transform active:scale-95"
              >
                ▶ DEVAM ET
              </button>
            ) : (
              <button 
                onClick={pauseTimer}
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-2 border-white/50 text-xl font-black py-4 px-10 rounded-full shadow-xl transition-transform active:scale-95"
              >
                ⏸ DURAKLAT
              </button>
            )}
            
            <button 
              onClick={resetTimer}
              className="bg-slate-900 text-white hover:bg-slate-800 text-xl font-bold py-4 px-10 rounded-full shadow-xl transition-transform active:scale-95"
            >
              Sıfırla
            </button>
          </div>
          
          {timeLeft === 0 && !isRunning && (
            <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center z-50 animate-[flash_1s_ease-in-out_infinite]">
              <h2 className="text-8xl font-black text-white drop-shadow-2xl mb-8">SÜRE BİTTİ!</h2>
              <button 
                onClick={resetTimer}
                className="bg-white text-red-600 text-2xl font-bold py-4 px-12 rounded-full shadow-2xl"
              >
                Kapat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
