const fs = require('fs');
let rules = fs.readFileSync('firestore/firestore.rules', 'utf8');

rules = rules.replace(
  "allow update, delete: if isAdmin();",
  "allow create, update, delete: if isAdmin() || isTeacher();"
);

fs.writeFileSync('firestore/firestore.rules', rules, 'utf8');
console.log('Rules updated');
