import { useEffect, useRef } from 'react';
import { initAgent } from 'clippyjs';
import { F1 } from 'clippyjs/agents';
import { useAuth } from '../hooks/useAuth';
import { listenToRobotAnnouncement } from '../firebase/schema';

const FUNNY_PHRASES = [
  "İsmet hocayı kızdırmayın...",
  "Dersin ilk kuralı: Kötü espri yapmak yasak!",
  "Şuan OHEP AI Stüdyodasın...",
  "Tosbaa öğrenci modundasın...",
  "Hocanın gözlerinden alev çıkacak...",
  "Kodlarını kontrol et, bir yerlerde hata olabilir!",
  "Ben bir F1 robotuyum, ama çay demleyemiyorum..."
];

export default function OhepAssistant() {
  const { user } = useAuth();
  const agentRef = useRef(null);
  const lastAnnounceTimeRef = useRef(0);

  useEffect(() => {
    // Only load for logged in users
    if (!user) return;

    let active = true;
    let unsub = null;

    async function loadAgent() {
      try {
        const agent = await initAgent(F1);
        if (!active) {
          agent.dispose();
          return;
        }
        
        agentRef.current = agent;
        agent.show();

        // Initial welcome
        setTimeout(() => {
          if (!agentRef.current) return;
          const name = user.fullName ? user.fullName.split(' ')[0] : 'Öğrenci';
          agent.speak(`Merhaba ${name}! Ben F1, senin OHEP asistanınım.`);
          agent.animate();
        }, 1500);

        // Random funny phrases every 3 mins
        const interval = setInterval(() => {
          if (agentRef.current) {
            const phrase = FUNNY_PHRASES[Math.floor(Math.random() * FUNNY_PHRASES.length)];
            agentRef.current.speak(phrase);
            agentRef.current.animate();
          }
        }, 3 * 60 * 1000); 

        agentRef.current._animationInterval = interval;

        // Listen for live announcements
        unsub = listenToRobotAnnouncement((data) => {
          if (agentRef.current && data && data.message && data.timestamp > lastAnnounceTimeRef.current) {
            // Sadece son 30 saniye içinde atılan yeni mesajları söyle (sayfa yenilemede eskisini tekrar etmemesi için)
            if (lastAnnounceTimeRef.current !== 0 || Date.now() - data.timestamp < 30000) {
                agentRef.current.speak(`📢 DİKKAT: ${data.message}`);
                agentRef.current.animate();
            }
            lastAnnounceTimeRef.current = data.timestamp;
          }
        });

      } catch (err) {
        console.error("Failed to load Ohep Assistant:", err);
      }
    }

    loadAgent();

    return () => {
      active = false;
      if (unsub) unsub();
      if (agentRef.current) {
        if (agentRef.current._animationInterval) {
          clearInterval(agentRef.current._animationInterval);
        }
        agentRef.current.hide();
        setTimeout(() => {
          if (agentRef.current) {
            agentRef.current.dispose();
            agentRef.current = null;
          }
        }, 1000);
      }
    };
  }, [user]);

  return null;
}
