import { useState, useEffect, createContext, useContext } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth'
import { auth } from '../firebase/config'
import { createUserProfile, getUserProfile, ROLES, seedCurriculum } from '../firebase/schema'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const prof = await getUserProfile(firebaseUser.uid)
        setProfile(prof)
        if (prof?.role === ROLES.ADMIN) {
          seedCurriculum().catch(err => console.error('Müfredat yüklenirken hata oluştu:', err))
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function register({ fullName, email, password, role, classLevel, schoolCode, gradeNumber }) {
    const validCodes = (import.meta.env.VITE_VALID_SCHOOL_CODES || '').split(',')
    if (!validCodes.includes(schoolCode)) {
      throw new Error('Geçersiz okul kodu. Lütfen öğretmeninizle iletişime geçin.')
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: fullName })
    await createUserProfile(cred.user.uid, { fullName, email, role: role || ROLES.STUDENT, classLevel: classLevel || null, gradeNumber: gradeNumber || null, schoolCode })
    const prof = await getUserProfile(cred.user.uid)
    setProfile(prof)
    return cred.user
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const prof  = await getUserProfile(cred.user.uid)
    setProfile(prof)
    return cred.user
  }

  async function logout() {
    await signOut(auth)
    setUser(null)
    setProfile(null)
  }

  const value = { user, profile, loading, register, login, logout, isStudent: profile?.role === ROLES.STUDENT, isTeacher: profile?.role === ROLES.TEACHER, isAdmin: profile?.role === ROLES.ADMIN }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
