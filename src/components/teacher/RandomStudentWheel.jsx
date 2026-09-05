import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getClassesBySchool, getStudentsByClass } from '../../firebase/schema'

const COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', 
  '#2dd4bf', '#38bdf8', '#818cf8', '#a78bfa', '#e879f9', '#fb7185'
]

export default function RandomStudentWheel() {
  const { profile } = useAuth()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [rotation, setRotation] = useState(0)
  
  const canvasRef = useRef(null)
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

  useEffect(() => {
    if (profile?.schoolCode) {
      getClassesBySchool(profile.schoolCode).then(list => {
        setClasses(list)
        if (list.length > 0) setSelectedClass(list[0].id)
      })
    }
  }, [profile])

  const fetchStudents = async (classId) => {
    try {
      const list = await getStudentsByClass(classId)
      const formattedList = list.map(s => ({
        id: s.id,
        name: s.fullName || 'İsimsiz'
      }))
      setStudents(formattedList.sort(() => Math.random() - 0.5))
      setWinner(null)
      setRotation(0)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass)
    }
  }, [selectedClass])

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const radius = width / 2
    
    ctx.clearRect(0, 0, width, height)
    
    if (students.length === 0) {
      ctx.fillStyle = '#e2e8f0'
      ctx.beginPath()
      ctx.arc(radius, radius, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = '#64748b'
      ctx.font = '20px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Öğrenci bulunamadı', radius, radius)
      return
    }

    const arc = (2 * Math.PI) / students.length

    for (let i = 0; i < students.length; i++) {
      ctx.beginPath()
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.moveTo(radius, radius)
      ctx.arc(radius, radius, radius, i * arc, (i + 1) * arc)
      ctx.fill()
      ctx.stroke()
      
      // Draw text
      ctx.save()
      ctx.translate(radius, radius)
      ctx.rotate(i * arc + arc / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px sans-serif'
      // text shadow for readability
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 4
      ctx.fillText(students[i].name, radius - 20, 5)
      ctx.restore()
    }
    
    // Draw center circle
    ctx.beginPath()
    ctx.arc(radius, radius, 30, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#333'
    ctx.stroke()
    ctx.fillStyle = '#333'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('ÖHEP', radius, radius + 8)
  }

  useEffect(() => {
    drawWheel()
  }, [students])

  const playTickSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioContext()
      if (ctx.state === 'suspended') ctx.resume()
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch(err) { console.error(err) }
  }

  const playWinnerSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioContext()
      if (ctx.state === 'suspended') ctx.resume()
      
      const playNote = (freq, startTime, duration) => {
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()
        osc.type = 'square'
        osc.frequency.value = freq
        gainNode.gain.setValueAtTime(0.2, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
        osc.connect(gainNode)
        gainNode.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + duration)
      }
      
      const now = ctx.currentTime
      playNote(523.25, now, 0.2) // C5
      playNote(659.25, now + 0.2, 0.2) // E5
      playNote(783.99, now + 0.4, 0.4) // G5
    } catch(err) { console.error(err) }
  }

  const spin = () => {
    if (isSpinning || students.length === 0) return
    setIsSpinning(true)
    setWinner(null)
    
    // Play an empty sound to unlock AudioContext if needed
    playTickSound()
    
    const extraSpins = 5 // Number of full rotations
    const randomDegree = Math.floor(Math.random() * 360)
    const totalRotation = rotation + (extraSpins * 360) + randomDegree
    
    setRotation(totalRotation)
    
    // Sound effect loop
    let tickCount = 0
    const tickInterval = setInterval(() => {
      if (tickCount < 20) {
        playTickSound()
        tickCount++
      } else {
        clearInterval(tickInterval)
      }
    }, 200)

    setTimeout(() => {
      clearInterval(tickInterval)
      setIsSpinning(false)
      
      const arc = 360 / students.length
      // Calculate which segment is at the top (270 degrees in canvas math, but CSS rotate is different)
      // Top pointer is at 0 degrees relative to wheel top.
      const normalizedRotation = totalRotation % 360
      
      // Pointer is at the top. Since wheel rotates clockwise, the winning segment is moving counter-clockwise relative to pointer.
      const winningDegree = (360 - normalizedRotation + 270) % 360
      const winnerIndex = Math.floor(winningDegree / arc)
      
      const selectedWinner = students[winnerIndex]
      setWinner(selectedWinner)
      playWinnerSound()
    }, 5000) // 5 seconds spin duration
  }

  const removeWinner = () => {
    if (!winner) return
    setStudents(prev => prev.filter(s => s.id !== winner.id))
    setWinner(null)
  }

  return (
    <div ref={containerRef} className="p-4 md:p-8 w-full mx-auto flex flex-col items-center bg-slate-50 overflow-y-auto" style={{ minHeight: isFullscreen ? "100vh" : "auto" }}>
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">🎡 Rastgele Öğrenci Çarkı</h2>
            <p className="text-sm text-slate-500">Soru sormak veya tahtaya kaldırmak için çarkı çevirin.</p>
          </div>
          <button onClick={toggleFullscreen} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition" title="Tam Ekran">
            {isFullscreen ? '↙️' : '⛶'}
          </button>
        </div>
        
        <div className="flex gap-2 items-center">
          <label className="text-sm font-bold text-slate-600">Sınıf Seç:</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border-2 border-indigo-200 rounded-xl px-4 py-2 font-bold text-indigo-700 bg-indigo-50 focus:outline-none focus:border-indigo-500"
            disabled={isSpinning}
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-center justify-center w-full">
        {/* WHEEL CONTAINER */}
        <div className="relative w-80 h-80 md:w-96 md:h-96 shrink-0">
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 text-4xl drop-shadow-md">
            👇
          </div>
          
          <div 
            className="w-full h-full rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden bg-slate-100"
            style={{ 
              transform: `rotate(${rotation}deg)`, 
              transition: isSpinning ? 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
            }}
          >
            <canvas 
              ref={canvasRef} 
              width="400" 
              height="400" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* CONTROLS & WINNER */}
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <button 
            onClick={spin}
            disabled={isSpinning || students.length === 0}
            className={`w-full py-4 rounded-2xl text-2xl font-black text-white shadow-xl transition-all transform active:scale-95 ${
              isSpinning 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105 hover:shadow-2xl'
            }`}
          >
            {isSpinning ? 'Çevriliyor...' : 'ÇARKI ÇEVİR! 🎰'}
          </button>

          {winner && !isSpinning && (
            <div className="w-full bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 text-center animate-[bounce_1s_ease-in-out]">
              <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-2">🎉 SEÇİLEN ÖĞRENCİ 🎉</p>
              <h3 className="text-4xl font-black text-emerald-800 mb-6 drop-shadow-sm">{winner.name}</h3>
              
              <button 
                onClick={removeWinner}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-colors"
              >
                🗑️ Listeden Çıkar (Elimine Et)
              </button>
            </div>
          )}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 w-full shadow-sm max-h-48 overflow-y-auto">
            <h4 className="font-bold text-slate-700 mb-2 border-b pb-2">Çarktaki Öğrenciler ({students.length})</h4>
            <div className="flex flex-wrap gap-2">
              {students.map(s => (
                <span key={s.id} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md border border-slate-200">
                  {s.name}
                </span>
              ))}
              {students.length === 0 && <span className="text-slate-400 text-sm">Sınıfta öğrenci yok.</span>}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}
