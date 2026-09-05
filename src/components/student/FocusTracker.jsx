import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from '@vladmandic/face-api'

export default function FocusTracker() {
  const videoRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [isModelsLoaded, setIsModelsLoaded] = useState(false)
  const [status, setStatus] = useState('Hazırlanıyor...')
  const [f1Message, setF1Message] = useState(null)
  
  // Tracking states
  const trackingData = useRef({
    noFaceCount: 0,
    sadCount: 0,
    angryCount: 0,
    lastAlertTime: 0
  })

  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ])
        setIsModelsLoaded(true)
        setStatus('Kamera bekleniyor...')
      } catch (error) {
        console.error("Yapay zeka modelleri yüklenemedi:", error)
        setStatus('Modeller yüklenemedi.')
      }
    }
    loadModels()
  }, [])

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsActive(true)
          setStatus('Analiz devrede 👀')
        }
      })
      .catch((err) => {
        console.error(err)
        setStatus('Kameraya erişilemedi.')
      })
  }

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsActive(false)
    setStatus('Analiz duraklatıldı.')
    setF1Message(null)
  }

  const handleVideoPlay = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current || !isActive) {
        clearInterval(interval)
        return
      }

      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }))
        .withFaceExpressions()

      const now = Date.now()
      const timeSinceLastAlert = now - trackingData.current.lastAlertTime

      if (!detections) {
        // No face detected
        trackingData.current.noFaceCount++
        trackingData.current.sadCount = 0
        
        if (trackingData.current.noFaceCount > 15 && timeSinceLastAlert > 20000) { // ~3-4 secs
          triggerF1Alert("Hey, ekranda değilsin! Dikkatin mi dağıldı? Odaklanmaya çalış! 🤖")
          trackingData.current.noFaceCount = 0
        }
      } else {
        // Face is present
        trackingData.current.noFaceCount = 0
        
        const expressions = detections.expressions
        // Find dominant emotion
        let dominantEmotion = ''
        let maxScore = 0
        for (const [emotion, score] of Object.entries(expressions)) {
          if (score > maxScore) {
            maxScore = score
            dominantEmotion = emotion
          }
        }

        if (dominantEmotion === 'sad') {
          trackingData.current.sadCount++
          if (trackingData.current.sadCount > 10 && timeSinceLastAlert > 30000) {
            triggerF1Alert("Biraz üzgün görünüyorsun... Unutma, hata yapmak öğrenmenin en iyi yoludur! Derin bir nefes al. 💙")
            trackingData.current.sadCount = 0
          }
        } else if (dominantEmotion === 'angry') {
          trackingData.current.angryCount++
          if (trackingData.current.angryCount > 10 && timeSinceLastAlert > 30000) {
            triggerF1Alert("Sakin ol, biraz sinirlenmiş gibisin. İstersen kısa bir mola ver. Ben buradayım! 🦾")
            trackingData.current.angryCount = 0
          }
        } else {
          trackingData.current.sadCount = 0
          trackingData.current.angryCount = 0
          
          if (dominantEmotion === 'happy' && timeSinceLastAlert > 60000) {
            // triggerF1Alert("Gülümsemeni görmek ne güzel! Harika gidiyorsun! 🌟")
            // Optional positive reinforcement
          }
        }
      }
    }, 250) // check every 250ms
  }
  
  const triggerF1Alert = (msg) => {
    trackingData.current.lastAlertTime = Date.now()
    setF1Message(msg)
    
    // Play a gentle beep
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioContext()
      if (ctx.state === 'suspended') ctx.resume()
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2)
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch(e) {}

    // Auto hide after 8 seconds
    setTimeout(() => {
      setF1Message(null)
    }, 8000)
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 z-[100] bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-indigo-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl shadow-inner border border-indigo-200">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-tight text-sm">Yapay Zeka Destekli Öğrenci Analizi</h3>
            <p className="text-xs font-medium text-slate-500">{status}</p>
          </div>
        </div>
        <button
          onClick={isActive ? stopVideo : startVideo}
          disabled={!isModelsLoaded}
          className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-transform active:scale-95 ${
            !isModelsLoaded ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
            isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {isActive ? 'Kapat' : 'Aç'}
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-4 border-slate-800 shadow-inner w-full flex items-center justify-center h-40">
        {!isActive && (
          <div className="absolute text-slate-500 text-xs font-medium text-center px-4">
            Gizlilik Politikası: Görüntünüz sunucuya kaydedilmez. Yapay zeka analizi tamamen cihazınızda gerçekleşir.
          </div>
        )}
        <video 
          ref={videoRef} 
          onPlay={handleVideoPlay}
          muted 
          autoPlay 
          playsInline
          className={`w-full h-full object-cover transform -scale-x-100 ${isActive ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* F1 Robot Popup Overlay */}
        {f1Message && (
          <div className="absolute inset-x-2 bottom-2 bg-indigo-600 text-white p-3 rounded-xl shadow-2xl text-xs font-medium animate-[bounce_0.5s_ease-out]">
            <div className="flex gap-2 items-start">
              <span className="text-xl">🦾</span>
              <p>{f1Message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
