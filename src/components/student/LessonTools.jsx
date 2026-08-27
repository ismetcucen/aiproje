import { useState } from 'react'

const TOOLS = [
  {
    id: 'microbit',
    title: 'Micro:bit (MakeCode)',
    desc: 'Sanal Micro:bit kartını bloklarla kodla ve simülasyonda çalıştır.',
    url: 'https://makecode.microbit.org/',
    icon: '📟'
  },
  {
    id: 'scratch',
    title: 'mBlock (Scratch AI)',
    desc: 'Kuklalar ve arka planlarla kendi oyununu, animasyonunu tasarla.',
    url: 'https://ide.mblock.cc/',
    icon: '🐱'
  },
  {
    id: 'draw',
    title: 'Tasarım Tahtası',
    desc: 'Zihin haritaları, algoritmalar ve serbest çizimler yap.',
    url: 'https://excalidraw.com/',
    icon: '🎨'
  },
  {
    id: 'autodraw',
    title: 'Akıllı Çizim (AutoDraw)',
    desc: 'Sen basitçe çiz, yapay zeka onu harika bir görsele dönüştürsün!',
    url: 'https://www.autodraw.com/',
    icon: '🪄'
  }
  ,
  {
    id: 'ztype',
    title: 'Klavye Savaşları',
    desc: 'Yukarıdan düşen kelimeleri klavyede hızlıca yazarak uzay gemini koru!',
    url: 'https://zty.pe/',
    icon: '🚀'
  },
  {
    id: 'typing',
    title: '10 Parmak Klavye',
    desc: 'Klavyeye bakmadan hızlı ve doğru yazma alıştırmaları yap.',
    url: 'https://agilefingers.com/tr',
    icon: '⌨️'
  }
  ,
  {
    id: 'avatar',
    title: 'Avatar Stüdyosu',
    desc: 'Kendi profil avatarını tasarla, indir ve paylaş! (Yeni sekmede açılır)',
    url: 'https://avatarmaker.com/',
    icon: '👤',
    external: true
  }
  ,
  {
    id: 'edublocks',
    title: 'EduBlocks',
    desc: 'Python ve HTML/CSS kodlamaya bloklarla başla! (Yeni sekmede açılır)',
    url: 'https://app.edublocks.org/',
    icon: '🐍',
    external: true
  }
  ,
  {
    id: 'teachablemachine',
    title: 'Teachable Machine',
    desc: 'Kameranı kullanarak kendi yapay zeka modelini eğit! (Yeni sekmede açılır)',
    url: 'https://teachablemachine.withgoogle.com/',
    icon: '🧠',
    external: true
  },
  {
    id: 'makeymakey',
    title: 'Makey Makey Uygulamaları',
    desc: 'Bilgisayar klavyesini bir piyanoya veya bongo davuluna dönüştür!',
    url: 'https://apps.makeymakey.com/',
    icon: '🎹',
    external: false
  }
  ,
  {
    id: 'tinkercad',
    title: 'Tinkercad',
    desc: '3D tasarımlar yap ve sanal Arduino elektronik devreleri kur. (Yeni sekmede açılır)',
    url: 'https://www.tinkercad.com/',
    icon: '🧊',
    external: true
  }
  ,
  {
    id: 'pictoblox',
    title: 'PictoBlox (AI & ML)',
    desc: 'Scratch tabanlı arayüzle Yapay Zeka ve Makine Öğrenmesi projeleri geliştir!',
    url: 'https://pictoblox.ai/ide/',
    icon: '🐼',
    external: false
  },
  {
    id: 'arduino',
    title: 'Arduino Web Editor',
    desc: 'Arduino kartlarını doğrudan tarayıcı üzerinden kodla! (Yeni sekmede açılır)',
    url: 'https://app.arduino.cc/',
    icon: '♾️',
    external: true
  }
]

export default function LessonTools() {
  const [activeTool, setActiveTool] = useState(null)

  if (activeTool) {
    return (
      <div className="w-full h-[calc(100vh-6rem)] flex flex-col p-2">
        <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeTool.icon}</span>
            <div>
              <h2 className="font-bold text-lg text-slate-800">{activeTool.title}</h2>
              <p className="text-slate-500 text-xs">{activeTool.desc}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const iframe = document.getElementById('embedded-iframe');
                if (iframe) {
                  if (iframe.requestFullscreen) iframe.requestFullscreen();
                  else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
                  else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
                }
              }}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
            >
              <span>⛶</span> Tam Ekran
            </button>
            <button 
            onClick={() => setActiveTool(null)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold transition-colors"
          >
            Araçlara Dön
          </button>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg relative">
          <iframe id="embedded-iframe" 
            src={activeTool.url} 
            className="w-full h-full border-0 absolute inset-0"
            title={activeTool.title}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-10 text-center">
        <div className="inline-block p-4 bg-emerald-100 rounded-full text-emerald-500 text-5xl mb-4">
          🛠️
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Ders Araçları (Laboratuvar)</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Başka hiçbir siteye gitmene gerek yok! Scratch, Micro:bit ve tasarım uygulamalarını doğrudan buradan kullanabilirsin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TOOLS.map(t => (
          <div 
            key={t.id} 
            onClick={() => t.external ? window.open(t.url, "_blank") : setActiveTool(t)}
            className="bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-emerald-500 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group flex gap-6 items-center"
          >
            <div className="text-7xl group-hover:scale-110 transition-transform origin-left">
              {t.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{t.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                {t.desc}
              </p>
              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                Çalıştır ➔
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
