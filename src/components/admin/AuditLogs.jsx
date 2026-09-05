import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'

export default function AuditLogs() {
  const { profile } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      try {
        if (!profile?.schoolCode) return
        
        // Sadece bu okulun loglarini getir
        const q = query(
          collection(db, 'audit_logs'),
          orderBy('timestamp', 'desc'),
          limit(100)
        )
        
        const snap = await getDocs(q)
        const logData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        // Filter in JS if needed (or we could use where('schoolCode', '==', profile.schoolCode) but it requires index)
        const filteredLogs = logData.filter(log => log.schoolCode === profile.schoolCode)
        setLogs(filteredLogs)
      } catch (err) {
        console.error("Audit log yükleme hatasi:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [profile])

  if (loading) return <div className="p-8 text-center text-slate-500">Kayıtlar yükleniyor...</div>

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sistem Denetim Kayıtları (Audit Logs)</h2>
          <p className="text-sm text-slate-500 mt-1">Kim, ne zaman, hangi işlemi gerçekleştirdi?</p>
        </div>
        <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 shadow-sm">
          Son 100 İşlem
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/80 sticky top-0 backdrop-blur-sm shadow-sm z-10">
            <tr>
              <th className="px-6 py-4 text-slate-600 font-bold uppercase tracking-wider text-xs">Tarih & Saat</th>
              <th className="px-6 py-4 text-slate-600 font-bold uppercase tracking-wider text-xs">Kullanıcı Adı</th>
              <th className="px-6 py-4 text-slate-600 font-bold uppercase tracking-wider text-xs">İşlem / Eylem</th>
              <th className="px-6 py-4 text-slate-600 font-bold uppercase tracking-wider text-xs">Modül</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">Henüz sistem kaydı bulunmuyor.</td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('tr-TR') : 'Bilinmiyor'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">{log.userName || 'Sistem'}</div>
                    <div className="text-xs text-slate-400">{log.userRole || 'system'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      log.action.includes('SİLİNDİ') ? 'bg-red-100 text-red-700' :
                      log.action.includes('EKLENDİ') || log.action.includes('YÜKLENDİ') ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.action}
                    </span>
                    {log.details && <p className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={log.details}>{log.details}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600 font-medium">{log.module || 'Genel'}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
