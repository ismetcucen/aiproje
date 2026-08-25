import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getClassesBySchool, getStudentsBySchool } from '../../firebase/schema'
import * as XLSX from 'xlsx'

export default function Attendance() {
  const { profile } = useAuth()
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Week selection
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  async function loadData() {
    setLoading(true)
    try {
      const [cls, studs] = await Promise.all([
        getClassesBySchool(profile.schoolCode),
        getStudentsBySchool(profile.schoolCode)
      ])
      setClasses(cls)
      setStudents(studs)
      if (cls.length > 0) setSelectedClass(cls[0].id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function getStartOfWeek(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    return new Date(d.setDate(diff))
  }

  const startOfWeek = getStartOfWeek(selectedDate)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const classObj = classes.find(c => c.id === selectedClass)
  const classStudents = students.filter(s => 
    s.gradeNumber == classObj?.grade && s.section == classObj?.section
  )

  function didAttendThisWeek(student) {
    if (!student.loginDates || !Array.isArray(student.loginDates)) return false
    return student.loginDates.some(dateStr => {
      const d = new Date(dateStr)
      return d >= startOfWeek && d <= endOfWeek
    })
  }

  function handlePrevWeek() {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 7)
    setSelectedDate(d)
  }

  function handleNextWeek() {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 7)
    setSelectedDate(d)
  }

  function exportToExcel() {
    if (!classObj) return;
    const data = classStudents.map(s => ({
      'Öğrenci Adı': s.fullName,
      'Sınıf': `${s.gradeNumber}/${s.section}`,
      'Hafta': `${startOfWeek.toLocaleDateString('tr-TR')} - ${endOfWeek.toLocaleDateString('tr-TR')}`,
      'Durum': didAttendThisWeek(s) ? 'Geldi' : 'Gelmedi'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Yoklama')
    XLSX.writeFile(wb, `Yoklama_${classObj.grade}_${classObj.section}_${startOfWeek.toLocaleDateString('tr-TR')}.xlsx`)
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Yükleniyor...</div>

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">Yoklama Takibi</h2>
          <p className="text-slate-400 text-sm mt-0.5">Sisteme giriş yapan öğrencilerin otomatik yoklaması.</p>
        </div>
        <button onClick={exportToExcel} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Excel İndir
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <label className="block text-slate-400 text-xs mb-1">Sınıf Seçin</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-lg border border-slate-700">
          <button onClick={handlePrevWeek} className="text-slate-400 hover:text-white px-2">◀</button>
          <div className="text-center min-w-[150px]">
            <p className="text-white text-sm font-medium">
              {startOfWeek.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - {endOfWeek.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </p>
            <p className="text-slate-500 text-xs">Pzt - Paz</p>
          </div>
          <button onClick={handleNextWeek} className="text-slate-400 hover:text-white px-2">▶</button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800">
              <th className="p-4 text-slate-400 text-sm font-medium">Öğrenci Adı</th>
              <th className="p-4 text-slate-400 text-sm font-medium">Durum</th>
              <th className="p-4 text-slate-400 text-sm font-medium text-right">Detay (Giriş Tarihleri)</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.length === 0 ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-500">Bu sınıfta öğrenci bulunmuyor.</td></tr>
            ) : (
              classStudents.map(student => {
                const attended = didAttendThisWeek(student)
                return (
                  <tr key={student.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 text-white text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                          {student.fullName.charAt(0)}
                        </div>
                        {student.fullName}
                      </div>
                    </td>
                    <td className="p-4">
                      {attended ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-900/30 text-green-400 border border-green-800/50 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Geldi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-red-900/30 text-red-400 border border-red-800/50 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Gelmedi
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {attended ? (
                        <span className="text-slate-500 text-xs">
                          {student.loginDates.filter(d => {
                            const date = new Date(d); return date >= startOfWeek && date <= endOfWeek;
                          }).join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
