import { useState } from 'react'

const GAMES = [
  {
    id: 'maze',
    title: 'Labirent (Blockly)',
    desc: 'Kod bloklarını sürükleyip birleştirerek karakteri hedefe ulaştır!',
    url: 'https://blockly.games/maze?lang=tr',
    icon: '🗺️'
  },
  {
    id: 'turtle',
    title: 'Kaplumbağa (Çizim)',
    desc: 'Kod yazarak kaplumbağaya harika şekiller çizdir.',
    url: 'https://blockly.games/turtle?lang=tr',
    icon: '🐢'
  },
  {
    id: 'bird',
    title: 'Kuş (Koordinat)',
    desc: 'Kuşun solucanı yakalaması ve yuvaya dönmesi için doğru açıları bul!',
    url: 'https://blockly.games/bird?lang=tr',
    icon: '🦅'
  }
  ,
  {
    id: 'computeit',
    title: 'Compute it',
    desc: 'Kodları okuyarak bilgisayarın kendisi sen ol! Yön tuşlarıyla algoritmaları çöz.',
    url: 'https://compute-it.toxicode.fr/',
    icon: '💻'
  }
  ,
  {
    id: 'codeforlife',
    title: 'Code For Life',
    desc: 'Rapid Router oyunu ile teslimat minibüsünü kodlayarak yönlendir! (Yeni sekmede açılır)',
    url: 'https://www.codeforlife.education/rapidrouter/',
    icon: '🚚',
    external: true
  }
  ,
  {
    id: 'rodocodo',
    title: 'Rodocodo (Kodlama)',
    desc: 'Kod bloklarını kullanarak sevimli robota yol göster ve bulmacaları çöz!',
    url: 'https://game.rodocodo.com/hour-of-code/',
    icon: '🤖'
  }
]

export default function CodingGames() {
  const [activeGame, setActiveGame] = useState(null)

  if (activeGame) {
    return (
      <div className="w-full h-[calc(100vh-6rem)] flex flex-col p-2">
        <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeGame.icon}</span>
            <div>
              <h2 className="font-bold text-lg text-slate-800">{activeGame.title}</h2>
              <p className="text-slate-500 text-xs">{activeGame.desc}</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveGame(null)}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2 rounded-xl font-bold transition-colors"
          >
            Oyunlara Dön
          </button>
        </div>
        <div className="flex-1 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg relative">
          <iframe 
            src={activeGame.url} 
            className="w-full h-full border-0 absolute inset-0"
            title={activeGame.title}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-10 text-center">
        <div className="inline-block p-4 bg-indigo-100 rounded-full text-indigo-500 text-5xl mb-4">
          🎮
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Eğlence ve Kodlama</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Görevlerini tamamladıysan şimdi eğlenme zamanı! Kodlama bloklarını kullanarak kendi oyununu yarat, bulmacaları çöz ve mantığını geliştir.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GAMES.map(g => (
          <div 
            key={g.id} 
            onClick={() => g.external ? window.open(g.url, "_blank") : setActiveGame(g)}
            className="bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform origin-left">
              {g.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{g.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {g.desc}
            </p>
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              Hemen Başla ➔
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
