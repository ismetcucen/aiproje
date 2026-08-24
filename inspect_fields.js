import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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
  for (const grade of [3, 4, 5, 6, 7, 8, 9, 10]) {
    const q = query(collection(db, 'curriculum'), where('gradeNumber', '==', grade));
    const snap = await getDocs(q);
    console.log(`Grade ${grade}: found ${snap.size} docs`);
    
    // Check fields of each doc
    snap.docs.forEach(d => {
      const data = d.data();
      const required = ['gradeNumber', 'week', 'title', 'description', 'moduleId', 'moduleName', 'contentType'];
      required.forEach(field => {
        if (data[field] === undefined || data[field] === null) {
          console.log(`  ERROR: Doc ${d.id} is missing field "${field}"`);
        }
      });
    });
  }
}

inspect().catch(console.error);
