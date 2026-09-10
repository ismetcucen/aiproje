import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getStudentsBySchool, getSubmissionsBySchool } from '../../firebase/schema'
import { exportStudentCredentials } from '../../utils/exportCredentials'


const CLASS_LEVEL_LABELS = {
  ilkokul:  'İlkokul',
  ortaokul: 'Ortaokul',
  lise:     'Lise',
}

export default function StudentList() {
  const { profile } = useAuth()
  const [students,    setStudents]    = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filterLevel, setFilterLevel] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [s, sub] = await Promise.all([
        getStudentsBySchool(profile.schoolCode),
        getSubmissionsBySchool(profile.schoolCode),
      ])
      setStudents(s)
      setSubmissions(sub)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function submissionCount(studentId) {
    return submissions.filter(s => s.userId === studentId).length
  }

  function lastSubmission(studentId) {
    const subs = submissions
      .filter(s => s.userId === studentId)
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
    if (!subs.length) return null
    return subs[0].createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || null
  }

  const filtered = students
    .filter(s => filterLevel === 'all' || s.classLevel === filterLevel)
    .filter(s => s.fullName?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-4xl">

      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-slate-800 text-xl font-semibold">Öğrenciler</h2>
          <p className="text-slate-500 text-sm mt-0.5">{students.length} kayıtlı öğrenci</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => exportStudentCredentials(filteredStudents, 'Öğrenciler')}
            className="text-emerald-500 hover:text-emerald-600 font-semibold text-sm transition-colors flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200"
          >
            <span>📄</span> Şifreleri İndir
          </button>
          <button
            onClick={loadData}
            className="text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors flex items-center gap-1.5 bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Öğrenci ara..."
          className="flex-1 bg-white shadow-sm border border-slate-200 text-white rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <div className="flex gap-2">
          {['all', 'ilkokul', 'ortaokul', 'lise'].map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                filterLevel === level
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white shadow-sm border-slate-200 text-slate-500 hover:border-slate-600'
              }`}
            >
              {level === 'all' ? 'Tümü' : CLASS_LEVEL_LABELS[level]}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">👨‍🎓</p>
          <p className="text-slate-700 font-medium mb-2">Öğrenci bulunamadı</p>
          <p className="text-slate-500 text-sm">
            {search ? 'Arama kriterini değiştirin.' : 'Henüz kayıtlı öğrenci yok.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Tablo başlığı */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-slate-500 font-medium uppercase tracking-wide">
            <div className="col-span-3">Ad Soyad</div>
            <div className="col-span-2">Seviye</div>
            <div className="col-span-1">Sınıf</div>
            <div className="col-span-2 text-center">Üretim</div>
            <div className="col-span-2">Son Teslim</div>
            <div className="col-span-2 text-right">Veli Linki</div>
          </div>

          {filtered.map(student => {
            const count = submissionCount(student.id)
            const last  = lastSubmission(student.id)
            return (
              <div
                key={student.id}
                className="grid grid-cols-12 gap-4 items-center bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-3.5 hover:border-slate-200 transition-colors"
              >
                {/* İsim */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-300 text-xs font-semibold">
                      {student.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium truncate">{student.fullName}</span>
                </div>

                {/* Seviye */}
                <div className="col-span-2">
                  <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-md">
                    {CLASS_LEVEL_LABELS[student.classLevel] || '-'}
                  </span>
                </div>

                {/* Sınıf numarası */}
                <div className="col-span-1 text-slate-500 text-sm">
                  {student.gradeNumber ? `${student.gradeNumber}. sınıf` : '-'}
                </div>

                {/* Üretim sayısı */}
                <div className="col-span-2 text-center">
                  <span className={`text-sm font-semibold ${count > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                    {count}
                  </span>
                </div>

                {/* Son teslim */}
                <div className="col-span-2 text-slate-500 text-xs">
                  {last || '—'}
                </div>
                
                {/* Veli Linki */}
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => {
                      const link = window.location.origin + '/p/' + student.id;
                      navigator.clipboard.writeText(link);
                      alert('Veli linki kopyalandı!\n' + link);
                    }}
                    className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    🔗 Kopyala
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Özet */}
      {!loading && students.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Toplam Öğrenci', value: students.length, color: 'text-white' },
            { label: 'Üretim Yapan',   value: students.filter(s => submissionCount(s.id) > 0).length, color: 'text-green-400' },
            { label: 'Toplam Üretim',  value: submissions.length, color: 'text-indigo-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white shadow-sm border border-slate-200 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
