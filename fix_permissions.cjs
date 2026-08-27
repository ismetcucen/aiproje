const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Import Firestore tools
  if (!content.includes('getFirestore')) {
    content = content.replace(
      "import { initializeApp, getApp } from 'firebase/app'",
      "import { initializeApp, getApp } from 'firebase/app'\nimport { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'"
    );
  }

  // Inside handleSubmit or handleUpload:
  const profileCallRegex = /await createUserProfile\([\s\S]*?\}\)/;
  
  if (filePath.includes('AddStudentModal')) {
    content = content.replace(profileCallRegex, `const secDb = getFirestore(secAuth.app);
      await setDoc(doc(secDb, 'users', cred.user.uid), {
        fullName:    form.fullName.trim(),
        email:       targetEmail,
        role:        ROLES.STUDENT,
        classLevel:  classLevelFromGrade(form.gradeNumber),
        gradeNumber: Number(form.gradeNumber),
        schoolCode,
        visualId:    mode === 'visual' ? form.visualId : null,
        files:       [],
        createdAt:   serverTimestamp(),
        isActive:    true,
      })`);
  } else if (filePath.includes('BulkStudentUpload')) {
    content = content.replace(profileCallRegex, `const secDb = getFirestore(secAuth.app);
        await setDoc(doc(secDb, 'users', cred.user.uid), {
          fullName:    s.fullName,
          email:       s.email,
          role:        ROLES.STUDENT,
          classLevel:  classInfo ? classInfo.level : 'ortaokul',
          gradeNumber: classInfo ? classInfo.grade : null,
          schoolCode,
          files:       [],
          createdAt:   serverTimestamp(),
          isActive:    true,
        })`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('src/components/admin/AddStudentModal.jsx');
fixFile('src/components/admin/BulkStudentUpload.jsx');
console.log('Permissions fixed via secDb');
