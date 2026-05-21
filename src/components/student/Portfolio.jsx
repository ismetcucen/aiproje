import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { buildPortfolio } from '../../firebase/schema'

const CONTENT_TYPE_LABELS = {
  text:         'Metin',
  code:         'Kod',
  project:      'Proje',
  presentation: 'Sunum',
}

export default function Portfolio() {
  const { user } = useAuth()
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (user) loadPortfolio()
  }, [user])

  async function loadPortfolio() {
    setLoading(true)
    try {
      const data = await buildPortfolio(user.uid)
      setItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Yukleniyor...</div>

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-white text-xl font-semibold">Portfolyom</h2>
        <p className="text-slate-400 text-sm mt-0.5">{items.length} uretim</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white font-medium mb-2">Henuz uretim yok</p>
          <p className="text-slate-400 text-sm">Gorevlere gidip uretim yaptiğinda burada gorunecek.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors cursor-pointer"
              onClick={() => setSelected(selected?.id === item.id ? null : item)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium text-sm">
                      {item.assignment?.title || 'Gorev bulunamadi'}
                    </h3>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                      {CONTENT_TYPE_LABELS[item.contentType] || item.contentType}
                    </span>
                    {item.aiUsed && (
                      <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-md">
                        AI kullanildi
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs">
                    {item.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {item.score !== null && item.score !== undefined && (
                    <div className="text-center">
                      <p className={`text-lg font-bold ${item.score >= 70 ? 'text-green-400' : item.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {item.score}
                      </p>
                      <p className="text-slate-500 text-xs">puan</p>
                    </div>
                  )}
                  <span className="text-slate-600 text-xs">{selected?.id === item.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Genişletilmiş içerik */}
              {selected?.id === item.id && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{item.content}</p>
                  {item.feedback && (
                    <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-800/50 rounded-lg">
                      <p className="text-indigo-300 text-xs font-medium mb-1">Ogretmen Yorumu</p>
                      <p className="text-slate-300 text-sm">{item.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
