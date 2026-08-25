import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getSubmissionsBySchool, getAssignmentsByTeacher, getStudentsBySchool, upsertFeedback } from '../../firebase/schema'

const CONTENT_TYPE_LABELS = {
  text: 'Metin', code: 'Kod', project: 'Proje', presentation: 'Sunum',
}

export default function SubmissionsList() {
  const { user, profile } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [assignments, setAssignments] = useState({})
  const [students,    setStudents]    = useState({})
  const [loading,     setLoading]     = useState(true)
  const [selected,    setSelected]    = useState(null)
  const [filterAssignment, setFilterAssignment] = useState('all')
  const [score,   setScore]   = useState('')
  const [comment, setComment] = useState('')
  const [isShowcase, setIsShowcase] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => { if (user) loadData() }, [user])

  async function loadData() {
    setLoading(true)
    try {
      const [subs, asgns, studs] = await Promise.all([
        getSubmissionsBySchool(profile.schoolCode),
        getAssignmentsByTeacher(user.uid),
        getStudentsBySchool(profile.schoolCode),
      ])
      setSubmissions(subs)
      const amap = {}
      asgns.forEach(a => { amap[a.id] = a })
      setAssignments(amap)
      const smap = {}
      studs.forEach(s => { smap[s.id] = s })
      setStudents(smap)
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
  const filtered = submissions.filter(s =>
    filterAssignment === 'all' || s.assignmentId === filterAssignment
  )

  if (loading) return <div className="text-center py-20 text-slate-400">Yukleniyor...</div>

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">Uretimler</h2>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} teslim</p>
        </div>
        <button onClick={loadData} className="text-slate-400 hover:text-white text-sm">Yenile</button>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        <button onClick={() => setFilterAssignment('all')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            filterAssignment === 'all' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 border' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200'
          }`}>Tümü</button>
        {assignmentList.map(a => (
          <button key={a.id} onClick={() => setFilterAssignment(a.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              filterAssignment === a.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 border' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200'
            }`}>{a.title}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 border border-slate-800/50 border-dashed rounded-3xl">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-slate-300 font-bold mb-2">Henüz teslim yok</p>
              <p className="text-slate-500 text-sm">Öğrenciler görev teslim ettiğinde burada görünecek.</p>
            </div>
          ) : filtered.map(sub => {
            const student = students[sub.userId]
            return (
              <button key={sub.id} onClick={() => openSubmission(sub)}
                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 ${
                  selected?.id === sub.id
                    ? 'bg-indigo-900/30 border-indigo-500/50 shadow-lg shadow-indigo-900/20'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
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
                        <span className="text-slate-200 text-sm font-bold mr-2">
                          {student?.fullName || 'Bilinmeyen Öğrenci'}
                        </span>
                        <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                          {student?.gradeNumber ? `${student.gradeNumber}. SINIF` : ''}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm font-bold truncate ${selected?.id === sub.id ? 'text-indigo-300' : 'text-slate-400'}`}>{assignments[sub.assignmentId]?.title || 'Görev bulunamadı'}</p>
                    <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">{sub.content}</p>
                    <p className="text-slate-500 text-[10px] mt-2 font-medium uppercase tracking-wider">{sub.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {sub.score !== null && sub.score !== undefined ? (
                      <span className={`text-lg font-black ${sub.score >= 70 ? 'text-green-400' : sub.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {sub.score}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800 px-2 py-1 rounded-md">Puansız</span>
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
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-fit sticky top-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {students[selected.userId]?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-white text-xl font-bold">{students[selected.userId]?.fullName || 'Bilinmeyen Öğrenci'}</p>
                  <p className="text-slate-400 text-sm font-medium">{assignments[selected.assignmentId]?.title || ''}</p>
                </div>
              </div>
              <div className="flex gap-2 mb-6 relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg">
                  {CONTENT_TYPE_LABELS[selected.contentType] || selected.contentType}
                </span>
                {selected.aiUsed && (
                  <span className="text-xs font-bold uppercase tracking-wider bg-cyan-900/40 text-cyan-400 border border-cyan-800/50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    🤖 AI Destekli
                  </span>
                )}
              </div>
              <div className="bg-slate-950/50 border border-slate-700/50 rounded-2xl p-6 max-h-64 overflow-y-auto custom-scrollbar relative z-10 mb-8">
                <p className="text-slate-200 text-base whitespace-pre-wrap leading-relaxed">{selected.content}</p>
                {selected.files && selected.files.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                    {selected.files.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="bg-indigo-900/30 border border-indigo-800/50 hover:bg-indigo-900/50 text-sm px-4 py-2 rounded-xl text-indigo-300 transition-colors font-medium">
                        📎 {f.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-slate-800/50 pt-8 space-y-6 relative z-10">
              <h4 className="text-white text-lg font-bold">Geri Bildirim & Değerlendirme</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Puan (0-100)</label>
                  <input type="number" min={0} max={100} value={score} onChange={e => setScore(e.target.value)}
                    placeholder="100"
                    className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-lg rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-center" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Öğretmen Yorumu</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Harika bir tasarım olmuş, tebrikler!" rows={3}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar transition-all" />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl">
                <input type="checkbox" id="showcase" checked={isShowcase} onChange={e => setIsShowcase(e.target.checked)} className="w-5 h-5 rounded border-indigo-500 text-indigo-600 focus:ring-indigo-500 bg-slate-950" />
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
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center flex flex-col items-center justify-center h-full min-h-[500px]">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-4xl">📝</div>
            <p className="text-slate-400 text-lg font-medium">Değerlendirmek için sol taraftan bir teslim seçin.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
