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

async function test(grade) {
  console.log(`\nTesting query for grade ${grade}...`);
  try {
    const q = query(
      collection(db, 'curriculum'), 
      where('gradeNumber', '==', Number(grade))
    );
    const snap = await getDocs(q);
    console.log(`Success! Found ${snap.size} documents.`);
  } catch (err) {
    console.error(`Error for grade ${grade}:`, err);
  }
}

async function run() {
  await test(3);
  await test(4);
  await test(7);
  await test(8);
}

run().catch(console.error);
