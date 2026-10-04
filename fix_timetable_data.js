import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function run() {
  // Try to find the school document, assuming OHEP
  const docRef = doc(db, 'school_settings', 'OHEP')
  const snap = await getDoc(docRef)
  if (snap.exists()) {
    const data = snap.data()
    if (!data.timetable || data.timetable.length === 0) {
      console.log("Timetable is empty. Adding default items...")
      await updateDoc(docRef, {
        timetable: [
          { label: '1. Ders', time: '08:30 - 09:10' },
          { label: 'Teneffüs', time: '09:10 - 09:20' },
          { label: '2. Ders', time: '09:20 - 10:00' },
          { label: 'Öğle Yemeği', time: '12:15 - 12:50' },
        ]
      })
      console.log("Added default timetable!")
    } else {
      console.log("Timetable already has items:", data.timetable)
    }
  } else {
    console.log("Document OHEP does not exist")
  }
  process.exit(0)
}
run()
