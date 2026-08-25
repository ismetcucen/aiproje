import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, getAuth, signOut } from 'firebase/auth'
import { initializeApp, getApp } from 'firebase/app'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import app, { auth } from '../../firebase/config'
import { createUserProfile, addStudentToClass, ROLES, CLASS_LEVELS } from '../../firebase/schema'

function classLevelFromGrade(grade) {
  const g = Number(grade)
  if (g <= 4) return CLASS_LEVELS.ILKOKUL
  if (g <= 8) return CLASS_LEVELS.ORTAOKUL
  return CLASS_LEVELS.LISE
}


function getSecondaryAuth() {
  let secondaryApp;
  try {
    secondaryApp = getApp('SecondaryApp');
  } catch (e) {
    secondaryApp = initializeApp(app.options, 'SecondaryApp');
  }
  return getAuth(secondaryApp);
}

export default function BulkStudentUpload({ classInfo, schoolCode, onSuccess }) {
  const [students,  setStudents]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [results,   setResults]   = useState([])
  const [error,     setError]     = useState('')
  const [step,      setStep]      = useState('upload')

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    try {
      const { default: XLSX } = await import('xlsx')
      const reader = new FileReader()
      reader.onload = (evt) => {
        const wb   = XLSX.read(evt.target.result, { type: 'binary' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws)

        const parsed = data.map((row, i) => ({
          fullName:    row['Ad Soyad']   || row['fullName'] || row['name']  || '',
          email:       row['Email']      || row['email']    || row['mail']  || '',
          gradeNumber: row['Sinif']      || row['grade']    || classInfo?.grade || '',
          password:    row['Sifre']      || row['password'] || `Okul${schoolCode}123`,
        })).filter(r => r.fullName && r.email)

        if (parsed.length === 0) {
          setError('Excel de gecerli ogrenci bulunamadi. Sutunlar: Ad Soyad, Email, Sinif (opsiyonel)')
          return
        }
        setStudents(parsed)
        setStep('preview')
      }
      reader.readAsBinaryString(file)
    } catch(e) {
      setError('Excel okunamadi.')
    }
  }

  async function handleImport() {
    setLoading(true)
    setStep('importing')
    setProgress(0)
    const res = []

    for (let i = 0; i < students.length; i++) {
      const s = students[i]
      try {
        const secAuth = getSecondaryAuth()
        const cred = await createUserWithEmailAndPassword(secAuth, s.email, s.password)
        await updateProfile(cred.user, { displayName: s.fullName })
        await signOut(secAuth)
        const secDb = getFirestore(secAuth.app);
        await setDoc(doc(secDb, 'users', cred.user.uid), {
          fullName:    s.fullName,
          email:       s.email,
          role:        ROLES.STUDENT,
          classLevel:  classInfo ? classInfo.level : 'ortaokul',
          gradeNumber: classInfo ? classInfo.grade : null,
          schoolCode,
          files:       [],
          createdAt:   serverTimestamp(),
          isActive:    true,
        })
        if (classInfo) {
          await addStudentToClass(classInfo.id, cred.user.uid)
        }
        res.push({ name: s.fullName, email: s.email, status: 'ok', password: s.password })
      } catch(err) {
        const msg = err.code === 'auth/email-already-in-use' ? 'Email zaten kayitli' : err.message
        res.push({ name: s.fullName, email: s.email, status: 'error', error: msg })
      }
      setProgress(Math.round(((i + 1) / students.length) * 100))
    }

    setResults(res)
    setStep('done')
    setLoading(false)

    const successCount = res.filter(r => r.status === 'ok').length
    if (successCount > 0) onSuccess(successCount)
  }

  function downloadReport() {
    const lines = [
      'Ad Soyad,Email,Sifre,Durum,Hata',
      ...results.map(r =>
        `"${r.name}","${r.email}","${r.password || ''}","${r.status === 'ok' ? 'Basarili' : 'Hata'}","${r.error || ''}"`
      )
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'ogrenci_yukleme_raporu.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-800 text-red-300 text-sm">{error}</div>}

      {/* ADIM 1: Yükle */}
      {step === 'upload' && (
        <div>
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <p className="text-white text-sm font-medium mb-2">Excel Format</p>
            <p className="text-slate-400 text-xs mb-1">Zorunlu sutunlar:</p>
            <div className="flex gap-2 flex-wrap mb-2">
              {['Ad Soyad', 'Email'].map(col => (
                <code key={col} className="bg-slate-700 text-indigo-300 px-2 py-0.5 rounded text-xs">{col}</code>
              ))}
            </div>
            <p className="text-slate-400 text-xs mb-1">Opsiyonel:</p>
            <div className="flex gap-2 flex-wrap">
              {['Sinif', 'Sifre'].map(col => (
                <code key={col} className="bg-slate-700 text-slate-400 px-2 py-0.5 rounded text-xs">{col}</code>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-2">Sifre belirtilmezse varsayilan: Okul{schoolCode}123</p>
          </div>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm
              file:mr-3 file:bg-red-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1.5 file:text-xs file:cursor-pointer" />
        </div>
      )}

      {/* ADIM 2: Önizleme */}
      {step === 'preview' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-medium">{students.length} ogrenci bulundu</p>
            <button onClick={() => { setStep('upload'); setStudents([]) }}
              className="text-slate-400 hover:text-white text-sm">Geri</button>
          </div>
          <div className="max-h-48 overflow-auto mb-4 space-y-1">
            {students.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                <div>
                  <p className="text-white text-sm">{s.fullName}</p>
                  <p className="text-slate-500 text-xs">{s.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">{s.gradeNumber ? `${s.gradeNumber}. sinif` : ''}</p>
                  <p className="text-slate-600 text-xs">Sifre: {s.password}</p>
                </div>
              </div>
            ))}
          </div>
          {classInfo && (
            <p className="text-indigo-300 text-xs mb-3">Sinif: {classInfo.name} a eklenecek</p>
          )}
          <button onClick={handleImport}
            className="w-full bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            {students.length} Ogrenciyi Iceri Aktar
          </button>
        </div>
      )}

      {/* ADIM 3: İçe aktarılıyor */}
      {step === 'importing' && (
        <div className="text-center py-8">
          <p className="text-white font-medium mb-4">Ogrenciler aktariliyor...</p>
          <div className="bg-slate-800 rounded-full h-3 mb-2">
            <div className="bg-red-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-slate-400 text-sm">{progress}%</p>
        </div>
      )}

      {/* ADIM 4: Sonuç */}
      {step === 'done' && (
        <div>
          <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-green-900/30 border border-green-800 rounded-lg p-3 text-center">
              <p className="text-green-400 text-2xl font-bold">{results.filter(r => r.status === 'ok').length}</p>
              <p className="text-green-300 text-xs">Basarili</p>
            </div>
            <div className="flex-1 bg-red-900/30 border border-red-800 rounded-lg p-3 text-center">
              <p className="text-red-400 text-2xl font-bold">{results.filter(r => r.status === 'error').length}</p>
              <p className="text-red-300 text-xs">Hatali</p>
            </div>
          </div>
          <div className="max-h-48 overflow-auto mb-4 space-y-1">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                r.status === 'ok' ? 'bg-green-900/20' : 'bg-red-900/20'
              }`}>
                <div>
                  <p className="text-white text-sm">{r.name}</p>
                  <p className="text-slate-500 text-xs">{r.email}</p>
                  {r.status === 'error' && <p className="text-red-400 text-xs">{r.error}</p>}
                </div>
                <span className={`text-xs font-medium ${r.status === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                  {r.status === 'ok' ? 'OK' : 'HATA'}
                </span>
              </div>
            ))}
          </div>
          <button onClick={downloadReport}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm transition-colors">
            Raporu CSV Olarak Indir
          </button>
        </div>
      )}
    </div>
  )
}
