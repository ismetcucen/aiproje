import { useState, useEffect } from 'react'
import { getQnaForTeacher, answerQuestion } from '../../firebase/schema'
import { useAuth } from '../../hooks/useAuth'

export default function QnaInbox() {
  const { user, profile } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)

  useEffect(() => {
    load()
  }, [user])

  async function load() {
    if (!profile?.schoolCode) return
    setLoading(true)
    const data = await getQnaForTeacher(profile.schoolCode)
    setQuestions(data)
    setLoading(false)
  }

  async function handleReply(e, qId) {
    e.preventDefault()
    if (!replyText.trim()) return
    await answerQuestion(qId, replyText, profile.fullName)
    setReplyText('')
    setReplyingTo(null)
    load()
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Sorular yükleniyor...</div>

  const unanswered = questions.filter(q => !q.isAnswered)
  const answered = questions.filter(q => q.isAnswered)

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          💬 Gelen Sorular 
          {unanswered.length > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">{unanswered.length} Yeni</span>
          )}
        </h2>
        <p className="text-slate-500 mt-2">Öğrencilerinizden gelen soruları buradan yönetebilirsiniz.</p>
      </div>

      <div className="space-y-8">
        {unanswered.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Yanıt Bekleyenler</h3>
            <div className="space-y-4">
              {unanswered.map(q => (
                <div key={q.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-800">
                      {q.studentName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{q.studentName}</h4>
                      <p className="text-xs text-slate-500">{q.createdAt?.toDate ? q.createdAt.toDate().toLocaleString('tr-TR') : 'Az önce'}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 bg-white p-4 rounded-xl border border-amber-100 mb-4">"{q.question}"</p>
                  
                  {replyingTo === q.id ? (
                    <form onSubmit={(e) => handleReply(e, q.id)} className="flex gap-2">
                      <input 
                        type="text" 
                        required
                        value={replyText} 
                        onChange={e => setReplyText(e.target.value)} 
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Yanıtınızı buraya yazın..." 
                        autoFocus
                      />
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold transition-colors">
                        Gönder
                      </button>
                      <button type="button" onClick={() => setReplyingTo(null)} className="text-slate-500 hover:bg-slate-200 px-4 py-2 rounded-xl font-medium">
                        İptal
                      </button>
                    </form>
                  ) : (
                    <button onClick={() => setReplyingTo(q.id)} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-xl font-bold transition-colors text-sm shadow-sm">
                      Yanıtla
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {answered.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-500 mb-4 border-b border-slate-100 pb-2">Önceki Yanıtlarınız</h3>
            <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
              {answered.map(q => (
                <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-700 text-sm">{q.studentName}</span>
                    <span className="text-xs text-slate-500">{q.createdAt?.toDate ? q.createdAt.toDate().toLocaleDateString('tr-TR') : ''}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">Soru: {q.question}</p>
                  <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 relative">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Yanıtınız:</span>
                    <p className="text-indigo-900 text-sm font-medium">{q.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {questions.length === 0 && (
          <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-3xl">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-slate-700">Gelen Kutunuz Boş</h3>
            <p className="text-slate-500 text-sm mt-2">Öğrencilerden henüz bir soru almadınız.</p>
          </div>
        )}
      </div>
    </div>
  )
}
