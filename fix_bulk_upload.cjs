const fs = require('fs');

let content = fs.readFileSync('src/components/admin/BulkStudentUpload.jsx', 'utf8');

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

content = content.replace("export default function BulkStudentUpload", secondaryAppCode + "\nexport default function BulkStudentUpload");

// Replace auth with getSecondaryAuth() inside handleUpload
content = content.replace(
  "const cred = await createUserWithEmailAndPassword(auth, s.email, s.password)",
  "const secAuth = getSecondaryAuth()\n        const cred = await createUserWithEmailAndPassword(secAuth, s.email, s.password)"
);

// Add signout
content = content.replace(
  "await updateProfile(cred.user, { displayName: s.fullName })",
  "await updateProfile(cred.user, { displayName: s.fullName })\n        await signOut(secAuth)"
);

fs.writeFileSync('src/components/admin/BulkStudentUpload.jsx', content, 'utf8');
console.log('BulkStudentUpload fixed');
