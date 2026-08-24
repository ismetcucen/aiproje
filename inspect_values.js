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

async function inspect() {
  const snap = await getDocs(collection(db, 'curriculum'));
  console.log(`Total documents found: ${snap.size}`);
  
  const contentTypesByGrade = {};
  const moduleIdsByGrade = {};
  
  snap.docs.forEach(doc => {
    const data = doc.data();
    const g = data.gradeNumber;
    const ct = data.contentType;
    const m = data.moduleId;
    
    if (!contentTypesByGrade[g]) contentTypesByGrade[g] = new Set();
    if (!moduleIdsByGrade[g]) moduleIdsByGrade[g] = new Set();
    
    contentTypesByGrade[g].add(ct);
    moduleIdsByGrade[g].add(m);
  });

  for (const grade in contentTypesByGrade) {
    console.log(`Grade ${grade}:`);
    console.log(`  contentTypes:`, Array.from(contentTypesByGrade[grade]));
    console.log(`  moduleIds:`, Array.from(moduleIdsByGrade[grade]));
  }
}

inspect().catch(console.error);
