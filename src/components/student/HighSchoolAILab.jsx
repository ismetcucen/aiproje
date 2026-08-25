import { useState } from 'react'

const CATEGORIES = [
  { id: 'all', label: 'Tümü' },
  { id: 'text', label: 'Metin & Araştırma' },
  { id: 'visual', label: 'Görsel, Video & Ses' },
  { id: 'dev', label: 'Geliştirme & Veri (Lise Özel)' },
  { id: 'edu', label: 'Yardımcı Araçlar' },
]

const AI_TOOLS = [
  // --- Metin Üretimi ve Araştırma ---
  { cat: 'text', title: 'ChatGPT', url: 'https://chatgpt.com/', icon: '💬', desc: 'Genel amaçlı yapay zeka, içerik üretimi ve araştırma.' },
  { cat: 'text', title: 'Claude', url: 'https://claude.ai/', icon: '📝', desc: 'Uzun metinler, doküman inceleme ve içerik düzenleme.' },
  { cat: 'text', title: 'Google Gemini', url: 'https://gemini.google.com/', icon: '✨', desc: 'Çok modlu (metin, görsel, dosya) yapay zeka.' },
  { cat: 'text', title: 'Grok', url: 'https://x.com/i/grok', icon: '🕵️', desc: 'Güncel bilgi ve haberler üzerinden araştırma.' },
  { cat: 'text', title: 'Perplexity', url: 'https://www.perplexity.ai/', icon: '🔍', desc: 'Kaynak göstererek detaylı akademik araştırma yapar.' },
  { cat: 'text', title: 'Microsoft Copilot', url: 'https://copilot.microsoft.com/', icon: '💼', desc: 'Microsoft ekosistemiyle entegre yapay zeka.' },
  { cat: 'text', title: 'Consensus', url: 'https://consensus.app/', icon: '📚', desc: 'Akademik makalelerden bilimsel veri bulmaya odaklıdır.' },
  { cat: 'text', title: 'Elicit', url: 'https://elicit.com/', icon: '🔬', desc: 'Literatür taraması ve akademik araştırma süreçleri.' },
  { cat: 'text', title: 'Overleaf', url: 'https://www.overleaf.com/', icon: '📄', desc: 'Akademik makale ve teknik rapor (LaTeX) hazırlama.' },
  { cat: 'text', title: 'NotebookLM', url: 'https://notebooklm.google.com/', icon: '📓', desc: 'Kendi PDF/notların üzerinden çalışan yapay zeka asistanı.' },

  
  { cat: 'text', title: 'Character.ai', url: 'https://character.ai/', icon: '🎭', desc: 'Tarihi figürler ve özel karakterlerle sohbet et.' },
  { cat: 'text', title: 'ChatPDF', url: 'https://www.chatpdf.com/', icon: '📖', desc: 'PDF kitaplarını yükle ve içindeki bilgilerle sohbet et.' },

  // --- Görsel, Video, Ses ve Sunum ---
  { cat: 'visual', title: 'Canva (Magic Studio)', url: 'https://www.canva.com/', icon: '🎨', desc: 'Yapay zeka destekli sunum, afiş ve materyal tasarımı.' },
  { cat: 'visual', title: 'Adobe Firefly', url: 'https://firefly.adobe.com/', icon: '🖌️', desc: 'Metinden görsel, metin efektleri ve tasarım üretimi.' },
  { cat: 'visual', title: 'Runway', url: 'https://runwayml.com/', icon: '🎬', desc: 'Yapay zeka destekli video üretimi ve düzenleme.' },
  { cat: 'visual', title: 'Luma Dream Machine (Veo Alt.)', url: 'https://lumalabs.ai/dream-machine', icon: '🎥', desc: 'Metin veya sahne tariflerinden yapay zeka ile video üretimi.' },
  { cat: 'visual', title: 'ElevenLabs', url: 'https://elevenlabs.io/', icon: '🎙️', desc: 'Metinden yüksek kaliteli insan sesi (seslendirme) üretimi.' },
  { cat: 'visual', title: 'Suno', url: 'https://suno.com/', icon: '🎵', desc: 'Metin promptu vererek kendi yapay zeka şarkını üret.' },
  { cat: 'visual', title: 'Gamma', url: 'https://gamma.app/', icon: '📊', desc: 'Verilen içerikten anında profesyonel sunum taslağı.' },
  { cat: 'visual', title: 'Flowise', url: 'https://flowiseai.com/', icon: '🔄', desc: 'Yapay zeka iş akışları ve zincir (LangChain) tasarlama.' },

  
  { cat: 'visual', title: 'Leonardo.ai', url: 'https://leonardo.ai/', icon: '🖼️', desc: 'İleri düzey, inanılmaz kalitede yapay zeka görsel üretimi.' },
  { cat: 'visual', title: 'HeyGen', url: 'https://www.heygen.com/', icon: '👩‍💼', desc: 'Fotoğrafları ve metinleri kullanarak sanal insan/sunucu videoları yap.' },

  // --- Teknik Geliştirme ve Veri Analizi ---
  { cat: 'dev', title: 'V0 by Vercel', url: 'https://v0.dev/', icon: '⚡', desc: 'Metinle (Prompt) arayüz ve oyun kodlama (React/HTML).' },
  { cat: 'dev', title: 'Flourish', url: 'https://flourish.studio/', icon: '📈', desc: 'Veri bilimi ve hareketli veri görselleştirme.' },
  { cat: 'dev', title: 'Tripo3D AI', url: 'https://www.tripo3d.ai/', icon: '🧊', desc: 'Görsellerden anında 3 boyutlu model (3D) oluşturma.' },
  { cat: 'dev', title: 'Cursor', url: 'https://cursor.com/', icon: '👨‍💻', desc: 'Yapay zeka destekli profesyonel kod yazma ortamı.' },
  { cat: 'dev', title: 'GitHub Copilot', url: 'https://github.com/features/copilot', icon: '🤖', desc: 'Kod yazarken yapay zekadan öneri ve otomatik tamamlama.' },
  { cat: 'dev', title: 'Replit', url: 'https://replit.com/', icon: '💻', desc: 'Tarayıcı üzerinden (AI destekli) proje geliştirme ortamı.' },
  { cat: 'dev', title: 'Google AI Studio', url: 'https://aistudio.google.com/', icon: '⚙️', desc: 'Google Gemini modellerini API seviyesinde test etme.' },
  { cat: 'dev', title: 'Supabase', url: 'https://supabase.com/', icon: '🗄️', desc: 'Projeler için açık kaynak veritabanı (BaaS) çözümü.' },
  { cat: 'dev', title: 'LM Studio', url: 'https://lmstudio.ai/', icon: '🧠', desc: 'Yerel bilgisayarında yapay zeka modellerini çalıştırma.' },
  { cat: 'dev', title: 'Hugging Face', url: 'https://huggingface.co/', icon: '🤗', desc: 'Dünyanın en büyük yapay zeka model ve veri kütüphanesi.' },
  { cat: 'dev', title: 'Kaggle', url: 'https://www.kaggle.com/', icon: '📉', desc: 'Veri bilimi ve makine öğrenmesi açık veri setleri.' },
  { cat: 'dev', title: 'Julius AI', url: 'https://julius.ai/', icon: '📊', desc: 'Tablo analiz etme, verileri yorumlama ve grafik çıkarma.' },

  
  { cat: 'dev', title: 'Blockade Labs (Skybox)', url: 'https://skybox.blockadelabs.com/', icon: '🌌', desc: 'Metin yazarak içine girebileceğin 360 derece (VR) dünyalar tasarla.' },

  // --- Yardımcı Araçlar ---
  { cat: 'edu', title: 'Diffit', url: 'https://web.diffit.me/', icon: '📑', desc: 'İçeriği farklı öğrenci/okuma seviyelerine göre uyarla.' },
  { cat: 'edu', title: 'Quizizz', url: 'https://quizizz.com/', icon: '🕹️', desc: 'Etkileşimli değerlendirmeler ve quiz oyunları hazırla.' },
  { cat: 'edu', title: 'Notion AI', url: 'https://www.notion.so/product/ai', icon: '🗒️', desc: 'Planlarını, kaynaklarını ve çalışma süreçlerini düzenle.' },
  { cat: 'edu', title: 'Napkin AI', url: 'https://www.napkin.ai/', icon: '🗺️', desc: 'Metinleri anında kavram haritalarına ve görsellere dönüştür.' },
  { cat: 'edu', title: 'GPTZero', url: 'https://gptzero.me/', icon: '🛡️', desc: 'Metinlerin yapay zeka tarafından üretilip üretilmediğini test et.' },
  { cat: 'edu', title: 'GitHub', url: 'https://github.com/', icon: '🐙', desc: 'Geliştirdiğin projeleri yedekle, sürümle ve dünyayla paylaş.' }
]

export default function HighSchoolAILab() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredTools = activeCategory === 'all' 
    ? AI_TOOLS 
    : AI_TOOLS.filter(t => t.cat === activeCategory)

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-10 text-center">
        <div className="inline-block p-4 bg-purple-100 rounded-full text-purple-600 text-5xl mb-4 shadow-inner border border-purple-200">
          🧠
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Lise Yapay Zeka Laboratuvarı</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Akademik araştırmalardan veri bilimine, kod geliştirmeden 3D tasarıma kadar profesyonel yapay zeka araçları.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeCategory === cat.id 
                ? 'bg-purple-600 text-white shadow-md border border-purple-500' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((t, idx) => (
          <div 
            key={idx} 
            onClick={() => window.open(t.url, "_blank")}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform origin-center shadow-sm border border-slate-100">
                {t.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-purple-700 transition-colors">{t.title}</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
              {t.desc}
            </p>
            <div className="inline-flex items-center self-start gap-2 text-purple-600 text-sm font-bold bg-purple-50 px-4 py-2 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              Platforma Git ➔
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
