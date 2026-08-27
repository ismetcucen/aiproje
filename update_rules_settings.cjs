const fs = require('fs');
let rules = fs.readFileSync('firestore/firestore.rules', 'utf8');

const settingsRules = `
    match /school_settings/{schoolCode} {
      allow read: if isAuth();
      allow write: if isAdmin() || isTeacher();
    }
`;

if (!rules.includes('/school_settings/')) {
  rules = rules.replace("  }", "  }\n" + settingsRules);
  fs.writeFileSync('firestore/firestore.rules', rules, 'utf8');
  console.log('School settings rules added');
}
