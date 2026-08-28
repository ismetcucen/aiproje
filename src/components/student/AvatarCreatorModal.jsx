import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config' // Verify this path. It should be correct based on previous files.

const STYLES = [
  { id: 'adventurer', label: 'Maceracı' },
  { id: 'bottts', label: 'Robot' },
  { id: 'fun-emoji', label: 'Eğlenceli' },
  { id: 'micah', label: 'Modern' },
  { id: 'lorelei', label: 'Sevimli' },
  { id: 'avataaars', label: 'Klasik' }
]

export default function AvatarCreatorModal({ user, profile, onClose, onSaved }) {
  const [style, setStyle] = useState(profile?.avatarStyle || 'bottts')
  const [seed, setSeed] = useState(profile?.avatarSeed || user.uid)
  const [loading, setLoading] = useState(false)

  const previewUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`

  async function handleSave() {
    setLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        avatarUrl: previewUrl,
        avatarStyle: style,
        avatarSeed: seed
      })
      onSaved(previewUrl)
      onClose()
    } catch (err) {
      alert("Kaydedilirken hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  function randomize() {
    setSeed(Math.random().toString(36).substring(2, 10))
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up flex flex-col">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg">Avatarını Tasarla 🎨</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full transition-colors">
            ✕
          </button>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          {/* Avatar Preview */}
          <div className="w-40 h-40 rounded-full border-4 border-indigo-100 shadow-xl overflow-hidden mb-6 bg-slate-50 relative group">
            <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
          </div>

          <div className="w-full space-y-4">
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Tarz Seç</label>
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                      style === s.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Rastgele Oluştur</label>
              <button onClick={randomize} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2">
                <span>🎲</span> Zarları At!
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
            İptal
          </button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/30">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
