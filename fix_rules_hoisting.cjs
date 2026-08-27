const fs = require('fs');
let c = fs.readFileSync('firestore/firestore.rules', 'utf8');

// Remove from top
c = c.replace(`    match /school_settings/{schoolCode} {
      allow read: if isAuth();
      allow write: if isAdmin() || isTeacher();
    }`, '');

// Remove notifications from top
c = c.replace(`    match /notifications/{notifId} {
      allow read, update: if isAuth() && resource.data.userId == request.auth.uid;
      allow create: if isAuth(); // Teachers and students can create notifications for each other
      allow delete: if isAuth() && resource.data.userId == request.auth.uid;
    }`, '');

// Add to bottom right before the last "  }\n}"
c = c.replace(/  \}\n\}/g, `
    match /school_settings/{schoolCode} {
      allow read: if isAuth();
      allow write: if isAdmin() || isTeacher();
    }

    match /notifications/{notifId} {
      allow read, update: if isAuth() && resource.data.userId == request.auth.uid;
      allow create: if isAuth();
      allow delete: if isAuth() && resource.data.userId == request.auth.uid;
    }
  }
}`);

fs.writeFileSync('firestore/firestore.rules', c, 'utf8');
console.log('Rules fixed');
