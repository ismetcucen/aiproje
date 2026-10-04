import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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

async function run() {
  try {
    // Just try a dummy login to see the error
    await signInWithEmailAndPassword(auth, "dummy@aistudio.com", "dummy_123456");
  } catch (err) {
    console.error("Auth error:", err.code, err.message);
  }
  process.exit(0);
}
run();
