import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { setDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase/config'

export default function StudentStatusWidget() {
  const { user, profile } = useAuth()
  const [status, setStatus] = useState('active') // active, task, help

  useEffect(() => {
    if (user && profile) {
      updateStatus('active')
      
      const handleUnload = () => updateStatus('offline')
      window.addEventListener('beforeunload', handleUnload)
      return () => window.removeEventListener('beforeunload', handleUnload)
    }
  }, [user, profile])

  async function updateStatus(newStatus) {
    if (!user || !profile) return
    setStatus(newStatus)
    try {
      await setDoc(doc(db, 'student_status', user.uid), {
        status: newStatus,
        schoolCode: profile.schoolCode || '',
        gradeNumber: profile.gradeNumber || '',
        fullName: profile.fullName || '',
        updatedAt: new Date()
      }, { merge: true })
    } catch(err) {
      console.error('Statü güncellenirken hata:', err)
    }
  }

  const buttons = [
    { id: 'active', label: 'Dinliyorum', icon: '🟢', activeColor: 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]', hover: 'hover:bg-emerald-100 hover:text-emerald-700' },
    { id: 'task', label: 'Görevdeyim', icon: '🟡', activeColor: 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]', hover: 'hover:bg-amber-100 hover:text-amber-700' },
    { id: 'help', label: 'Yardım!', icon: '🔴', activeColor: 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]', hover: 'hover:bg-rose-100 hover:text-rose-700' }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-2 p-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 transition-all duration-300">
      {buttons.map(b => (
        <button
          key={b.id}
          onClick={() => updateStatus(b.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            status === b.id 
              ? `${b.activeColor} scale-105` 
              : `bg-white/50 text-slate-500 ${b.hover}`
          }`}
        >
          <span className="text-base">{b.icon}</span>
          <span className={`${status === b.id ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:opacity-100 md:w-auto overflow-hidden'} transition-all duration-300 whitespace-nowrap`}>
            {b.label}
          </span>
        </button>
      ))}
    </div>
  )
}
