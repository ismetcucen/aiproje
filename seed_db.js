import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { generateCurriculumList } from './src/data/defaultCurriculum.js';

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
  console.log("Fetching curriculum docs...");
  const snap = await getDocs(collection(db, 'curriculum'));
  console.log("Total docs in database:", snap.size);
  
  const counts = {};
  snap.docs.forEach(d => {
    const data = d.data();
    counts[data.gradeNumber] = (counts[data.gradeNumber] || 0) + 1;
  });
  console.log("Counts by grade in database:", counts);

  const list = generateCurriculumList();
  console.log("Total templates generated:", list.length);

  console.log("Writing all 288 documents to make sure everything is completely seeded...");
  
  const batch = writeBatch(db);
  list.forEach(c => {
    // Convert Dates to plain JS Dates which Firestore Client SDK will save as Timestamps
    const docRef = doc(db, 'curriculum', `grade_${c.gradeNumber}_week_${c.week}`);
    batch.set(docRef, c);
  });
  
  await batch.commit();
  console.log("Successfully seeded all 288 documents!");
  process.exit(0);
}

run().catch(err => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
