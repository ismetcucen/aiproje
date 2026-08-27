const fs = require('fs');

let content = fs.readFileSync('src/components/admin/AddStudentModal.jsx', 'utf8');

// Replace imports
content = content.replace(
  "import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'",
  "import { createUserWithEmailAndPassword, updateProfile, getAuth, signOut } from 'firebase/auth'\nimport { initializeApp, getApp } from 'firebase/app'"
);
content = content.replace(
  "import { auth } from '../../firebase/config'",
  "import app, { auth } from '../../firebase/config'"
);

// Add SecondaryApp helper
const secondaryAppCode = `
function getSecondaryAuth() {
  let secondaryApp;
  try {
    secondaryApp = getApp('SecondaryApp');
  } catch (e) {
    secondaryApp = initializeApp(app.options, 'SecondaryApp');
  }
  return getAuth(secondaryApp);
}
`;

content = content.replace("export default function AddStudentModal", secondaryAppCode + "\nexport default function AddStudentModal");

// Replace auth with getSecondaryAuth() inside handleSubmit
content = content.replace(
  "const cred = await createUserWithEmailAndPassword(auth, targetEmail, targetPassword)",
  "const secAuth = getSecondaryAuth()\n      const cred = await createUserWithEmailAndPassword(secAuth, targetEmail, targetPassword)"
);

// Add signout
content = content.replace(
  "if (classInfo) {\n        await addStudentToClass(classInfo.id, cred.user.uid)\n      }",
  "if (classInfo) {\n        await addStudentToClass(classInfo.id, cred.user.uid)\n      }\n      await signOut(secAuth)"
);

fs.writeFileSync('src/components/admin/AddStudentModal.jsx', content, 'utf8');
console.log('AddStudentModal fixed');
