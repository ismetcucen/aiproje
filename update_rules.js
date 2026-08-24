const fs = require('fs');
let rules = fs.readFileSync('firestore/firestore.rules', 'utf8');

const newRules = `
    // ─── CLASSES ───────────────────────────────────────────────────
    match /classes/{classId} {
      allow read: if isAuth();
      allow write: if isAdmin() || isTeacher();
    }

    match /class_students/{docId} {
      allow read: if isAuth();
      allow write: if isAdmin() || isTeacher();
    }

    match /class_assignments/{docId} {
      allow read: if isAuth();
      allow write: if isAdmin() || isTeacher();
    }

    match /curriculum_edits/{docId} {
      allow read: if isAuth();
      allow write: if isAdmin() || isTeacher();
    }
    
    match /schools/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
`;

// Insert before the last closing brace
rules = rules.replace(/  }\n}\n$/, newRules + '  }\n}\n');
fs.writeFileSync('firestore/firestore.rules', rules);
console.log('Done');
