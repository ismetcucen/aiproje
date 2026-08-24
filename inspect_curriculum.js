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
  
  const grades = {};
  snap.docs.forEach(doc => {
    const data = doc.data();
    const g = data.gradeNumber;
    const w = data.week;
    const m = data.moduleId;
    const typeOfG = typeof g;
    const typeOfW = typeof w;
    const typeOfM = typeof m;
    
    if (!grades[g]) {
      grades[g] = [];
    }
    grades[g].push({ week: w, moduleId: m, typeOfGradeNumber: typeOfG, typeOfWeek: typeOfW, typeOfModuleId: typeOfM });
  });

  for (const grade in grades) {
    console.log(`\nGrade: ${grade} (count: ${grades[grade].length})`);
    const sample = grades[grade][0];
    console.log(`Sample: week=${sample.week} (${sample.typeOfWeek}), moduleId=${sample.moduleId} (${sample.typeOfModuleId}), gradeNumber type: ${sample.typeOfGradeNumber}`);
    
    // Check if any document for this grade has a mismatch
    const stringWeeks = grades[grade].filter(item => item.typeOfWeek !== 'number');
    const stringModules = grades[grade].filter(item => item.typeOfModuleId !== 'number');
    if (stringWeeks.length > 0) {
      console.log(`  WARNING: Found ${stringWeeks.length} documents with non-number week!`);
    }
    if (stringModules.length > 0) {
      console.log(`  WARNING: Found ${stringModules.length} documents with non-number moduleId!`);
    }
  }
}

inspect().catch(console.error);
