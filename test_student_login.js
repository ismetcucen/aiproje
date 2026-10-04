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

async function testLogin() {
  const email = 'std_5_ismetalpmidik@aistudio.com';
  const pass = 'vp_apple_2026!';
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    console.log("SUCCESS! Logged in as:", cred.user.uid);
  } catch (err) {
    console.error("LOGIN FAILED:", err.code, err.message);
  }
  process.exit(0);
}

testLogin();
