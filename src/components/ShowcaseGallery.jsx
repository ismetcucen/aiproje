import { useState, useEffect } from 'react'
import { getShowcaseSubmissions } from '../firebase/schema'
import { useAuth } from '../hooks/useAuth'

export default function ShowcaseGallery() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (profile?.schoolCode) {
        const data = await getShowcaseSubmissions(profile.schoolCode)
        setItems(data)
      }
      setLoading(false)
    }
    load()
  }, [profile])

  if (loading) return <div className="text-center py-10 text-slate-500">Yükleniyor...</div>

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Okul Vitrini</h2>
        <p className="text-slate-500 max-w-xl mx-auto">Okulunuzdaki en başarılı, yaratıcı ve dikkat çeken projeler burada sergileniyor. İlham alın!</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center text-slate-500">
          Henüz vitrine eklenmiş bir çalışma yok. Yakında harika projeler burada olacak!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden group hover:-translate-y-2 transition-all">
              <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex flex-col justify-end relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  ⭐ Vitrin
                </div>
                {item.contentType === 'link' ? (
                  <div className="text-6xl absolute -bottom-4 -right-4 opacity-30 group-hover:scale-125 transition-transform">🔗</div>
                ) : item.contentType === 'image' ? (
                  <div className="text-6xl absolute -bottom-4 -right-4 opacity-30 group-hover:scale-125 transition-transform">🖼️</div>
                ) : (
                  <div className="text-6xl absolute -bottom-4 -right-4 opacity-30 group-hover:scale-125 transition-transform">📝</div>
                )}
                <h3 className="text-white font-bold text-xl relative z-10 leading-tight">Proje Gönderimi</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 block">Öğrenci Notu:</span>
                  <p className="text-slate-700 text-sm italic line-clamp-3">"{item.content}"</p>
                </div>
                {item.feedback && (
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <span className="text-xs font-bold text-emerald-600 mb-1 block flex items-center gap-1">
                      <span>💬</span> Öğretmen Yorumu:
                    </span>
                    <p className="text-emerald-800 text-xs">"{item.feedback}"</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Tebrikler! 🎉</span>
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">Puan: {item.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
