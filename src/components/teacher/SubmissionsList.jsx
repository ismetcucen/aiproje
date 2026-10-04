import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import * as XLSX from 'xlsx'
import { getSubmissionsBySchool, getAssignmentsByTeacher, getAssignmentsBySchool, getStudentsBySchool, getClassesBySchool, upsertFeedback, createNotification, getAllClassStudents } from '../../firebase/schema'

const CONTENT_TYPE_LABELS = {
  text: 'Metin', code: 'Kod', project: 'Proje', presentation: 'Sunum',
}

export default function SubmissionsList() {
  const { user, profile } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [assignments, setAssignments] = useState({})
  const [students,    setStudents]    = useState({})
  const [classesList, setClassesList] = useState([])
  const [studentClassMap, setStudentClassMap] = useState({})
  const [loading,     setLoading]     = useState(true)
  const [selected,    setSelected]    = useState(null)
  const [filterAssignment, setFilterAssignment] = useState('all')
  const [filterClass,      setFilterClass]      = useState('all')
  const [filterStudent,    setFilterStudent]    = useState('all')
  const [score,   setScore]   = useState('')
  const [comment, setComment] = useState('')
  const [isShowcase, setIsShowcase] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => { if (user) loadData() }, [user])

  
  function exportToExcel() {
    const dataToExport = filtered.map(s => {
      const student = students[s.studentId] || students[s.userId] || {}
      const assignment = assignments[s.assignmentId] || {}
      return {
        'Öğrenci Adı': student.fullName || 'Bilinmiyor',
        'Sınıf': student.gradeNumber || student.classLevel || 'Bilinmiyor',
        'Görev Başlığı': assignment.title || 'Bilinmiyor',
        'İçerik Türü': CONTENT_TYPE_LABELS[s.contentType] || s.contentType,
        'Gönderim Tarihi': s.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || '',
        'Durum': s.feedback ? 'Değerlendirildi' : 'Bekliyor',
        'Puan': s.score !== undefined ? s.score : '',
        'Öğretmen Yorumu': s.feedback?.comment || s.teacherFeedback || ''
      }
    })

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Notlar")
    XLSX.writeFile(wb, "Ogrenci_Not_Listesi.xlsx")
  }

  async function loadData() {
    setLoading(true)
    try {
      const [subs, asgns, studs, cls, csMap] = await Promise.all([
        getSubmissionsBySchool(profile.schoolCode),
        profile.role === 'admin' ? getAssignmentsBySchool(profile.schoolCode) : getAssignmentsByTeacher(user.uid),
        getStudentsBySchool(profile.schoolCode),
        getClassesBySchool(profile.schoolCode),
        getAllClassStudents()
      ])
      setSubmissions(subs)
      const amap = {}
      asgns.forEach(a => { amap[a.id] = a })
      setAssignments(amap)
      const smap = {}
      studs.forEach(s => { smap[s.id] = s })
      setStudents(smap)
      setClassesList(cls || [])

      const csMapping = {}
      csMap.forEach(m => {
        csMapping[m.userId] = m.classId
      })
      setStudentClassMap(csMapping)
      
      console.log("Admin Submissions Loaded:", subs.length, "Assignments:", asgns.length, "Students:", studs.length)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openSubmission(sub) {
    setSelected(sub)
    setScore(sub.score !== null && sub.score !== undefined ? String(sub.score) : '')
    setComment(sub.feedback || '')
    setIsShowcase(sub.isShowcase || false)
    setSaved(false)
  }

  async function handleFeedback() {
    if (!selected) return
    if (score === '' || isNaN(Number(score)) || Number(score) < 0 || Number(score) > 100) {
      alert('0-100 arasi bir puan girin.')
      return
    }
    setSaving(true)
    try {
      await upsertFeedback({ submissionId: selected.id, teacherId: user.uid, comment: comment.trim(), score: Number(score), isShowcase })
      setSaved(true)
      await loadData()
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const assignmentList = Object.values(assignments)
  const filtered = submissions.filter(s => {
    const studentClassId = studentClassMap[s.userId] || studentClassMap[s.studentId]
    const matchAssignment = filterAssignment === 'all' || s.assignmentId === filterAssignment
    const matchStudent = filterStudent === 'all' || s.userId === filterStudent || s.studentId === filterStudent
    const matchClass = filterClass === 'all' || studentClassId === filterClass
    return matchAssignment && matchStudent && matchClass
  })

  if (loading) return <div className="text-center py-20 text-slate-500">Yukleniyor...</div>

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-slate-800 text-xl font-semibold">Uretimler</h2>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} teslim</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={exportToExcel} className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold transition-all border border-emerald-200 flex items-center gap-2">
            <span>📊</span> Excel İndir
          </button>
          <button onClick={loadData} className="px-4 py-2 bg-slate-50 hover:bg-slate-700 text-slate-700 hover:text-white rounded-xl text-sm font-bold transition-all border border-slate-200">
            Yenile
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        {/* Sınıf Filtresi */}
        <div className="flex gap-2 flex-wrap items-center bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <span className="text-slate-500 font-medium text-sm px-3">Sınıf:</span>
          <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setFilterStudent('all'); }}
            className="flex-1 max-w-xs px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer">
            <option value="all">Tüm Sınıflar</option>
            {classesList.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Ogrenci Filtresi */}
        <div className="flex gap-2 flex-wrap items-center bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <span className="text-slate-500 font-medium text-sm px-3">Öğrenci:</span>
          <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)}
            className="flex-1 max-w-xs px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer">
            <option value="all">Tüm Öğrenciler</option>
            {Object.values(students)
              .filter(st => filterClass === 'all' || studentClassMap[st.id] === filterClass)
              .sort((a,b) => (a.fullName||'').localeCompare(b.fullName||''))
              .map(st => (
                <option key={st.id} value={st.id}>{st.fullName || st.email || 'Bilinmeyen Öğrenci'}</option>
            ))}
          </select>
        </div>

        {/* Gorev Filtresi */}
        <div className="flex gap-2 flex-wrap items-center bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <span className="text-slate-500 font-medium text-sm px-3">Görevler:</span>
          <button onClick={() => setFilterAssignment('all')}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
              filterAssignment === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
            }`}>Tüm Görevler</button>
          {assignmentList.map(a => (
            <button key={a.id} onClick={() => setFilterAssignment(a.id)}
              className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
                filterAssignment === a.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
              }`}>{a.title}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200/50 border-dashed rounded-3xl">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-slate-700 font-bold mb-2">Henüz teslim yok</p>
              <p className="text-slate-500 text-sm">Öğrenciler görev teslim ettiğinde burada görünecek.</p>
            </div>
          ) : filtered.map(sub => {
            const student = students[sub.userId]
            return (
              <button key={sub.id} onClick={() => openSubmission(sub)}
                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 ${
                  selected?.id === sub.id
                    ? 'bg-indigo-900/30 border-indigo-500/50 shadow-lg shadow-indigo-900/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-200'
                }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {student?.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="truncate">
                        <span className="text-slate-800 text-sm font-bold mr-2">
                          {student?.fullName || 'Bilinmeyen Öğrenci'}
                        </span>
                        <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                          {student?.gradeNumber ? `${student.gradeNumber}. SINIF` : ''}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm font-bold truncate ${selected?.id === sub.id ? 'text-indigo-300' : 'text-slate-500'}`}>{assignments[sub.assignmentId]?.title || 'Görev bulunamadı'}</p>
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">{sub.content}</p>
                    <p className="text-slate-500 text-[10px] mt-2 font-medium uppercase tracking-wider">{sub.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {sub.score !== null && sub.score !== undefined ? (
                      <span className={`text-lg font-black ${sub.score >= 70 ? 'text-green-400' : sub.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {sub.score}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-1 rounded-md">Puansız</span>
                    )}
                    {sub.aiUsed && <span className="text-[10px] font-bold bg-cyan-900/40 text-cyan-400 border border-cyan-800/50 px-2 py-1 rounded-md">AI DESTEKLİ</span>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="lg:col-span-7">
        {selected ? (
          <div className="bg-white backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-fit sticky top-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {students[selected.userId]?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 text-xl font-bold">{students[selected.userId]?.fullName || 'Bilinmeyen Öğrenci'}</p>
                  <p className="text-slate-500 text-sm font-medium">{assignments[selected.assignmentId]?.title || ''}</p>
                </div>
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/portfolio/${selected.userId}`;
                    navigator.clipboard.writeText(link);
                    alert('Veli linki kopyalandı!\n' + link);
                  }}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-indigo-200 flex items-center gap-2"
                  title="Veli Portfolyo Linkini Kopyala"
                >
                  🔗 Veli Linki
                </button>
              </div>
              <div className="flex gap-2 mb-6 relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg">
                  {CONTENT_TYPE_LABELS[selected.contentType] || selected.contentType}
                </span>
                {selected.aiUsed && (
                  <span className="text-xs font-bold uppercase tracking-wider bg-cyan-900/40 text-cyan-400 border border-cyan-800/50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    🤖 AI Destekli
                  </span>
                )}
              </div>
              <div className="bg-white border border-slate-200/50 rounded-2xl p-6 max-h-64 overflow-y-auto custom-scrollbar relative z-10 mb-8">
                <p className="text-slate-800 text-base whitespace-pre-wrap leading-relaxed">
                  {typeof selected.content === 'string' && selected.content.trim() !== ''
                    ? selected.content.split(/(\s+)/).map((word, index) => 
                        word.match(/^https?:\/\/[^\s]+$/) 
                          ? <a key={index} href={word} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">{word}</a>
                          : word
                      ) 
                    : (selected.content || <span className="text-slate-400 italic">Öğrenci yazılı bir cevap girmemiş.</span>)}
                </p>
                {selected.files && selected.files.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-2">
                    {selected.files.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="bg-indigo-900/30 border border-indigo-800/50 hover:bg-indigo-900/50 text-sm px-4 py-2 rounded-xl text-indigo-300 transition-colors font-medium">
                        📎 {f.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-slate-200/50 pt-8 space-y-6 relative z-10">
              <h4 className="text-slate-800 text-lg font-bold">Geri Bildirim & Değerlendirme</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Puan (0-100)</label>
                  <input type="number" min={0} max={100} value={score} onChange={e => setScore(e.target.value)}
                    placeholder="100"
                    className="w-full bg-white shadow-sm border border-slate-200 text-slate-800 font-bold text-lg rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-center" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Öğretmen Yorumu</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Harika bir tasarım olmuş, tebrikler!" rows={3}
                    className="w-full bg-white shadow-sm border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar transition-all" />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl">
                <input type="checkbox" id="showcase" checked={isShowcase} onChange={e => setIsShowcase(e.target.checked)} className="w-5 h-5 rounded border-indigo-500 text-indigo-600 focus:ring-indigo-500 bg-white shadow-sm" />
                <label htmlFor="showcase" className="text-indigo-200 text-sm font-bold cursor-pointer">Vitrinde Sergile (Tüm sınıf ve okul panosunda görsün)</label>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button onClick={handleFeedback} disabled={saving}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/50 flex-1">
                  {saving ? 'Değerlendirme Kaydediliyor...' : 'Değerlendirmeyi Kaydet'}
                </button>
                {saved && <span className="text-emerald-400 text-sm font-bold bg-emerald-900/30 px-4 py-3.5 rounded-xl border border-emerald-800/50">✅ Kaydedildi!</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center h-full min-h-[500px]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-4xl">📝</div>
            <p className="text-slate-500 text-lg font-medium">Değerlendirmek için sol taraftan bir teslim seçin.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
