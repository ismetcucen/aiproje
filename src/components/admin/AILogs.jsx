import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../hooks/useAuth'

export default function AILogs() {
  const { profile } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      try {
        if (!profile?.schoolCode) return
        
        const q = query(
          collection(db, 'ai_logs'),
          orderBy('timestamp', 'desc'),
          limit(100)
        )
        
        const snap = await getDocs(q)
        const logData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        const filteredLogs = logData.filter(log => log.schoolCode === profile.schoolCode)
        setLogs(filteredLogs)
      } catch (err) {
        console.error("AI log yükleme hatasi:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [profile])

  if (loading) return <div className="p-8 text-center text-slate-500">Kayıtlar yükleniyor...</div>

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-purple-50/50">
        <div>
          <h2 className="text-xl font-bold text-purple-800">Yapay Zeka (AI) Kullanım Kayıtları</h2>
          <p className="text-sm text-purple-600/70 mt-1">Öğrencilerin AI asistan ile yaptıkları konuşmalar ve sorgular.</p>
        </div>
        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 shadow-sm">
          Son 100 Konuşma
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6 space-y-6 bg-slate-50">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 italic">Henüz AI etkileşim kaydı bulunmuyor.</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">👨‍🎓</div>
                  <div>
                    <h3 className="font-bold text-slate-800">{log.userName}</h3>
                    <p className="text-xs text-slate-400">Öğrenci</p>
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString('tr-TR') : 'Bilinmiyor'}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Öğrenci Sorusu (Prompt)</p>
                  <p className="text-sm text-slate-700">{log.prompt || '[Görsel Gönderildi]'}</p>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1"><span>🤖</span> AI Cevabı</p>
                  <div className="text-sm text-slate-700 max-h-40 overflow-y-auto custom-scrollbar">
                    {log.response}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
