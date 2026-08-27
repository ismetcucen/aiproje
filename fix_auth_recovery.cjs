const fs = require('fs');

let content = fs.readFileSync('src/components/admin/AddStudentModal.jsx', 'utf8');

// Ensure signInWithEmailAndPassword is imported
if (!content.includes('signInWithEmailAndPassword')) {
  content = content.replace(
    "import { createUserWithEmailAndPassword, updateProfile, getAuth, signOut } from 'firebase/auth'",
    "import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, getAuth, signOut } from 'firebase/auth'"
  );
}

const oldAuthCall = `const cred = await createUserWithEmailAndPassword(secAuth, targetEmail, targetPassword)
      const secDb = getFirestore(secAuth.app);`;

const newAuthCall = `let cred;
      try {
        cred = await createUserWithEmailAndPassword(secAuth, targetEmail, targetPassword)
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          try {
            cred = await signInWithEmailAndPassword(secAuth, targetEmail, targetPassword)
          } catch (loginErr) {
            throw authErr; // throw original if we can't login
          }
        } else {
          throw authErr;
        }
      }
      const secDb = getFirestore(secAuth.app);`;

content = content.replace(oldAuthCall, newAuthCall);

fs.writeFileSync('src/components/admin/AddStudentModal.jsx', content, 'utf8');
console.log('Auth recovery logic added');
