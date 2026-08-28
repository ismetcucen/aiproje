import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
// Wait, I will use emoji falling animation natively in CSS.

export default function DojoNotificationListener() {
  const { profile } = useAuth()
  const [award, setAward] = useState(null)
  
  useEffect(() => {
    if (!profile?.lastDojoAward) return
    
    const awardId = profile.lastDojoAward.id
    const seenAward = localStorage.getItem('seenDojoAwardId')
    
    if (awardId && awardId !== seenAward) {
      // Show notification
      setAward(profile.lastDojoAward)
      localStorage.setItem('seenDojoAwardId', awardId)
      
      // Play sound
      try {
        // A simple "Ding" sound base64 or public url.
        // We'll use a public sound effect for "success" / "coin"
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3')
        audio.volume = 0.5
        audio.play().catch(e => console.log('Audio autoplay blocked', e))
      } catch(e) {}

      // Auto hide after 5 seconds
      const t = setTimeout(() => {
        setAward(null)
      }, 5000)
      
      return () => clearTimeout(t)
    }
  }, [profile?.lastDojoAward])

  if (!award) return null

  const isPositive = award.points > 0

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none flex flex-col items-center justify-center p-4">
      {/* Background Confetti Emojis */}
      {isPositive && (
        <div className="absolute inset-0 overflow-hidden flex justify-center pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute text-4xl animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 2 + 2}s`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            >
              {['⭐️', '🌟', '✨', '🎉', '🏆'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* The Pop-up Banner */}
      <div className={`animate-bounce-in max-w-sm w-full ${isPositive ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-red-500 to-rose-600'} rounded-3xl p-6 shadow-2xl border-4 border-white text-center transform transition-all`}>
        <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-inner">
          <span className="text-6xl">{isPositive ? '⭐️' : '⚠️'}</span>
        </div>
        <h2 className="text-white font-black text-2xl mb-1 uppercase tracking-wide">
          {isPositive ? 'Tebrikler!' : 'Uyarı!'}
        </h2>
        <p className="text-white/90 font-medium text-lg leading-tight">
          Öğretmeninden <span className="font-black">{`${isPositive ? '+' : ''}${award.points}`} Puan</span> kazandın:
        </p>
        <div className="mt-4 bg-white/20 rounded-xl py-2 px-4 backdrop-blur-sm inline-block">
          <span className="text-white font-black text-xl">{award.reason}</span>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fall {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}} />
    </div>
  )
}
