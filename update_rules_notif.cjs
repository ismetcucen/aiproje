const fs = require('fs');
let rules = fs.readFileSync('firestore/firestore.rules', 'utf8');

const notifRules = `
    match /notifications/{notifId} {
      allow read, update: if isAuth() && resource.data.userId == request.auth.uid;
      allow create: if isAuth(); // Teachers and students can create notifications for each other
      allow delete: if isAuth() && resource.data.userId == request.auth.uid;
    }
`;

if (!rules.includes('/notifications/')) {
  rules = rules.replace("  }", "  }\n" + notifRules);
  fs.writeFileSync('firestore/firestore.rules', rules, 'utf8');
  console.log('Notifications rules added');
}
