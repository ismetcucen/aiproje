import { useState, useEffect } from 'react'
import { getPublicPortfolio, BADGES } from '../firebase/schema'
import { CONTENT_TYPE_LABELS } from '../components/student/Portfolio' // Need to export it or redefine it

export default function ParentPortfolio({ studentId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Yükleniyor...</div>
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">{error}</div>

  const { student, submissions } = data
  const gradedItems = submissions.filter(i => i.score !== null && i.score !== undefined);
  const totalScore = gradedItems.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = gradedItems.length > 0 ? totalScore / gradedItems.length : 0;
  const aiUsedCount = submissions.filter(i => i.aiUsed).length;

  const badges = [];
  if (submissions.length >= 1) badges.push({ icon: '🌱', label: 'İlk Adım' });
  if (submissions.length >= 5) badges.push({ icon: '🛠️', label: 'Yapay Zeka Çırağı' });
  if (aiUsedCount >= 3) badges.push({ icon: '🤖', label: 'AI Dostu' });
  if (avgScore >= 85 && gradedItems.length >= 3) badges.push({ icon: '⭐', label: 'Yıldız Öğrenci' });
  if (submissions.some(i => i.isShowcase)) badges.push({ icon: '🏆', label: 'Vitrin Yıldızı' });

  return (
    <div className="min-h-screen bg-slate-50 p-6 print-container">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .print-hidden { display: none !important; }
          .print-block { display: block !important; }
          .print-container { padding: 0 !important; background: white !important; }
          .shadow-sm { box-shadow: none !important; }
          .border { border-color: #ddd !important; }
          @page { margin: 1cm; size: A4 portrait; }
        }
      `}} />
      <div className="max-w-4xl mx-auto">
        <header className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center border border-slate-200 relative">
          <button 
            onClick={() => window.print()}
            className="print-hidden absolute top-4 right-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            <span>📥</span> Raporu İndir (PDF)
          </button>
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
            {student.fullName.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{student.fullName}</h1>
          <p className="text-slate-500">{student.gradeNumber ? student.gradeNumber + '. Sınıf ' : ''}Öğrenci Gelişim Portfolyosu</p>
          <div className="hidden print-block mt-4 text-sm text-slate-400">Bu rapor ÖHEP AI Studio sistemi üzerinden otomatik oluşturulmuştur.</div>
        </header>

        {badges.length > 0 && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Kazanılan Rozetler</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {badges.map((b, i) => (
                <div key={i} className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 w-24 h-24 rounded-2xl shadow-sm">
                  <span className="text-4xl mb-2">{b.icon}</span>
                  <span className="text-xs text-center font-medium text-slate-600 leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Tamamlanan Görevler ({submissions.length})</h2>
          {submissions.map(item => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{item.assignment?.title || 'Görev'}</h3>
                  <p className="text-slate-500 text-sm">{item.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}</p>
                </div>
                {item.score !== null && (
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-xl font-bold border border-green-200">
                    {item.score} Puan
                  </div>
                )}
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{item.content}</p>

              {item.files && item.files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.files.map((f, i) => (
                    <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="bg-blue-50 hover:bg-blue-100 text-sm px-3 py-1.5 rounded-lg text-blue-700 border border-blue-200 flex items-center gap-1 transition-colors">
                      📎 {f.name}
                    </a>
                  ))}
                </div>
              )}

              {item.feedback && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-indigo-800 text-sm font-bold mb-1">Öğretmen Yorumu</p>
                  <p className="text-indigo-900 text-sm">{item.feedback}</p>
                </div>
              )}
            </div>
          ))}
          {submissions.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500">Henüz sergilenecek bir görev yok.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
