import { useState } from 'react';
import { sendRobotAnnouncement } from '../../firebase/schema';

export default function RobotAnnouncer() {
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    try {
      await sendRobotAnnouncement(msg);
      setMsg('');
      setOpen(false);
      } catch (err) {
      console.error(err);
      alert("Gönderim hatası: " + err.message);
    } finally {
      setSending(false);
    }
  }

  const QUICK_MESSAGES = [
    "Bugün çok tehlikeliyim. 😈",
    "Oyun açanı yakarım. 🔥",
    "Ben herşeyi görüyorum. 👁️",
    "Birazdan angry teacher moduna geçeceğim 😡",
    "Dersin ilk kuralı kötü espri yapmak yasak. 🚫",
    "Çok ses çıkıyor. 🤫",
    "Adamı hasta etmeyin. 🤒"
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)} 
        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 shadow-sm ${open ? 'bg-emerald-100 border-emerald-300 shadow-inner' : 'bg-slate-100 hover:bg-slate-200 border-slate-200'}`} 
        title="CEVBOT Anonsu"
      >
        <span className="text-xl">🤖</span>
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📢</span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Canlı Anons</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">CEVBOT ile tüm sınıfa seslen</p>
            </div>
          </div>
          
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_MESSAGES.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMsg(q)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] px-2 py-1 rounded-lg border border-slate-200 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend}>
            <textarea 
              value={msg} 
              onChange={e => setMsg(e.target.value)}
              placeholder="Mesajınızı yazın veya yukarıdan seçin..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none h-20 mb-3 transition-colors text-slate-700"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-xl text-sm transition-colors"
              >
                İptal
              </button>
              <button 
                type="submit" 
                disabled={sending || !msg.trim()}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {sending ? '...' : 'Gönder 🚀'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
