import { useState, useEffect, useRef } from 'react'
import { listenAllSchoolChats, sendChatMsg, listenChatMessages } from '../../firebase/schema'
import { useAuth } from '../../hooks/useAuth'

export default function LiveChatInbox() {
  const { user, profile } = useAuth()
  const [messagesList, setMessagesList] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [roomMessages, setRoomMessages] = useState([])
  const [text, setText] = useState('')
  const chatRef = useRef(null)

  useEffect(() => {
    if (!profile?.schoolCode) return;
    const unsub = listenAllSchoolChats(profile.schoolCode, (data) => {
      setMessagesList(data)
    })
    return () => unsub()
  }, [profile])

  useEffect(() => {
    if (!activeRoom) return;
    const unsub = listenChatMessages(activeRoom, (data) => {
      setRoomMessages(data)
    })
    return () => unsub()
  }, [activeRoom])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [roomMessages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !activeRoom) return

    const msg = text.trim()
    setText('')
    await sendChatMsg({
      chatRoomId: activeRoom,
      senderId: user.uid,
      text: msg,
      senderName: profile.fullName,
      senderRole: 'teacher',
      schoolCode: profile.schoolCode
    })
  }

  // Grup the latest message per student to build the inbox list
  const chatRooms = {}
  messagesList.forEach(m => {
    if (!chatRooms[m.chatRoomId]) {
      chatRooms[m.chatRoomId] = {
        studentId: m.chatRoomId,
        studentName: m.senderRole === 'student' ? m.senderName : 'Öğrenci',
        latestMessage: m.text,
        time: m.createdAt?.toDate ? m.createdAt.toDate() : new Date(),
        unreadCount: (m.senderRole === 'student' && !m.isRead) ? 1 : 0
      }
    } else {
      if (m.senderRole === 'student' && !m.isRead) {
        chatRooms[m.chatRoomId].unreadCount += 1
      }
      if (m.senderRole === 'student' && chatRooms[m.chatRoomId].studentName === 'Öğrenci') {
        chatRooms[m.chatRoomId].studentName = m.senderName
      }
    }
  })

  const sortedRooms = Object.values(chatRooms).sort((a, b) => b.time - a.time)

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 p-4">
      {/* Sol Panel: Kişiler */}
      <div className="w-full md:w-80 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm text-white p-4 font-bold text-lg flex items-center justify-between z-10 shadow-md">
          <span>Mesajlar</span>
          <span className="text-sm bg-indigo-500 px-2 py-1 rounded-lg">{sortedRooms.length} Kişi</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
          {sortedRooms.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Hiç mesaj yok.</div>
          ) : (
            sortedRooms.map(room => (
              <div 
                key={room.studentId}
                onClick={() => setActiveRoom(room.studentId)}
                className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex items-center gap-3 ${activeRoom === room.studentId ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-100'}`}
              >
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {room.studentName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{room.studentName}</h4>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">{room.time.toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{room.latestMessage}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sağ Panel: Chat Ekranı */}
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col overflow-hidden relative">
        {activeRoom ? (
          <>
            <div className="bg-indigo-600 text-white p-4 flex items-center gap-4 z-10 shadow-md">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
                👨‍🎓
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{chatRooms[activeRoom]?.studentName}</h3>
                <span className="text-indigo-200 text-xs font-medium">Çevrimiçi Sohbet</span>
              </div>
            </div>
            
            <div ref={chatRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-[#f0f2f5] flex flex-col gap-3">
              {roomMessages.map((msg, idx) => {
                const isMe = msg.senderRole === 'teacher'
                return (
                  <div key={idx} className={`flex max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                      {!isMe && <span className="block text-[10px] font-bold text-indigo-500 mb-1">{msg.senderName}</span>}
                      <p className="leading-relaxed">{msg.text}</p>
                      <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '...'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" 
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Mesaj yazın..." 
                  className="flex-1 bg-white border border-slate-300 focus:border-indigo-500 rounded-2xl px-5 py-3 text-sm transition-all outline-none"
                />
                <button 
                  type="submit" 
                  disabled={!text.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors"
                >
                  ➤
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-slate-600">Öğretmenle Mesajlaş</h3>
            <p className="text-sm">Sohbete başlamak için sol taraftan bir öğrenci seçin.</p>
          </div>
        )}
      </div>
    </div>
  )
}
