import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore'

const ROLE_LABELS = { student: 'Ogrenci', teacher: 'Ogretmen', admin: 'Admin' }
const ROLE_COLORS = {
  student: 'bg-indigo-900/50 text-indigo-300 border-indigo-800',
  teacher: 'bg-purple-900/50 text-purple-300 border-purple-800',
  admin:   'bg-red-900/50 text-red-300 border-red-800',
}
const LEVEL_LABELS = { ilkokul: 'Ilkokul', ortaokul: 'Ortaokul', lise: 'Lise' }

export default function UserManager() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'users'))
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''))
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function changeRole(userId, newRole) {
    setUpdating(userId)
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      console.error(err)
      alert('Rol degistirilemedi.')
    } finally {
      setUpdating(null)
    }
  }

  async function toggleActive(userId, current) {
    setUpdating(userId)
    try {
      await updateDoc(doc(db, 'users', userId), { isActive: !current })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !current } : u))
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = users
    .filter(u => filterRole === 'all' || u.role === filterRole)
    .filter(u => (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
                 (u.email || '').toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="text-center py-20 text-slate-400">Yukleniyor...</div>

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">Kullanicilar</h2>
          <p className="text-slate-400 text-sm mt-0.5">{users.length} kayitli kullanici</p>
        </div>
        <button onClick={loadUsers} className="text-slate-400 hover:text-white text-sm transition-colors">
          Yenile
        </button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ad veya e-posta ara..."
          className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
        />
        <div className="flex gap-2">
          {['all', 'student', 'teacher', 'admin'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                filterRole === role
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              {role === 'all' ? 'Tumu' : ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {filtered.map(user => (
          <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-4">

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                <span className="text-slate-300 text-sm font-semibold">
                  {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>

              {/* Bilgi */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white text-sm font-medium truncate">{user.fullName || 'Isimsiz'}</p>
                  <span className={`text-xs border px-1.5 py-0.5 rounded-full ${ROLE_COLORS[user.role] || ''}`}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                  {!user.isActive && (
                    <span className="text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">
                      Pasif
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs truncate">{user.email}</p>
                <p className="text-slate-600 text-xs">
                  {user.schoolCode} {user.classLevel ? `· ${LEVEL_LABELS[user.classLevel] || user.classLevel}` : ''} {user.gradeNumber ? `· ${user.gradeNumber}. sinif` : ''}
                </p>
              </div>

              {/* Rol Degistir */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={user.role}
                  onChange={e => changeRole(user.id, e.target.value)}
                  disabled={updating === user.id}
                  className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="student">Ogrenci</option>
                  <option value="teacher">Ogretmen</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => toggleActive(user.id, user.isActive)}
                  disabled={updating === user.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    user.isActive
                      ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-red-700 hover:text-red-400'
                      : 'bg-green-900/30 border-green-800 text-green-400 hover:bg-green-900/50'
                  }`}
                >
                  {updating === user.id ? '...' : user.isActive ? 'Deaktif Et' : 'Aktif Et'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
