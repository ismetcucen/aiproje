import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { setLiveSession, listenToLiveSession, listenToLiveAnswers, saveLiveQuestion, getLiveQuestionsHistory } from '../../firebase/schema'
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'
const GRADES = ['3', '4', '5', '6', '7', '9', '10'] // using GRADES from schema or just array

export default function LiveClassControl() {
  const { profile } = useAuth()
  const [selectedGrade, setSelectedGrade] = useState(GRADES?.[0] || '9')
  const [session, setSession] = useState(null)
  const [answers, setAnswers] = useState([])
  const [students, setStudents] = useState([])
  const [studentStatuses, setStudentStatuses] = useState({})
  
  // Şube Seçimi & Filtresi
  const [availableSections, setAvailableSections] = useState(['A', 'B'])
  const [selectedSections, setSelectedSections] = useState(['ALL'])
  const [sectionFilter, setSectionFilter] = useState('ALL')

  const [questionText, setQuestionText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [requireAnswer, setRequireAnswer] = useState(true)
  const [loading, setLoading] = useState(false)
  const [questionType, setQuestionType] = useState('text')
  const [pollOptions, setPollOptions] = useState(['', '', '', ''])

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyQuestions, setHistoryQuestions] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    setSelectedSections(['ALL'])
    setSectionFilter('ALL')
  }, [selectedGrade])

  useEffect(() => {
    if (!profile?.schoolCode) return
    const q = query(
      collection(db, 'student_status'),
      where('schoolCode', '==', profile.schoolCode)
    )
    const unsub = onSnapshot(q, (snap) => {
      const statuses = {}
      snap.forEach(doc => {
        const data = doc.data()
        if (String(data.gradeNumber) === String(selectedGrade)) {
          statuses[doc.id] = data.status
        }
      })
      setStudentStatuses(statuses)
    })
    return () => unsub()
  }, [profile?.schoolCode, selectedGrade])

  useEffect(() => {
    if (!profile?.schoolCode) return
    async function loadStudents() {
      try {
        const [usersSnap, classesSnap, csSnap] = await Promise.all([
          getDocs(query(
            collection(db, 'users'),
            where('role', '==', 'student'),
            where('schoolCode', '==', profile.schoolCode)
          )),
          getDocs(query(
            collection(db, 'classes'),
            where('schoolCode', '==', profile.schoolCode),
            where('grade', '==', String(selectedGrade))
          )),
          getDocs(collection(db, 'class_students'))
        ])

        // Mevcut şubeleri belirle
        const classDocs = classesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        const secs = [...new Set(classDocs.map(c => c.section).filter(Boolean))].sort()
        setAvailableSections(secs.length > 0 ? secs : ['A', 'B'])

        // Öğrenci - Sınıf eşleme haritası
        const classMap = {}
        classDocs.forEach(c => { classMap[c.id] = c })
        const userClassMap = {}
        csSnap.docs.forEach(d => {
          const dData = d.data()
          userClassMap[dData.userId] = dData.classId
        })

        const allStudents = usersSnap.docs.map(d => {
          const data = d.data()
          const cId = userClassMap[d.id]
          const assignedClass = cId ? classMap[cId] : null
          const section = data.section || assignedClass?.section || ''
          return { id: d.id, ...data, section }
        })

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

  function toggleSection(sec) {
    if (sec === 'ALL') {
      setSelectedSections(['ALL'])
      return
    }
    let current = selectedSections.filter(s => s !== 'ALL')
    if (current.includes(sec)) {
      current = current.filter(s => s !== sec)
      if (current.length === 0) current = ['ALL']
    } else {
      current.push(sec)
    }
    setSelectedSections(current)
  }

  async function toggleSession() {
    if (!profile?.schoolCode) return
    setLoading(true)
    const isActive = !session?.isActive
    await setLiveSession(profile.schoolCode, selectedGrade, {
      isActive,
      currentSlide: '',
      currentQuestion: '',
      questionId: '',
      requireAnswer: false,
      targetSections: []
    })
    setQuestionText('')
    setImageUrl('')
    setLoading(false)
  }

  async function handleSendQuestion() {
    if (!questionText && !imageUrl) return alert('Lütfen bir soru yazın veya görsel ekleyin.')
    setLoading(true)
    const qId = Date.now().toString()
    const targetSections = selectedSections.includes('ALL') ? [] : selectedSections
    const payload = {
      currentQuestion: questionText,
      currentSlide: imageUrl,
      questionId: qId,
      requireAnswer: requireAnswer,
      type: questionType,
      targetSections: targetSections
    }
    if (questionType === 'poll') {
      const validOptions = pollOptions.filter(o => o.trim() !== '')
      if (validOptions.length < 2) {
        setLoading(false)
        return alert('Lütfen en az 2 anket seçeneği girin.')
      }
      payload.options = validOptions
    }
    await setLiveSession(profile.schoolCode, selectedGrade, payload)
    await saveLiveQuestion(profile.schoolCode, selectedGrade, {
      questionId: qId,
      questionText,
      imageUrl,
      type: questionType,
      options: payload.options || [],
      targetSections,
      requireAnswer
    })
    setQuestionText('')
    setLoading(false)
    const targetMsg = targetSections.length > 0 ? `Seçilen şubelere (${targetSections.join(', ')})` : 'Tüm şubelere'
    alert(`Soru ${targetMsg} başarıyla gönderildi! Öğrenci ekranları kilitlendi.`)
  }
  
  async function handleClearScreen() {
    setLoading(true)
    await setLiveSession(profile.schoolCode, selectedGrade, {
      currentQuestion: '',
      currentSlide: '',
      questionId: '',
      requireAnswer: false,
      targetSections: []
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
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2">
          <button 
            onClick={async () => {
              setShowHistoryModal(true);
              setHistoryLoading(true);
              const hist = await getLiveQuestionsHistory(profile.schoolCode, selectedGrade);
              setHistoryQuestions(hist);
              setHistoryLoading(false);
            }}
            className="px-3.5 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>📜</span> Soru Geçmişi
          </button>
          {GRADES.map(g => (
            <button key={g} onClick={() => setSelectedGrade(g)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedGrade === g ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'}`}>
              {g}. Sınıf
            </button>
          ))}
        </div>
      </div>

      
      {/* DERS KOKPİTİ BÖLÜMÜ */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 mb-8 shadow-2xl border border-slate-700 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-2xl md:text-3xl font-black tracking-wide flex items-center gap-3">
              {selectedGrade}. SINIF <span className="text-slate-500 font-light">|</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">DERS KOKPİTİ</span>
            </h3>
            <p className="text-slate-400 font-medium mt-2 flex items-center gap-3">
              <span className="bg-white/10 px-3 py-1 rounded-md text-sm shadow-sm flex items-center gap-1.5">
                <span className="text-base">👥</span> {students.length} Toplam Öğrenci
              </span>
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            {(() => {
              const activeCount = Object.values(studentStatuses).filter(s => s === 'active').length;
              const taskCount = Object.values(studentStatuses).filter(s => s === 'task').length;
              const helpCount = Object.values(studentStatuses).filter(s => s === 'help').length;
              
              return (
                <>
                  <div className="bg-slate-800/80 backdrop-blur border border-emerald-500/30 rounded-2xl px-5 py-3 flex flex-col items-center min-w-[100px] flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="text-emerald-400 text-3xl font-black">{activeCount}</span>
                    <span className="text-slate-300 text-xs font-bold uppercase mt-1 flex items-center gap-1"><span>🟢</span> Aktif</span>
                  </div>
                  <div className="bg-slate-800/80 backdrop-blur border border-amber-500/30 rounded-2xl px-5 py-3 flex flex-col items-center min-w-[100px] flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <span className="text-amber-400 text-3xl font-black">{taskCount}</span>
                    <span className="text-slate-300 text-xs font-bold uppercase mt-1 flex items-center gap-1"><span>🟡</span> Görevde</span>
                  </div>
                  <div className="bg-slate-800/80 backdrop-blur border border-rose-500/30 rounded-2xl px-5 py-3 flex flex-col items-center min-w-[100px] flex-shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                    <span className="text-rose-400 text-3xl font-black">{helpCount}</span>
                    <span className="text-slate-300 text-xs font-bold uppercase mt-1 flex items-center gap-1"><span>🔴</span> Yardım</span>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
        
        {/* Öğrenci İsim Listesi Mini Görünüm */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-700/50">
          <div className="flex flex-wrap gap-2">
            {students.map(stu => {
              const st = studentStatuses[stu.id];
              let dot = '⚪';
              let border = 'border-slate-700';
              if (st === 'active') { dot = '🟢'; border = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100'; }
              if (st === 'task') { dot = '🟡'; border = 'border-amber-500/50 bg-amber-500/10 text-amber-100'; }
              if (st === 'help') { dot = '🔴'; border = 'border-rose-500/50 bg-rose-500/10 text-rose-100'; }
              
              return (
                <div key={stu.id} className={`px-2.5 py-1 rounded-md border text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors ${border}`}>
                  <span className="text-[10px]">{dot}</span> 
                  {stu.fullName}
                  {stu.section && (
                    <span className="bg-white/10 text-[10px] px-1.5 py-0.5 rounded text-slate-300 font-bold ml-1">
                      {selectedGrade}/{stu.section}
                    </span>
                  )}
                </div>
              )
            })}
            {students.length === 0 && <span className="text-slate-500 text-xs italic">Bu sınıfa kayıtlı öğrenci bulunmuyor.</span>}
          </div>
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
                
                {/* ŞUBE SEÇİMİ (KİMLERE GÖNDERİLSİN?) */}
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-indigo-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎯</span> Hedef Şubeler
                    </label>
                    <span className="text-[11px] font-medium text-indigo-600">
                      {selectedSections.includes('ALL') 
                        ? 'Tüm Şubeler Seçili' 
                        : `${selectedSections.length} Şube Seçili`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSection('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedSections.includes('ALL')
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100/50'
                      }`}
                    >
                      🌟 Tüm Şubeler
                    </button>
                    {availableSections.map(sec => {
                      const isSelected = !selectedSections.includes('ALL') && selectedSections.includes(sec);
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => toggleSection(sec)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300'
                          }`}
                        >
                          {selectedGrade}/{sec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AKTIF SORU GÖSTERIMI */}
                {session.questionId && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-indigo-800 text-xs font-bold uppercase tracking-wider">Şu An Ekrandaki Soru:</h4>
                      {session.targetSections && session.targetSections.length > 0 ? (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Hedef: {session.targetSections.map(s => `${selectedGrade}/${s}`).join(', ')}
                        </span>
                      ) : (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Tüm Şubeler
                        </span>
                      )}
                    </div>
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
                      <div key={stu.id} title={hasAnswered ? 'Cevap Verdi' : 'Bekleniyor'} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${hasAnswered ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-500 border-red-200 animate-pulse'}`}>
                        <span>{hasAnswered ? '✓' : '⏳'}</span>
                        <span>{stu.fullName}</span>
                        {stu.section && <span className="opacity-75 text-[10px]">({selectedGrade}/{stu.section})</span>}
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
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">{ans.studentName}</span>
                            {ans.studentSection && (
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {selectedGrade}/{ans.studentSection}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{ans.answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                answers.map(ans => (
                  <div key={ans.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold text-indigo-600">{ans.studentName}</p>
                      {ans.studentSection && (
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {selectedGrade}/{ans.studentSection}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 font-medium">{ans.answer}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* SORU GEÇMİŞİ MODALI */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                  <span>📜</span> {selectedGrade}. Sınıf Canlı Soru Geçmişi
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Daha önce sınıfa gönderilen sorular ve şube hedefleri</p>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {historyLoading ? (
                <div className="py-12 text-center text-slate-400 font-medium">Yükleniyor...</div>
              ) : historyQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <span className="text-4xl block mb-2">📁</span>
                  <p className="font-bold">Henüz kaydedilmiş soru bulunmuyor.</p>
                </div>
              ) : (
                historyQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-lg">
                          {q.type === 'poll' ? '🔘 Anket' : '✍️ Açık Uçlu'}
                        </span>
                        {q.targetSections && q.targetSections.length > 0 ? (
                          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-lg">
                            Hedef: {q.targetSections.map(s => `${selectedGrade}/${s}`).join(', ')}
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-lg">
                            Tüm Şubeler
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {q.createdAt?.toDate ? q.createdAt.toDate().toLocaleString('tr-TR') : ''}
                      </span>
                    </div>

                    {q.imageUrl && (
                      <img src={q.imageUrl} alt="Slayt" className="max-h-36 rounded-xl object-contain mb-2 border border-slate-200 bg-white" />
                    )}

                    <p className="text-slate-800 font-bold text-sm">{q.questionText || '(Görsel soru)'}</p>

                    {q.type === 'poll' && q.options && q.options.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600 flex items-center gap-1.5">
                            <span className="font-bold text-indigo-600">{String.fromCharCode(65 + oIdx)}:</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
