import { useState, useEffect } from 'react'
import { getPublicPortfolio } from '../firebase/schema'

export default function ParentPortfolio({ studentId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all', 'live', 'assignments'

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getPublicPortfolio(studentId)
        if (!result) {
          setError('Bu portfolyo bulunamadı veya gizli.')
        } else {
          setData(result)
        }
      } catch (err) {
        setError('Bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [studentId])

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">Portfolyo Yükleniyor...</div>
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500 font-medium">{error}</div>

  const { student, submissions = [], liveAnswers = [] } = data
  const gradedItems = submissions.filter(i => i.score !== null && i.score !== undefined)
  const totalScore = gradedItems.reduce((acc, curr) => acc + curr.score, 0)
  const avgScore = gradedItems.length > 0 ? (totalScore / gradedItems.length).toFixed(0) : 0
  const aiUsedCount = submissions.filter(i => i.aiUsed).length

  const badges = []
  if (submissions.length >= 1) badges.push({ icon: '🌱', label: 'İlk Adım' })
  if (submissions.length >= 5) badges.push({ icon: '🛠️', label: 'Yapay Zeka Çırağı' })
  if (aiUsedCount >= 3) badges.push({ icon: '🤖', label: 'AI Dostu' })
  if (avgScore >= 85 && gradedItems.length >= 3) badges.push({ icon: '⭐', label: 'Yıldız Öğrenci' })
  if (submissions.some(i => i.isShowcase)) badges.push({ icon: '🏆', label: 'Vitrin Yıldızı' })
  if (liveAnswers.length >= 1) badges.push({ icon: '📡', label: 'Canlı Katılımcı' })
  if (liveAnswers.length >= 5) badges.push({ icon: '⚡', label: 'Soru Avcısı' })

  function formatDateTime(timestamp) {
    if (!timestamp) return ''
    try {
      const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp)
      return d.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 print-container">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .print-hidden { display: none !important; }
          .print-block { display: block !important; }
          .print-container { padding: 0 !important; background: white !important; }
          .shadow-sm, .shadow-md, .shadow-xl { box-shadow: none !important; }
          .border { border-color: #ddd !important; }
          .page-break { page-break-before: always; }
          @page { margin: 1cm; size: A4 portrait; }
        }
      `}} />
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 relative text-center overflow-hidden">
          <div className="print-hidden absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <button 
            onClick={() => window.print()}
            className="print-hidden absolute top-5 right-5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2.5 px-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center gap-2 border border-indigo-200 shadow-sm"
          >
            <span>📥</span> Raporu İndir (PDF)
          </button>

          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'Ö'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{student.fullName}</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">
            {student.gradeNumber ? `${student.gradeNumber}. Sınıf ` : ''}
            {student.section ? `(${student.section} Şubesi) ` : ''}
            Öğrenci Gelişim & Canlı Ders Portfolyosu
          </p>
          <div className="hidden print-block mt-4 text-xs text-slate-400">
            Bu resmi gelişim ve katılım raporu ÖHEP AI Studio sistemi üzerinden otomatik oluşturulmuştur.
          </div>

          {/* İSTATİSTİK ÖZETİ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-2xl font-black text-indigo-600">{submissions.length}</span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Ödev / Görev</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-2xl font-black text-emerald-600">{liveAnswers.length}</span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Canlı Sınıf Sorusu</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-2xl font-black text-amber-500">{avgScore > 0 ? avgScore : '-'}</span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Puan Ortalaması</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-2xl font-black text-purple-600">{aiUsedCount}</span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">AI ile Üretim</p>
            </div>
          </div>
        </header>

        {/* KAZANILAN ROZETLER */}
        {badges.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🎖️</span> Kazanılan Başarı Rozetleri
            </h2>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {badges.map((b, i) => (
                <div key={i} className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 w-24 h-24 rounded-2xl shadow-sm hover:scale-105 transition-transform">
                  <span className="text-3xl mb-1">{b.icon}</span>
                  <span className="text-[11px] text-center font-bold text-slate-700 leading-tight px-1">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB BUTONLARI (Baskıda hepsi çıkar, ekranda filtrelenebilir) */}
        <div className="print-hidden flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            🌟 Tüm Aktiviteler ({submissions.length + liveAnswers.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>📡</span> Canlı Sınıf Soruları ({liveAnswers.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'assignments'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <span>📋</span> Görevler & Ödevler ({submissions.length})
          </button>
        </div>

        {/* ─── CANLI SINIF SORU & CEVAPLARI ─── */}
        {(activeTab === 'all' || activeTab === 'live') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span>📡</span> Canlı Sınıf Soru & Cevap Kayıtları ({liveAnswers.length})
              </h2>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Öğretmenin derste sorduğu sorular ve öğrencinin verdiği anlık yanıtlar
              </span>
            </div>

            {liveAnswers.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-3xl border border-slate-200 p-6">
                <span className="text-4xl block mb-2">📡</span>
                <p className="text-slate-600 font-bold">Henüz Canlı Sınıf Kaydı Bulunmuyor</p>
                <p className="text-slate-400 text-xs mt-1">Öğretmen canlı sınıfta soru gönderdiğinde öğrencinin cevapları burada görünecektir.</p>
              </div>
            ) : (
              liveAnswers.map((item, idx) => (
                <div key={item.id || idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-emerald-300 transition-colors">
                  
                  {/* Kart Üst Bilgi Satırı */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                        <span>{item.questionType === 'poll' ? '🔘 Çoktan Seçmeli' : '✍️ Açık Uçlu Soru'}</span>
                      </span>
                      {item.studentSection && (
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-xl">
                          {item.gradeNumber || student.gradeNumber}/{item.studentSection} Şubesi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span>🕒 {formatDateTime(item.createdAt) || 'Tarih kaydedildi'}</span>
                    </div>
                  </div>

                  {/* Soru Görseli / Slaytı Varsa */}
                  {item.questionSlide && (
                    <div className="mb-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 flex justify-center">
                      <img 
                        src={item.questionSlide} 
                        alt="Soru Slaytı" 
                        className="max-h-64 rounded-xl object-contain shadow-sm"
                      />
                    </div>
                  )}

                  {/* Soru Metni */}
                  <div className="mb-4">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Sorulan Soru</p>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                      {item.questionText || '(Soru görsel üzerinden sorulmuştur)'}
                    </h3>
                  </div>

                  {/* Çoktan Seçmeli / Anket İse Şıklar */}
                  {item.questionType === 'poll' && item.pollOptions && item.pollOptions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Seçenekler</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.pollOptions.map((opt, oIdx) => {
                          const isStudentChoice = opt === item.answer || item.answer === String.fromCharCode(65 + oIdx) || item.answer?.startsWith?.(opt);
                          return (
                            <div 
                              key={oIdx} 
                              className={`p-3 rounded-xl border text-sm flex items-center justify-between gap-2 transition-all ${
                                isStudentChoice 
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-2 ring-emerald-300' 
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                                  isStudentChoice ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isStudentChoice && (
                                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black flex items-center gap-1 shadow-sm">
                                  ✓ Öğrencinin Tercihi
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Öğrencinin Cevabı (Açık Uçlu veya Ek Açıklama) */}
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4">
                    <p className="text-indigo-900 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <span>💬</span> Öğrencinin Cevabı:
                    </p>
                    <p className="text-slate-800 font-semibold text-sm sm:text-base whitespace-pre-wrap">
                      {item.answer || <span className="text-slate-400 italic">Cevap belirtilmemiş</span>}
                    </p>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

        {/* ─── GÖREVLER VE ÖDEVLER ─── */}
        {(activeTab === 'all' || activeTab === 'assignments') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span>📋</span> Görev & Ödev Çalışmaları ({submissions.length})
              </h2>
            </div>

            {submissions.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{item.assignment?.title || 'Görev'}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{item.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}</p>
                  </div>
                  {item.score !== null && item.score !== undefined ? (
                    <div className="bg-green-50 text-green-700 px-3 py-1 rounded-xl font-bold border border-green-200 text-sm">
                      {item.score} Puan
                    </div>
                  ) : (
                    <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-xl font-semibold border border-slate-200 text-xs">
                      Bekliyor
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-4">
                  <p className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">Öğrencinin Teslim Ettiği İçerik</p>
                  <p className="text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">
                    {typeof item.content === 'string' && item.content.trim() !== ''
                      ? item.content.split(/(\s+)/).map((word, index) => 
                          word.match(/^https?:\/\/[^\s]+$/) 
                            ? <a key={index} href={word} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{word}</a>
                            : word
                        ) 
                      : (item.content || <span className="text-slate-400 italic">Sadece dosya yüklendi veya içerik metni boş.</span>)}
                  </p>
                </div>

                {item.files && item.files.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.files.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="bg-blue-50 hover:bg-blue-100 text-xs font-bold px-3 py-2 rounded-xl text-blue-700 border border-blue-200 flex items-center gap-1.5 transition-colors">
                        📎 {f.name}
                      </a>
                    ))}
                  </div>
                )}

                {item.feedback && (
                  <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <p className="text-indigo-800 text-xs font-bold uppercase tracking-wider mb-1">Öğretmen Geri Bildirimi</p>
                    <p className="text-indigo-950 text-sm font-medium">{item.feedback}</p>
                  </div>
                )}
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="text-center py-8 bg-white rounded-3xl border border-slate-200 p-6">
                <p className="text-slate-500 font-medium">Henüz teslim edilmiş bir görev bulunmuyor.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
