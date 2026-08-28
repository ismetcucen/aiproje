import { useState, useEffect } from 'react'
import { askQuestion, getQnaByStudent, createNotification } from '../../firebase/schema'
import { useAuth } from '../../hooks/useAuth'

export default function StudentQnaWidget({ teacherId }) {
  const { user, profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [qnaHistory, setQnaHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      loadHistory()
    }
  }, [user, isOpen])

  async function loadHistory() {
    setLoading(true)
    const data = await getQnaByStudent(user.uid)
    setQnaHistory(data)
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!questionText.trim()) return
    
    // Fallback teacherId if not provided (assume school admin or a generic teacher)
    // Normally, the teacherId should be passed from the active assignment or class
    await askQuestion({
      studentId: user.uid,
      teacherId: teacherId || 'default_teacher', // In a real app, query the teacher of the class
      question: questionText,
      studentName: profile.fullName
    })
    
    if (teacherId) {
      await createNotification(teacherId, {
        title: "Yeni Soru Geldi",
        message: `${profile.fullName} sana bir soru sordu.`,
        type: "system"
      })
    }

    setQuestionText('')
    loadHistory()
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-80 md:w-96 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center shadow-md z-10 relative">
            <div className="flex items-center gap-3">
              <div className="text-2xl bg-white/20 p-2 rounded-xl">👨‍🏫</div>
              <div>
                <h3 className="font-bold">Öğretmene Sor</h3>
                <p className="text-xs text-indigo-100">Takıldığın yeri sorabilirsin</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors">
              ✕
            </button>
          </div>
          
          <div className="flex-1 bg-slate-50 p-4 overflow-y-auto custom-scrollbar flex flex-col-reverse gap-4">
            {loading ? (
              <div className="text-center text-slate-400 text-sm py-4">Yükleniyor...</div>
            ) : qnaHistory.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-10 flex flex-col items-center gap-2">
                <span className="text-4xl">👋</span>
                <p>Merhaba! Anlamadığın bir yer varsa veya projende yardıma ihtiyacın varsa çekinmeden sorabilirsin.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {qnaHistory.slice().reverse().map(q => (
                  <div key={q.id} className="flex flex-col gap-2">
                    <div className="self-end bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%] shadow-sm text-sm">
                      {q.question}
                    </div>
                    {q.isAnswered ? (
                      <div className="self-start bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%] shadow-sm text-sm">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Öğretmen Yanıtı:</span>
                        {q.answer}
                      </div>
                    ) : (
                      <div className="self-start text-[10px] text-slate-400 italic px-2">
                        Öğretmen yanıtı bekleniyor...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input 
                type="text" 
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder="Bir mesaj yaz..." 
                className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl px-4 py-2 text-sm transition-colors outline-none"
              />
              <button type="submit" disabled={!questionText.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 w-10 h-10 flex items-center justify-center rounded-xl transition-colors">
                ➤
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform hover:shadow-indigo-500/50 relative group"
        >
          <span className="text-2xl">💬</span>
          <span className="absolute -top-10 right-0 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Soru Sor
          </span>
        </button>
      )}
    </div>
  )
}
