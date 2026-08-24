import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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
  for (const grade of [3, 4, 5, 6, 7, 8, 9, 10]) {
    try {
      const q = query(
        collection(db, 'curriculum'), 
        where('gradeNumber', '==', grade),
        orderBy('week', 'asc')
      );
      const snap = await getDocs(q);
      console.log(`Grade ${grade}: successfully fetched ${snap.size} docs with orderBy`);
    } catch (err) {
      console.error(`Grade ${grade} failed with orderBy:`, err.message);
    }
  }
}

run().catch(console.error);
