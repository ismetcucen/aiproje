import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASGdTRZHjVcwpgyUG2V4tIHoWmzqnpSQw",
  authDomain: "aiproje-e8ce2.firebaseapp.com",
  projectId: "aiproje-e8ce2",
  storageBucket: "aiproje-e8ce2.firebasestorage.app",
  messagingSenderId: "1007619848859",
  appId: "1:1007619848859:web:1438a03126813500cc243e"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log('--- ALL SUBMISSIONS ---');
  const sSnap = await getDocs(collection(db, 'submissions'));
  sSnap.docs.forEach(d => console.log(d.id, 'school:', d.data().schoolCode, 'assignmentId:', d.data().assignmentId, 'content:', String(d.data().content).slice(0, 30)));
  
  console.log('--- ALL USERS ---');
  const uSnap = await getDocs(collection(db, 'users'));
  uSnap.docs.forEach(d => console.log(d.id, d.data().email, d.data().role, d.data().schoolCode));
  
  process.exit(0);
}
test();
