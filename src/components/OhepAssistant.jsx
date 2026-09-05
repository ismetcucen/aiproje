import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listenToRobotAnnouncement } from '../firebase/schema';

const FUNNY_PHRASES = [
  "İsmet hocayı kızdırmayın...",
  "Dersin ilk kuralı: Kötü espri yapmak yasak!",
  "Şuan OHEP AI Stüdyodasın...",
  "Tosbaa öğrenci modundasın...",
  "Hocanın gözlerinden alev çıkacak...",
  "Kodlarını kontrol et, bir yerlerde hata olabilir!",
  "Ben CEVBOT, senin kişisel AI asistanın!"
];

export default function OhepAssistant() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!user) return;

    let unsub = null;

    // Show CEVBOT after a brief delay
    setTimeout(() => {
      setIsVisible(true);
      const name = user.fullName ? user.fullName.split(' ')[0] : 'Öğrenci';
      speak(`Merhaba ${name}! Ben CEVBOT, senin OHEP asistanınım.`);
    }, 1500);

    // Random funny phrases every 3 mins
    const interval = setInterval(() => {
      const phrase = FUNNY_PHRASES[Math.floor(Math.random() * FUNNY_PHRASES.length)];
      speak(phrase);
    }, 3 * 60 * 1000); 

    // Listen for live announcements
    let isFirstSnapshot = true;
    unsub = listenToRobotAnnouncement((data) => {
      if (isFirstSnapshot) {
        isFirstSnapshot = false;
        return;
      }
      
      if (data && data.message) {
         speak(data.message, true); // True means highlight/urgent
      }
    });

    return () => {
      clearInterval(interval);
      if (unsub) unsub();
    };
  }, [user]);

  const speak = (msg, urgent = false) => {
    setIsVisible(true);
    setMessage(msg);
    setIsAnimating(true);
    
    // Play sound
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = urgent ? 'square' : 'sine';
      osc.frequency.setValueAtTime(urgent ? 880 : 523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(urgent ? 440 : 880, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}

    // Auto-hide message after 8 seconds, stop animating
    setTimeout(() => {
      setMessage('');
      setIsAnimating(false);
    }, 8000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex items-end gap-3 pointer-events-none">
      {/* Speech Bubble */}
      {message && (
        <div className="bg-white/95 backdrop-blur-md text-slate-800 p-4 rounded-2xl rounded-bl-none shadow-2xl border border-indigo-100 max-w-xs animate-[bounce_0.3s_ease-out] pointer-events-auto relative">
          <p className="text-sm font-semibold leading-relaxed">{message}</p>
          <div className="absolute -bottom-2 left-0 w-4 h-4 bg-white/95 border-b border-l border-indigo-100 transform rotate-45"></div>
        </div>
      )}
      
      {/* CEVBOT Mascot Avatar */}
      <div 
        className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shadow-[0_10px_25px_rgba(79,70,229,0.4)] border-[3px] border-white flex-shrink-0 bg-indigo-50 pointer-events-auto cursor-pointer transition-transform duration-300 ${isAnimating ? 'animate-spin-happy scale-110' : 'animate-float hover:scale-105'}`}
        onClick={() => speak(FUNNY_PHRASES[Math.floor(Math.random() * FUNNY_PHRASES.length)])}
      >
        <img 
          src="/cevbot.jpg" 
          alt="CEVBOT" 
          className="w-full h-full object-cover" 
        />
      </div>
    </div>
  );
}
