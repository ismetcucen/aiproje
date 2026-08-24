import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { buildPortfolio } from '../../firebase/schema'

const CONTENT_TYPE_LABELS = {
  text: 'Metin', code: 'Kod', project: 'Proje', presentation: 'Sunum',
}

export default function Portfolio() {
  const { user, profile } = useAuth()
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => { if (user) loadPortfolio() }, [user])

  async function loadPortfolio() {
    setLoading(true)
    try {
      const data = await buildPortfolio(user.uid)
      setItems(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  function downloadTxt(item) {
    const lines = [
      `AI URETIM PLATFORMU - PORTFOLYO`,
      `================================`,
      ``,
      `Ogrenci  : ${profile?.fullName || ''}`,
      `Okul Kodu: ${profile?.schoolCode || ''}`,
      `Sinif    : ${profile?.gradeNumber ? profile.gradeNumber + '. sinif' : ''}`,
      ``,
      `Gorev    : ${item.assignment?.title || 'Bilinmiyor'}`,
      `Tur      : ${CONTENT_TYPE_LABELS[item.contentType] || item.contentType}`,
      `Tarih    : ${item.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}`,
      `AI Kullanimi: ${item.aiUsed ? 'Evet' : 'Hayir'}`,
      ``,
      `--- URETIM ---`,
      ``,
      item.content || '',
      ``,
    ]
    if (item.score !== null && item.score !== undefined) {
      lines.push(`--- OGRETMEN GERI BILDIRIMI ---`)
      lines.push(`Puan   : ${item.score}/100`)
      if (item.feedback) lines.push(`Yorum  : ${item.feedback}`)
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `portfolyo_${(item.assignment?.title || 'uretim').replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadAllTxt() {
    const lines = [
      `AI URETIM PLATFORMU - TAM PORTFOLYO`,
      `====================================`,
      `Ogrenci  : ${profile?.fullName || ''}`,
      `Okul Kodu: ${profile?.schoolCode || ''}`,
      `Toplam Uretim: ${items.length}`,
      ``,
    ]
    items.forEach((item, i) => {
      lines.push(`${'='.repeat(40)}`)
      lines.push(`URETIM ${i + 1}: ${item.assignment?.title || 'Bilinmiyor'}`)
      lines.push(`${'='.repeat(40)}`)
      lines.push(`Tur   : ${CONTENT_TYPE_LABELS[item.contentType] || item.contentType}`)
      lines.push(`Tarih : ${item.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}`)
      lines.push(`AI    : ${item.aiUsed ? 'Evet' : 'Hayir'}`)
      if (item.score !== null && item.score !== undefined) lines.push(`Puan  : ${item.score}/100`)
      lines.push(``)
      lines.push(item.content || '')
      lines.push(``)
      if (item.feedback) {
        lines.push(`Ogretmen Yorumu: ${item.feedback}`)
        lines.push(``)
      }
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `tam_portfolyo_${profile?.fullName?.replace(/\s+/g, '_') || 'ogrenci'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  
  const totalSubmissions = items.length;
  const gradedItems = items.filter(i => i.score !== null && i.score !== undefined);
  const totalScore = gradedItems.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = gradedItems.length > 0 ? totalScore / gradedItems.length : 0;
  const aiUsedCount = items.filter(i => i.aiUsed).length;

  const badges = [];
  if (totalSubmissions >= 1) badges.push({ icon: '🌱', label: 'İlk Adım' });
  if (totalSubmissions >= 5) badges.push({ icon: '🛠️', label: 'Yapay Zeka Çırağı' });
  if (totalSubmissions >= 10) badges.push({ icon: '🎓', label: 'Yapay Zeka Uzmanı' });
  if (aiUsedCount >= 3) badges.push({ icon: '🤖', label: 'AI Dostu' });
  if (avgScore >= 85 && gradedItems.length >= 3) badges.push({ icon: '⭐', label: 'Yıldız Öğrenci' });
  if (items.some(i => i.isShowcase)) badges.push({ icon: '🏆', label: 'Vitrin Yıldızı' });

  // Let's render badges below the title

  const filtered = filter === 'all' ? items :
    filter === 'graded' ? items.filter(i => i.score !== null && i.score !== undefined) :
    filter === 'ai'     ? items.filter(i => i.aiUsed) : items

  if (loading) return <div className="text-center py-20 text-slate-400">Yukleniyor...</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">Portfolyom</h2>
          <p className="text-slate-400 text-sm mt-0.5">{items.length} uretim</p>
        </div>
        {items.length > 0 && (
          <button onClick={downloadAllTxt}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            Tumunu Indir
          </button>
          
          <button onClick={() => {
            const url = `${window.location.origin}/p/${user.uid}`;
            navigator.clipboard.writeText(url);
            alert('Portfolyo linki kopyalandı! Bu linki ailenle paylaşabilirsin.\n' + url);
          }}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            🔗 Ailemle Paylaş
          </button>

        )}
      </div>

      
      {/* Rozetler */}
      {badges.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider">Kazanılan Rozetler</p>
          <div className="flex flex-wrap gap-3">
            {badges.map((b, i) => (
              <div key={i} className="flex flex-col items-center justify-center bg-slate-900 border border-slate-700 w-20 h-20 rounded-xl shadow-lg">
                <span className="text-3xl mb-1">{b.icon}</span>
                <span className="text-[10px] text-center font-medium text-slate-300 leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtreler */}
      {items.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'all',    label: `Tumu (${items.length})` },
            { id: 'graded', label: `Puanlandi (${items.filter(i => i.score !== null && i.score !== undefined).length})` },
            { id: 'ai',     label: `AI Kullanildi (${items.filter(i => i.aiUsed).length})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filter === f.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white font-medium mb-2">Henuz uretim yok</p>
          <p className="text-slate-400 text-sm">Gorevlere gidip uretim yaptiğinda burada gorunecek.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors cursor-pointer"
              onClick={() => setSelected(selected?.id === item.id ? null : item)}>
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
                        AI
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
                  <button
                    onClick={e => { e.stopPropagation(); downloadTxt(item) }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs transition-colors">
                    Indir
                  </button>
                  <span className="text-slate-600 text-xs">{selected?.id === item.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {selected?.id === item.id && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{item.content}</p>

                  {item.files && item.files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.files.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg text-blue-300 border border-slate-700 flex items-center gap-1 transition-colors">
                          📎 {f.name}
                        </a>
                      ))}
                    </div>
                  )}
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
