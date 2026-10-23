import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import fs from 'fs';

const configContent = fs.readFileSync('src/firebase/config.js', 'utf8');
const match = configContent.match(/const firebaseConfig = ({[\s\S]*?});/);
if (match) {
  eval("var firebaseConfig = " + match[1]);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  async function test() {
    const q = query(collection(db, 'users'), where('role', '==', 'admin'));
    const snap = await getDocs(q);
    snap.docs.forEach(d => console.log(d.id, d.data().email, d.data().schoolCode));
    process.exit(0);
  }
  test();
}
