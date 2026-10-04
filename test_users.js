import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, limit, getDocs, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyASGdTRZHjVcwpgyUG2V4tIHoWmzqnpSQw",
  authDomain: "aiproje-e8ce2.firebaseapp.com",
  projectId: "aiproje-e8ce2",
  storageBucket: "aiproje-e8ce2.firebasestorage.app",
  messagingSenderId: "1007619848859",
  appId: "1:1007619848859:web:1438a03126813500cc243e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'student'), limit(20));
    const snap = await getDocs(q);
    snap.forEach(doc => {
      const data = doc.data();
      console.log(data.fullName, '|', data.email, '|', data.visualId);
    });
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
