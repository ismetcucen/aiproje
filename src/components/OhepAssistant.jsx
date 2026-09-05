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

  // Dragging State
  const [pos, setPos] = useState({ left: 24, bottom: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, left: 0, bottom: 0, moved: false });

  useEffect(() => {
    if (!user) return;

    let unsub = null;

    setTimeout(() => {
      setIsVisible(true);
      const name = user.fullName ? user.fullName.split(' ')[0] : 'Öğrenci';
      speak(`Merhaba ${name}! Ben CEVBOT, senin OHEP asistanınım.`);
    }, 1500);

    const interval = setInterval(() => {
      const phrase = FUNNY_PHRASES[Math.floor(Math.random() * FUNNY_PHRASES.length)];
      speak(phrase);
    }, 3 * 60 * 1000); 

    let isFirstSnapshot = true;
    unsub = listenToRobotAnnouncement((data) => {
      if (isFirstSnapshot) {
        isFirstSnapshot = false;
        return;
      }
      
      if (data && data.message) {
         speak(data.message, true); 
      }
    });

    return () => {
      clearInterval(interval);
      if (unsub) unsub();
    };
  }, [user]);

  // Drag event listeners
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragStart.current.moved = true;
      }

      setPos({
        left: dragStart.current.left + dx,
        bottom: dragStart.current.bottom - dy
      });
    };
    
    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      // For mobile
      window.addEventListener('touchmove', onMouseMove);
      window.addEventListener('touchend', onMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging]);

  const onMouseDown = (e) => {
    // Support touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    dragStart.current = {
      x: clientX,
      y: clientY,
      left: pos.left,
      bottom: pos.bottom,
      moved: false
    };
  };

  const handleAvatarClick = () => {
    if (dragStart.current.moved) return; // Ignore click if they dragged
    speak(FUNNY_PHRASES[Math.floor(Math.random() * FUNNY_PHRASES.length)]);
  };

  const speak = (msg, urgent = false) => {
    setIsVisible(true);
    setMessage(msg);
    setIsAnimating(true);
    
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

    setTimeout(() => {
      setMessage('');
      setIsAnimating(false);
    }, 8000);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed z-[100] flex items-end gap-3 pointer-events-none transition-none`}
      style={{ left: `${pos.left}px`, bottom: `${pos.bottom}px` }}
    >
      {/* Speech Bubble */}
      {message && (
        <div className="bg-white/95 backdrop-blur-md text-slate-800 p-4 rounded-2xl rounded-bl-none shadow-2xl border border-indigo-100 max-w-xs animate-[bounce_0.3s_ease-out] pointer-events-auto relative">
          <p className="text-sm font-semibold leading-relaxed">{message}</p>
          <div className="absolute -bottom-2 left-0 w-4 h-4 bg-white/95 border-b border-l border-indigo-100 transform rotate-45"></div>
        </div>
      )}
      
      {/* CEVBOT Mascot Avatar */}
      <div 
        className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shadow-[0_10px_25px_rgba(79,70,229,0.4)] border-[3px] border-white flex-shrink-0 bg-indigo-50 pointer-events-auto transition-transform duration-300 select-none ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'} ${isAnimating && !isDragging ? 'animate-spin-happy scale-110' : ''} ${!isDragging && !isAnimating ? 'animate-float hover:scale-105' : ''}`}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        onClick={handleAvatarClick}
      >
        <img 
          src="/cevbot.jpg" 
          alt="CEVBOT" 
          className="w-full h-full object-cover pointer-events-none" 
        />
      </div>
    </div>
  );
}
