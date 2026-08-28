import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: "Merhaba! Ben OHEP Bilişim Asistanı. Kodlama veya robotik projelerinde sana yardımcı olmak için buradayım. Bugün ne öğrenmek istersin?" }] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatRef = useRef(null);
  
  // VITE_GEMINI_API_KEY ortam değişkeninden anahtarı alıyoruz
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setLoading(true);
    setError('');

    try {
      const ai = new GoogleGenAI({ apiKey, dangerouslyAllowBrowser: true });
      
      // Sistem talimatı (Öğretmen modu)
      const systemInstruction = `Sen bir lise bilişim teknolojileri ve yazılım öğretmenisin. 
Öğrencilere kodlama, robotik, web tasarımı konularında rehberlik ediyorsun. 
Öğrenci senden direkt kod isterse ona kodun tamamını YAZMA, sadece ipucu ver ve nasıl çözebileceğini adım adım anlat. 
Amacın öğrencinin kendi kendine öğrenmesini sağlamak. Anlaşılır, cesaretlendirici ve Türkçe konuş.`;

      // API'nin beklediği formata mesajları çeviriyoruz
      const history = messages.map(m => ({
        role: m.role,
        parts: m.parts
      }));

      // Kendi mesajını da ekle
      history.push({ role: 'user', parts: [{ text: userMsg }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });

      if (response.text) {
         setMessages(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
      }
    } catch (err) {
      console.error(err);
      setError('Bir hata oluştu. Lütfen tekrar dene.');
    } finally {
      setLoading(false);
    }
  }

  if (!apiKey) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-[500px] bg-slate-900 border border-slate-700 rounded-3xl m-4 md:m-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">API Anahtarı Eksik</h2>
        <p className="text-slate-400 max-w-md">
          Yapay zeka asistanının çalışması için sistem yöneticinizin bir Gemini API anahtarı eklemesi gerekiyor. (<code>.env</code> dosyasına <code>VITE_GEMINI_API_KEY</code> eklenmelidir)
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px] max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden mt-4 md:mt-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-4 shadow-md z-10">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
          🤖
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">OHEP AI</h2>
          <p className="text-blue-100 text-xs font-medium">Bilişim ve Robotik Öğretmeni</p>
        </div>
      </div>

      {/* Chat History */}
      <div 
        ref={chatRef}
        className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-50 flex flex-col gap-6"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-600 text-white'}`}>
              {msg.role === 'user' ? '🧑‍🎓' : '🤖'}
            </div>
            <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
              {msg.parts[0].text.split('\n').map((line, i) => (
                <p key={i} className="min-h-[1rem]">{line}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-blue-600 text-white animate-pulse">🤖</div>
            <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-400 rounded-tl-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        {error && (
          <div className="self-center bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Sorunu buraya yaz... (Örn: Python'da for döngüsü nasıl çalışır?)"
            className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl px-6 py-4 text-sm transition-all outline-none"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-colors"
          >
            ➤
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Yapay zeka asistanı size doğrudan kodu vermek yerine ipucu vererek öğrenmenizi destekler.
        </p>
      </div>
    </div>
  );
}
