import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getClassesBySchool, getStudentsBySchool } from '../../firebase/schema'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../../firebase/config'
import * as XLSX from 'xlsx'

export default function Attendance() {
  const { profile } = useAuth()
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Day selection
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

  const classObj = classes.find(c => c.id === selectedClass)
  const classStudents = students.filter(s => 
    String(s.gradeNumber) === String(classObj?.grade)
  )

  const dateStr = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD format for comparison

  function didAttendThisDay(student) {
    if (!student.loginDates || !Array.isArray(student.loginDates)) return false
    return student.loginDates.some(d => d.startsWith(dateStr))
  }

  async function toggleAttendance(student) {
    const attended = didAttendThisDay(student)
    const studentRef = doc(db, 'users', student.id)
    
    try {
      if (attended) {
        // Remove any login string that starts with dateStr
        const newDates = (student.loginDates || []).filter(d => !d.startsWith(dateStr))
        await updateDoc(studentRef, { loginDates: newDates })
        setStudents(prev => prev.map(s => s.id === student.id ? {...s, loginDates: newDates} : s))
      } else {
        // Add dateStr
        await updateDoc(studentRef, { loginDates: arrayUnion(dateStr) })
        setStudents(prev => prev.map(s => s.id === student.id ? {...s, loginDates: [...(s.loginDates||[]), dateStr]} : s))
      }
    } catch(e) {
      console.error("Yoklama güncellenirken hata oluştu:", e)
    }
  }

  function handlePrevDay() {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }

  function handleNextDay() {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
  }

  function exportToExcel() {
    if (!classObj) return;
    const data = classStudents.map(s => ({
      'Öğrenci Adı': s.fullName,
      'Sınıf': `${s.gradeNumber}/${s.section}`,
      'Tarih': selectedDate.toLocaleDateString('tr-TR'),
      'Durum': didAttendThisDay(s) ? 'Geldi' : 'Gelmedi'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Yoklama')
    XLSX.writeFile(wb, `Yoklama_${classObj.grade}_${classObj.section}_${dateStr}.xlsx`)
  }

  if (loading) return <div className="text-center py-20 text-slate-500">Yükleniyor...</div>

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-slate-800 text-xl font-semibold">Manuel Yoklama Takibi</h2>
          <p className="text-slate-500 text-sm mt-0.5">Öğrencilerin yoklamasını gün gün seçerek manuel olarak alabilirsiniz.</p>
        </div>
        <button onClick={exportToExcel} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Excel İndir
        </button>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <label className="block text-slate-500 text-xs mb-1 font-bold">Sınıf Seçin</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 min-w-[200px]">
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 text-xs mb-1 font-bold">Tarih</label>
          <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <button onClick={handlePrevDay} className="text-slate-500 hover:text-indigo-600 hover:bg-white rounded px-2 py-1 transition-colors">◀</button>
            <div className="text-center min-w-[120px]">
              <p className="text-slate-700 text-sm font-bold">
                {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-slate-500 text-xs">{selectedDate.toLocaleDateString('tr-TR', { weekday: 'long' })}</p>
            </div>
            <button onClick={handleNextDay} className="text-slate-500 hover:text-indigo-600 hover:bg-white rounded px-2 py-1 transition-colors">▶</button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="p-4 text-slate-500 text-sm font-bold">Öğrenci Adı</th>
              <th className="p-4 text-slate-500 text-sm font-bold text-center">Durum (Tıklayarak Değiştir)</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.length === 0 ? (
              <tr><td colSpan="2" className="p-8 text-center text-slate-500">Bu sınıfta öğrenci bulunmuyor.</td></tr>
            ) : (
              classStudents.map(student => {
                const attended = didAttendThisDay(student)
                return (
                  <tr key={student.id} className="border-b border-slate-200/50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-800 font-medium text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        {student.fullName}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => toggleAttendance(student)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          attended 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${attended ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {attended ? '✅ Geldi' : '❌ Gelmedi'}
                      </button>
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
