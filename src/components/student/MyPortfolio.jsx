import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

// Oyunlaştırma Hesaplamaları
const XP_PER_DOJO_POINT = 100;
const XP_PER_LEVEL = 1000; // Her 1000 XP = 1 Level (10 Dojo Yıldızı = 1 Level)

export default function MyPortfolio() {
  const { profile } = useAuth()
  
  // Güvenlik ve Varsayılan Değerler
  const dojoPoints = profile?.dojoPoints || 0;
  const currentXP = Math.max(0, dojoPoints * XP_PER_DOJO_POINT);
  const currentLevel = Math.floor(currentXP / XP_PER_LEVEL) + 1;
  
  // Level içi XP ilerlemesi
  const xpInCurrentLevel = currentXP % XP_PER_LEVEL;
  const progressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / XP_PER_LEVEL) * 100));

  // Rütbeler (Seviyelere göre)
  const getRankName = (level) => {
    if (level < 3) return "Çaylak Kodlayıcı (Novice)";
    if (level < 6) return "Çırak Geliştirici (Apprentice)";
    if (level < 10) return "Genç Mühendis (Junior)";
    if (level < 15) return "Kıdemli Mimar (Senior)";
    if (level < 20) return "Yapay Zeka Ustası (Master)";
    return "Efsanevi Hacker (Legend)";
  };

  const getRankColor = (level) => {
    if (level < 3) return "from-slate-400 to-slate-500";
    if (level < 6) return "from-green-400 to-emerald-500";
    if (level < 10) return "from-blue-400 to-indigo-500";
    if (level < 15) return "from-purple-400 to-fuchsia-500";
    if (level < 20) return "from-orange-400 to-red-500";
    return "from-yellow-400 via-amber-500 to-yellow-600";
  }

  // Rozetler (Otomatik olarak Level'a göre açılır)
  const badges = [
    { id: 1, name: "İlk Adım", desc: "Sisteme giriş yaptın", reqLvl: 1, icon: "👶" },
    { id: 2, name: "Kodlayıcı", desc: "Seviye 3'e ulaştın", reqLvl: 3, icon: "💻" },
    { id: 3, name: "Algoritma Ustası", desc: "Seviye 5'e ulaştın", reqLvl: 5, icon: "🧠" },
    { id: 4, name: "Takım Oyuncusu", desc: "Seviye 8'e ulaştın", reqLvl: 8, icon: "🤝" },
    { id: 5, name: "Robotik Dehası", desc: "Seviye 12'ye ulaştın", reqLvl: 12, icon: "🤖" },
    { id: 6, name: "Yapay Zeka Mimarı", desc: "Seviye 15'e ulaştın", reqLvl: 15, icon: "✨" },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header / Banner */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
        {/* Dekoratif Arka Plan */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${getRankColor(currentLevel)} rounded-full opacity-10 blur-3xl -mr-20 -mt-20`}></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br ${getRankColor(currentLevel)} flex items-center justify-center text-5xl flex-shrink-0`}>
              {profile?.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full rounded-full object-cover" /> : "👨‍💻"}
            </div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-slate-900 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm">L{currentLevel}</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-800">{profile?.fullName}</h1>
            <p className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getRankColor(currentLevel)} text-white shadow-sm`}>
              {getRankName(currentLevel)}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span>📚</span>
                <span>{profile?.gradeNumber}. Sınıf</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span>🏫</span>
                <span>Okul Kodu: <span className="font-bold text-slate-700">{profile?.schoolCode}</span></span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center min-w-[200px]">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Toplam XP</p>
            <p className="text-4xl font-black text-slate-800 mt-1">{currentXP.toLocaleString()}</p>
            <p className="text-indigo-500 text-xs font-bold mt-2">✨ {dojoPoints} Dojo Yıldızı</p>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Seviye İlerlemesi</h2>
            <p className="text-slate-500 text-sm mt-1">Sonraki seviyeye <span className="font-bold text-slate-700">{XP_PER_LEVEL - xpInCurrentLevel} XP</span> kaldı.</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-indigo-600">{currentLevel}</span>
            <span className="text-slate-400 font-bold ml-1">&rarr; {currentLevel + 1}</span>
          </div>
        </div>
        
        <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
          <div 
            className={`h-full bg-gradient-to-r ${getRankColor(currentLevel)} transition-all duration-1000 ease-out relative`}
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
          <span>{currentXP.toLocaleString()} XP</span>
          <span>{((currentLevel) * XP_PER_LEVEL).toLocaleString()} XP</span>
        </div>
      </div>

      {/* Badges / Rozetler */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Kazanılan Rozetler (Başarımlar)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {badges.map(badge => {
            const isUnlocked = currentLevel >= badge.reqLvl;
            return (
              <div key={badge.id} className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${isUnlocked ? 'border-indigo-100 bg-indigo-50/50 shadow-sm' : 'border-slate-100 bg-slate-50 opacity-60 grayscale'}`}>
                <div className={`w-14 h-14 flex items-center justify-center text-2xl rounded-full mb-3 ${isUnlocked ? 'bg-white shadow-md' : 'bg-slate-200'}`}>
                  {badge.icon}
                </div>
                <h3 className={`text-sm font-bold text-center ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>{badge.name}</h3>
                <p className="text-[10px] text-center mt-1 text-slate-400 font-medium">Seviye {badge.reqLvl}</p>
              </div>
            )
          })}
        </div>
      </div>
      
    </div>
  )
}
