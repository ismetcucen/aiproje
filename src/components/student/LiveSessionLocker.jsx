import { useState, useEffect } from 'react'
import { listenToLiveSession, submitLiveAnswer } from '../../firebase/schema'
import { useAuth } from '../../hooks/useAuth'

export default function LiveSessionLocker() {
  const { user, profile } = useAuth()
  const [session, setSession] = useState(null)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('answeredLiveQuestions')) || {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    if (!profile?.schoolCode || !profile?.gradeNumber) return
    const unsub = listenToLiveSession(profile.schoolCode, profile.gradeNumber, (data) => {
      setSession(data)
    })
    return () => unsub()
  }, [profile?.schoolCode, profile?.gradeNumber])

  if (!session || !session.isActive) return null
  
  // Soru yoksa kilitlenme
  if (!session.questionId && !session.currentSlide) return null

  // Soru varsa, kilitli mi?
  const isAnswered = answeredQuestions[session.questionId]
  const isLocked = session.requireAnswer && session.questionId && !isAnswered

  // Eger kilitli degilse ama hala aktif slayt varsa, kucuk bir yuzen widget veya baska bir sekme gosterilebilir.
  // Mimaride zorunlu dediginiz icin, kilitli oldugu senaryoyu render ediyoruz.
  if (!isLocked) return null

  async function handleSubmit() {
    if (!answer.trim()) return
    setSubmitting(true)
    try {
      await submitLiveAnswer(session.id, session.questionId, user.uid, profile.fullName, answer)
      const updated = { ...answeredQuestions, [session.questionId]: true }
      setAnsweredQuestions(updated)
      localStorage.setItem('answeredLiveQuestions', JSON.stringify(updated))
      setAnswer('')
    } catch(err) {
      alert('Cevap gönderilirken hata oluştu.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-full">
        
        {/* Ust Baslik */}
        <div className="bg-red-500 text-white p-4 text-center font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          ÖĞRETMEN DİKKATİNİZİ İSTİYOR
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center custom-scrollbar">
          
          {session.currentSlide && (
            <div className="mb-8 w-full flex justify-center">
              <img src={session.currentSlide} alt="Slayt" className="max-w-full rounded-2xl shadow-md border border-slate-200 object-contain max-h-[40vh]" />
            </div>
          )}

          {session.currentQuestion && (
            <div className="w-full text-center mb-8">
              <h2 className="text-2xl md:text-4xl font-black text-slate-800 leading-tight">
                {session.currentQuestion}
              </h2>
            </div>
          )}

          <div className="w-full max-w-2xl bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Cevabınız</label>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Cevabınızı buraya yazın..."
              className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-lg focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 resize-none h-32 mb-4 transition-all"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-black text-lg py-4 rounded-2xl transition-colors shadow-lg shadow-red-500/30"
            >
              {submitting ? 'Gönderiliyor...' : 'Cevabı Gönder ve Ekrana Dön'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
