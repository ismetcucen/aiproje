import { useState, useEffect, useRef } from 'react'
import { listenChatMessages, sendChatMsg } from '../../firebase/schema'
import { useAuth } from '../../hooks/useAuth'

export default function StudentLiveChat() {
  const { user, profile } = useAuth()
  const [isOpen, setIsOpen] = useState(true) // Always open in full page mode
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const chatRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const unsub = listenChatMessages(user.uid, (data) => {
      setMessages(data)
      if (!isOpen && data.length > 0 && data[data.length - 1].senderRole === 'teacher' && !data[data.length - 1].isRead) {
         // Maybe play a sound or bump the notification count in the future
      }
    })
    return () => unsub()
  }, [user, isOpen])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isOpen])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim()) return

    const msg = text.trim()
    setText('')
    await sendChatMsg({
      chatRoomId: user.uid,
      senderId: user.uid,
      text: msg,
      senderName: profile.fullName,
      senderRole: 'student',
      schoolCode: profile.schoolCode
    })
  }

  // Full Page UI
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">👨‍🏫</div>
              <div>
                <h3 className="font-bold leading-none mb-1">Öğretmenle Sohbet</h3>
                <span className="text-[10px] text-blue-100 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Canlı Destek
                </span>
              </div>
            </div>
            
          </div>
          
          <div ref={chatRef} className="flex-1 p-4 bg-[#f0f2f5] overflow-y-auto flex flex-col gap-3">
            <div className="text-center text-xs text-slate-400 mb-4 bg-slate-200/50 py-1 px-3 rounded-full self-center">
              Öğretmenine aklına takılanları sorabilirsin.
            </div>
            {messages.map((msg, idx) => {
              const isMe = msg.senderRole === 'student'
              return (
                <div key={idx} className={`flex max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
                  <div className={`px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm'}`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '...'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Mesaj yaz..." 
                className="flex-1 bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
              />
              <button 
                type="submit" 
                disabled={!text.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              >
                ➤
              </button>
            </form>
          </div>
    </div>
  )
}
