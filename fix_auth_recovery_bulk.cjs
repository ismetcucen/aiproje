const fs = require('fs');

let content = fs.readFileSync('src/components/admin/BulkStudentUpload.jsx', 'utf8');

// Ensure signInWithEmailAndPassword is imported
if (!content.includes('signInWithEmailAndPassword')) {
  content = content.replace(
    "import { createUserWithEmailAndPassword, updateProfile, getAuth, signOut } from 'firebase/auth'",
    "import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, getAuth, signOut } from 'firebase/auth'"
  );
}

const oldAuthCall = `const cred = await createUserWithEmailAndPassword(secAuth, s.email, s.password)
        const secDb = getFirestore(secAuth.app);`;

const newAuthCall = `let cred;
        try {
          cred = await createUserWithEmailAndPassword(secAuth, s.email, s.password)
        } catch (authErr) {
          if (authErr.code === 'auth/email-already-in-use') {
            try {
              cred = await signInWithEmailAndPassword(secAuth, s.email, s.password)
            } catch (loginErr) {
              throw authErr;
            }
          } else {
            throw authErr;
          }
        }
        const secDb = getFirestore(secAuth.app);`;

content = content.replace(oldAuthCall, newAuthCall);

fs.writeFileSync('src/components/admin/BulkStudentUpload.jsx', content, 'utf8');
console.log('Bulk auth recovery logic added');
