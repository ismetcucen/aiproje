import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { setLiveSession, listenToLiveSession, listenToLiveAnswers } from '../../firebase/schema'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
const GRADES = ['3', '4', '5', '6', '7', '9', '10'] // using GRADES from schema or just array

export default function LiveClassControl() {
  const { profile } = useAuth()
  const [selectedGrade, setSelectedGrade] = useState(GRADES?.[0] || '9')
  const [session, setSession] = useState(null)
  const [answers, setAnswers] = useState([])
  const [students, setStudents] = useState([])
  
  const [questionText, setQuestionText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [requireAnswer, setRequireAnswer] = useState(true)
  const [loading, setLoading] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!profile?.schoolCode) return
    async function loadStudents() {
      try {
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          where('schoolCode', '==', profile.schoolCode)
        )
        const snap = await getDocs(q)
        const allStudents = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        const gradeStudents = allStudents.filter(s => String(s.gradeNumber) === String(selectedGrade))
        setStudents(gradeStudents)
      } catch (err) {
        console.error(err)
      }
    }
    loadStudents()
  }, [profile?.schoolCode, selectedGrade])


  useEffect(() => {
    if (!profile?.schoolCode) return
    const unsub = listenToLiveSession(profile.schoolCode, selectedGrade, (data) => {
      setSession(data)
    })
    return () => unsub()
  }, [profile?.schoolCode, selectedGrade])

  useEffect(() => {
    if (session?.isActive && session?.questionId) {
      const unsub = listenToLiveAnswers(session.id, session.questionId, (data) => {
        setAnswers(data.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)))
      })
      return () => unsub()
    } else {
      setAnswers([])
    }
  }, [session?.isActive, session?.questionId, session?.id])

  async function toggleSession() {
    if (!profile?.schoolCode) return
    setLoading(true)
    const isActive = !session?.isActive
    await setLiveSession(profile.schoolCode, selectedGrade, {
      isActive,
      currentSlide: '',
      currentQuestion: '',
      questionId: '',
      requireAnswer: false
    })
    setQuestionText('')
    setImageUrl('')
    setLoading(false)
  }

  async function handleSendQuestion() {
    if (!questionText && !imageUrl) return alert('Lütfen bir soru yazın veya görsel ekleyin.')
    setLoading(true)
    const qId = Date.now().toString()
    await setLiveSession(profile.schoolCode, selectedGrade, {
      currentQuestion: questionText,
      currentSlide: imageUrl,
      questionId: qId,
      requireAnswer: requireAnswer
    })
    setQuestionText('')
    setLoading(false)
    alert('Soru sınıfa başarıyla gönderildi! Öğrenci ekranları kilitlendi.')
  }
  
  async function handleClearScreen() {
    setLoading(true)
    await setLiveSession(profile.schoolCode, selectedGrade, {
      currentQuestion: '',
      currentSlide: '',
      questionId: '',
      requireAnswer: false
    })
    setImageUrl('')
    setLoading(false)
  }

  // Resim küçültme ve Base64
  function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1024
        const scaleSize = MAX_WIDTH / img.width
        canvas.width = MAX_WIDTH
        canvas.height = img.height * scaleSize
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6) // %60 kalite
        setImageUrl(compressedBase64)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const sessionId = `${profile?.schoolCode}_${selectedGrade}`

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h2 className="text-slate-800 text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
            <span>📡</span> Canlı Sınıf Kumandası
          </h2>
          <p className="text-slate-500 text-sm">Öğrencilerin ekranlarına anlık soru ve görsel gönderin, cevapları toplayın.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          {GRADES.map(g => (
            <button key={g} onClick={() => setSelectedGrade(g)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedGrade === g ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'}`}>
              {g}. Sınıf
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SOL KUMANDA PANELI */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Yayın Durumu</h3>
                <p className="text-xs text-slate-500">Şu anki hedef: {selectedGrade}. Sınıflar</p>
              </div>
              <button onClick={toggleSession} disabled={loading}
                className={`px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${session?.isActive ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-600'}`}>
                {session?.isActive ? 'YAYINI DURDUR' : 'YAYINI BAŞLAT'}
              </button>
            </div>

            {session?.isActive ? (
              <div className="space-y-5 animate-fade-in">
                
                
                {/* AKTIF SORU GÖSTERIMI */}
                {session.questionId && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-4">
                    <h4 className="text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">Şu An Öğrencilerin Ekranındaki Soru:</h4>
                    {session.currentSlide && <img src={session.currentSlide} className="max-h-24 rounded-lg mb-2 border border-indigo-200" />}
                    <p className="text-indigo-900 font-medium">{session.currentQuestion || '(Sadece Görsel)'}</p>
                  </div>
                )}
                
                {/* Görsel Yükle */}

                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Görsel / Slayt Ekle</label>
                  {imageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 mb-3 group">
                      <img src={imageUrl} alt="Slide Preview" className="w-full h-auto max-h-48 object-contain" />
                      <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                      <button onClick={() => fileInputRef.current?.click()} className="text-indigo-600 font-bold text-sm">
                        + Fotoğraf Yükle (Max 1MB)
                      </button>
                    </div>
                  )}
                </div>

                {/* Soru Tipi ve Soru */}
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={questionType === 'text'} onChange={() => setQuestionType('text')} className="accent-indigo-600" />
                    <span className="text-sm font-bold text-slate-700">Açık Uçlu Soru</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={questionType === 'poll'} onChange={() => setQuestionType('poll')} className="accent-indigo-600" />
                    <span className="text-sm font-bold text-slate-700">Canlı Anket (Çoktan Seçmeli)</span>
                  </label>
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Soru Metni</label>
                  <textarea 
                    value={questionText} 
                    onChange={e => setQuestionText(e.target.value)}
                    placeholder="Öğrencilere ne sormak istiyorsunuz?"
                    className="w-full border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none h-24"
                  />
                </div>
                
                {questionType === 'poll' && (
                  <div className="space-y-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <label className="block text-indigo-700 text-xs font-bold uppercase tracking-wider">Anket Seçenekleri</label>
                    <div className="grid grid-cols-2 gap-3">
                      {pollOptions.map((opt, idx) => (
                        <input key={idx} type="text" value={opt} onChange={e => {
                          const newOpts = [...pollOptions];
                          newOpts[idx] = e.target.value;
                          setPollOptions(newOpts);
                        }} placeholder={`${String.fromCharCode(65 + idx)} Şıkkı`} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                  <input type="checkbox" id="req" checked={requireAnswer} onChange={e => setRequireAnswer(e.target.checked)} className="w-5 h-5 accent-red-600" />
                  <label htmlFor="req" className="text-sm font-bold text-red-700 cursor-pointer">Cevaplamak Zorunlu Olsun (Ekranı Kilitler)</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={handleClearScreen} disabled={loading} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Tahtayı Temizle
                  </button>
                  <button onClick={handleSendQuestion} disabled={loading} className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors">
                    Soruyu Öğrencilere Gönder
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-4xl mb-3 block">😴</span>
                <p className="text-slate-500 font-medium text-sm">Yayın kapalı. Öğrencilere soru göndermek için yayını başlatın.</p>
              </div>
            )}
          </div>
        </div>

        {/* SAĞ CEVAP PANELI */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <span>💬</span> Canlı Yanıtlar
              </h3>
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                {answers.length} Yanıt
              </div>
            </div>

            
            {/* OGRENCI TAKIP TABLOSU */}
            {session?.isActive && session?.questionId && students.length > 0 && (
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Sınıf Katılım Durumu</h4>
                <div className="flex flex-wrap gap-2">
                  {students.map(stu => {
                    const hasAnswered = answers.some(a => a.studentId === stu.id);
                    return (
                      <div key={stu.id} title={hasAnswered ? 'Cevap Verdi' : 'Bekleniyor'} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${hasAnswered ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-500 border-red-200 animate-pulse'}`}>
                        {hasAnswered ? '✓' : '⏳'} {stu.fullName}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-4 overflow-y-auto max-h-[600px] custom-scrollbar space-y-3">
              {answers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <p>Henüz yanıt yok...</p>
                  <p className="text-xs mt-1">Öğrencilerin gönderdiği cevaplar anında burada belirecek.</p>
                </div>
              ) : session?.type === 'poll' ? (
                <div className="space-y-4">
                  {(() => {
                    const total = answers.length;
                    const counts = {};
                    session.options.forEach(opt => counts[opt] = 0);
                    answers.forEach(ans => {
                      if (counts[ans.answer] !== undefined) counts[ans.answer]++;
                      else counts[ans.answer] = 1;
                    });
                    
                    return session.options.map((opt, idx) => {
                      const count = counts[opt] || 0;
                      const percent = Math.round((count / total) * 100);
                      return (
                        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <div className="flex justify-between items-end mb-2">
                            <span className="font-bold text-slate-700">{opt}</span>
                            <span className="text-sm font-bold text-indigo-600">{count} Oy (%{percent})</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      )
                    });
                  })()}
                  
                  <div className="mt-8 pt-4 border-t border-slate-200">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Kim Ne Dedi?</h5>
                    <div className="space-y-2">
                      {answers.map(ans => (
                        <div key={ans.id} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-100">
                          <span className="text-sm font-medium text-slate-600">{ans.studentName}</span>
                          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{ans.answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                answers.map(ans => (
                  <div key={ans.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-fade-in-up">
                    <p className="text-xs font-bold text-indigo-600 mb-1">{ans.studentName}</p>
                    <p className="text-slate-700 font-medium">{ans.answer}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
