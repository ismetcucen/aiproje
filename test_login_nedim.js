import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyASGdTRZHjVcwpgyUG2V4tIHoWmzqnpSQw",
  authDomain: "aiproje-e8ce2.firebaseapp.com",
  projectId: "aiproje-e8ce2",
  storageBucket: "aiproje-e8ce2.firebasestorage.app",
  messagingSenderId: "1007619848859",
  appId: "1:1007619848859:web:1438a03126813500cc243e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    const cred = await signInWithEmailAndPassword(auth, "nedimusta@aistudio.com", "nedimusta");
    console.log("Login success! UID:", cred.user.uid);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (snap.exists()) {
      console.log("User profile:", snap.data());
    } else {
      console.log("No user profile found!");
    }
  } catch (err) {
    console.error("Auth error:", err.code, err.message);
  }
  process.exit(0);
}
run();
