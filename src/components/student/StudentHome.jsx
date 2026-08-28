import { useAuth } from '../../hooks/useAuth'

export default function StudentHome({ onNavigate }) {
  const { profile } = useAuth()

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl mb-8 border border-indigo-500/30">
        
        {/* Dekoratif Arka Plan Şekilleri */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-semibold mb-6 backdrop-blur-sm">
            <span className="animate-pulse">✨</span> Geleceğin Teknolojisi
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-100 to-white tracking-tight mb-4">
            ÖHEP OKULLARI AI STUDIO
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-blue-300 mb-6">
            Merhaba, {profile?.fullName.split(' ')[0]}!
          </h2>
          
          <p className="text-slate-700 text-lg md:text-xl max-w-2xl leading-relaxed mb-8">
            Yapay zeka (AI) sadece bir araç değil, senin yeni süper gücün. 
            Burada kelimelerle resim çizmeyi, kendi hikayelerini yazmayı ve 
            hayalindeki projeleri saniyeler içinde hayata geçirmeyi öğreneceksin. 
            Sınır yok, sadece senin hayal gücün var!
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => onNavigate('assignments')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
              <span>🚀</span> Maceraya Başla
            </button>
            <button onClick={() => onNavigate('portfolio')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-sm border border-white/20 transition-all text-lg flex items-center justify-center gap-2">
              <span>🏆</span> Portfolyomu Gör
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl mb-4">
            💡
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Üretken Yapay Zeka</h3>
          <p className="text-slate-600">Sadece "isteyerek" sıfırdan metin, müzik ve görsel üretmeyi keşfet. Prompt (Komut) mühendisliği ile yepyeni bir dil öğren.</p>
        </div>
        
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4">
            🎯
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Haftalık Görevler</h3>
          <p className="text-slate-600">Her hafta öğretmeninin senin için hazırladığı yeni görevleri tamamla, seviye atla ve portfolyonu harika eserlerle doldur.</p>
        </div>
        
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mb-4">
            🏅
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Rozetler Kazan</h3>
          <p className="text-slate-600">Çaba gösterdikçe ve yeni araçlar kullandıkça özel rozetler kazan. "Yapay Zeka Çırağı"ndan "Vitrin Yıldızı"na yüksel!</p>
        </div>
      </div>
    </div>
  )
}
