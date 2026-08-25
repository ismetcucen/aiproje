import { useState } from 'react'

const BRANCHES = [
  {
    id: 'turkce',
    icon: '🇹🇷',
    title: 'Türkçe Eğitimi',
    desc: 'Dil, yazma, okuma, dinleme ve telaffuz becerileri',
    tools: [
      { name: 'ChatGPT, Smodin, LanguageTool, Quillbot, DeepL Write', label: 'Yazma ve Fikir Geliştirme' },
      { name: 'ChatPDF, Humata AI', label: 'Okuma ve Analiz' },
      { name: 'SciSpace, Zotero, Consensus AI', label: 'Akademik Çalışmalar' },
      { name: 'Quizlet, Wordtune, Reverso Context, LingQ', label: 'Kelime ve Dil Bilgisi' },
      { name: 'Whisper, Elsa Speak, VoiceMod AI, Speechify, NaturalReader, Listen Notes', label: 'Dinleme ve Konuşma' },
      { name: 'Formative AI, Quizizz AI, Kahoot AI, Testportal AI', label: 'Ölçme-Değerlendirme' },
      { name: 'Canva AI, Gamma.app, Tome AI, Murf AI, HeyGen, Synthesia', label: 'İçerik ve Materyal' }
    ]
  },
  {
    id: 'matematik',
    icon: '📐',
    title: 'Matematik Eğitimi',
    desc: 'Kavram somutlaştırma, problem çözme ve analiz',
    tools: [
      { name: 'Photomath, Wolfram, GeoGebra, Smodin Omni, CameraMath, Symbolab', label: 'Problem Çözme' },
      { name: 'Desmos, GeoGebra 3D', label: 'Görselleştirme' },
      { name: 'Mathematica, Octave, Algodoo', label: 'Modelleme ve Simülasyon' },
      { name: 'Quizizz AI, Kahoot AI, Formative AI, Mathletics, MagicSchool AI', label: 'Ölçme ve Motivasyon' },
      { name: 'Khan Academy, Zearn Math, Buzzmath, Brilliant, Khanmingo, Curipod AI', label: 'Kavram Öğretimi' },
      { name: 'Excel + Copilot AI, Tableau AI, CODAP', label: 'Veri Analizi' }
    ]
  },
  {
    id: 'fen',
    icon: '🧪',
    title: 'Fen, Fizik, Kimya ve Biyoloji',
    desc: 'Deney, simülasyon ve bilimsel süreçler',
    tools: [
      { name: 'Pasco Capstone, Logger Pro, ResearchRabbit, Connected Papers', label: 'Fen Bilimleri' },
      { name: 'MATLAB/Simulink, Tracker Video Analysis, Perplexity AI, Wolfram Alpha', label: 'Fizik' },
      { name: 'PhET, Labster, PraxiLabs, BioLab, Frog Gipedia, DeepLabCut', label: 'Biyoloji (Simülasyon)' },
      { name: 'Merge EDU, BioVR, Complete Anatomy, Zygote Body, BioRender', label: 'Biyoloji (3D & Çizim)' },
      { name: 'Midjourney, Leonardo.ai, SciSpace', label: 'Kimya' }
    ]
  },
  {
    id: 'sosyal',
    icon: '🌍',
    title: 'Sosyal Bilimler',
    desc: 'Tarih ve Coğrafya eğitimleri',
    tools: [
      { name: 'Quizlet, Khan Academy, Brainly', label: 'İnteraktif Öğrenme' },
      { name: 'ArcGIS Online + AI, QGIS + Python AI', label: 'Coğrafi Veri ve Haritalama' }
    ]
  },
  {
    id: 'ilkokul',
    icon: '🏫',
    title: 'İlkokul ve Okul Öncesi',
    desc: 'Pedagojik gelişim, oyunlaştırma, okuryazarlık',
    tools: [
      { name: 'Squiggle Park, Reading Eggs, Raz-Kids, Wordwall, AI Storyteller', label: 'İlkokul (Okuma-Yazma)' },
      { name: 'Prodigy Math Game, Khan Academy Kids, Math Playground', label: 'İlkokul (Matematik)' },
      { name: 'Kahoot! Kids, Quizizz, Blooket, ClassDojo, Mood Meter, Nearpod', label: 'İlkokul (Oyun & Duygu)' },
      { name: 'Code.org, Quick Draw!, Twin Science', label: 'İlkokul (Yapay Zeka)' },
      { name: 'Epic!, ABCmouse, Starfall, Okuvaryum, TRT Çocuk Kitaplık', label: 'Okul Öncesi (Hikaye & Dil)' },
      { name: 'MentalUP, Todo Math, Matific', label: 'Okul Öncesi (Bilişsel)' }
    ]
  },
  {
    id: 'dil',
    icon: '🗣️',
    title: 'Yabancı Dil Eğitimi',
    desc: 'Konuşma, telaffuz, çeviri ve pratik',
    tools: [
      { name: 'TalkPal, Pi.ai, Gliglish, Tutor Lily, Univerbal', label: 'Konuşma Pratiği (Speaking)' },
      { name: 'ELSA Speak, SpeechCoach.io, Lola Speak', label: 'Telaffuz ve Aksan' },
      { name: 'Twee, Diffit, Speakable.io, Langeek', label: 'Materyal Üretimi' },
      { name: 'Duolingo, Busuu, EIGO.AI, Rosetta Stone', label: 'Kapsamlı Platformlar' },
      { name: 'Rewordify, TutorAI, DeepL, Reverso, Lingvist', label: 'Sadeleştirme ve Çeviri' },
      { name: 'ElevenLabs', label: 'Seslendirme' }
    ]
  },
  {
    id: 'bilisim',
    icon: '💻',
    title: 'Bilişim Teknolojileri',
    desc: 'Robotik, kodlama, yapay zeka',
    tools: [
      { name: 'mBlock (AI), PictoBlox AI', label: 'Blok Tabanlı ve Robotik' },
      { name: 'Google Teachable Machine', label: 'Model Eğitimi' },
      { name: 'Cursor, Windsurf, Replit AI, GitHub Copilot', label: 'Akıllı Kod Editörleri' },
      { name: 'VEX VR, NVIDIA Isaac Sim', label: 'Robotik Simülasyon' },
      { name: 'Cline, CodeGPT, Factory AI, OpenCV, TensorFlow, PyTorch', label: 'Ajanlar ve Kütüphaneler' },
      { name: 'Leonardo.ai, Suno', label: 'Oyun Tasarımı (Asset/Müzik)' },
      { name: 'Cognimates, MIT App Inventor, IBM Watsonx', label: 'Yapay Zeka Kavramları' }
    ]
  },
  {
    id: 'sanat',
    icon: '🎨',
    title: 'Sanat, Müzik, Spor',
    desc: 'Görsel sanatlar, spor analizi ve müzik',
    tools: [
      { name: 'Midjourney, DALL-E, Leonardo AI, Stable Diffusion, Artbreeder', label: 'Görsel Sanatlar' },
      { name: 'Canva AI, Adobe Firefly, Ideogram, Picsart, NVIDIA GauGAN, Krea.ai', label: 'Grafik & Tasarım' },
      { name: '123RF AI, Kling AI, Nano Banana, Monica AI', label: 'Video & Stil' },
      { name: 'MagicSchool AI, ChatGPT, Gemini, Catapult', label: 'Beden Eğitimi & Spor' },
      { name: 'Suno AI, Udio, Boomy, Ecrett Music, Soundraw, MusicGen', label: 'Müzik Üretimi' }
    ]
  },
  {
    id: 'ozel',
    icon: '🧠',
    title: 'Özel Eğitim ve PDR',
    desc: 'Öğrenme güçlükleri, rehberlik, erişilebilirlik',
    tools: [
      { name: 'Immersive Reader, Voice Dream, NaturalReader, Audible', label: 'Metin & Ses Dönüşümü' },
      { name: 'Seeing AI, Envision AI, Be My Eyes, Google Lens', label: 'Sanal Göz (Nesne Tanıma)' },
      { name: 'Ghotit Real Writer, ModMath, ClaroRead, Dyslexia Quest', label: 'Özel Öğrenme Güçlükleri' },
      { name: 'Focus@Will, Forest, Brain.fm, RescueTime, Todoist', label: 'DEHB ve Dikkat' },
      { name: 'Otsimo, VoiceTT, Proloquo2Go, Avaz AAC, Special Words', label: 'Otizm / İletişim' },
      { name: 'Claude, ChatGPT, MagicSchool AI, Goblin Tools', label: 'Rehberlik (PDR / BEP)' }
    ]
  }
]

export default function AIEducationTools() {
  const [activeBranch, setActiveBranch] = useState('turkce')

  const branchData = BRANCHES.find(b => b.id === activeBranch)

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 h-full flex flex-col md:flex-row gap-6">
      
      {/* Sol Menü - Branşlar */}
      <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Branşlara Göre Araçlar</h2>
        {BRANCHES.map(b => (
          <button
            key={b.id}
            onClick={() => setActiveBranch(b.id)}
            className={`w-full flex items-center justify-start p-3 rounded-xl transition-all text-left group ${
              activeBranch === b.id
                ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                : 'hover:bg-slate-50 border border-transparent'
            }`}
          >
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">{b.icon}</span>
            <div>
              <p className={`font-bold text-sm ${activeBranch === b.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                {b.title}
              </p>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{b.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Sağ İçerik - Araçlar */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <span className="text-5xl">{branchData.icon}</span>
          <div>
            <h1 className="text-3xl font-black text-slate-800">{branchData.title}</h1>
            <p className="text-slate-500 mt-1">{branchData.desc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branchData.tools.map((group, idx) => {
            const toolNames = group.name.split(',').map(t => t.trim())
            return (
              <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-indigo-100 transition-colors hover:bg-slate-50/80 group">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  {group.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {toolNames.map((toolName, i) => (
                    <a
                      key={i}
                      href={`https://www.google.com/search?q=${encodeURIComponent(toolName + ' AI education tool')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium bg-white text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                    >
                      {toolName} ↗
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
