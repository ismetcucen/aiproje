import { useEffect, useRef } from 'react';
import { initAgent } from 'clippyjs';
import { F1 } from 'clippyjs/agents';
import { useAuth } from '../hooks/useAuth';

export default function OhepAssistant() {
  const { user } = useAuth();
  const agentRef = useRef(null);

  useEffect(() => {
    // Only load for logged in users
    if (!user) return;

    let active = true;

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
          agent.play("Greeting");
        }, 1500);

        // Interact on click (wait, clippy handles clicks internally, but we can do random animations)
        const interval = setInterval(() => {
          if (agentRef.current) {
            agentRef.current.animate();
          }
        }, 180000); // random animation every 3 mins

        // Let's attach an interval ID to clear it later
        agentRef.current._animationInterval = interval;
      } catch (err) {
        console.error("Failed to load Ohep Assistant:", err);
      }
    }

    loadAgent();

    return () => {
      active = false;
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
