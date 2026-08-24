import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

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
  const g3Snap = await getDocs(query(collection(db, 'curriculum'), where('gradeNumber', '==', 3)));
  const g7Snap = await getDocs(query(collection(db, 'curriculum'), where('gradeNumber', '==', 7)));
  
  console.log("Grade 3 first document:", g3Snap.docs[0]?.data());
  console.log("Grade 7 first document:", g7Snap.docs[0]?.data());
}

run().catch(console.error);
