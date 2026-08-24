import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
  const snap = await getDocs(collection(db, 'curriculum'));
  let stringGradeCount = 0;
  let numberGradeCount = 0;
  
  snap.docs.forEach(d => {
    const data = d.data();
    if (typeof data.gradeNumber === 'string') {
      console.log(`Document ${d.id} has gradeNumber as STRING: "${data.gradeNumber}"`);
      stringGradeCount++;
    } else if (typeof data.gradeNumber === 'number') {
      numberGradeCount++;
    } else {
      console.log(`Document ${d.id} has gradeNumber as ${typeof data.gradeNumber}`);
    }
  });
  
  console.log(`Summary: ${numberGradeCount} number grades, ${stringGradeCount} string grades.`);
}

run().catch(console.error);
