const fs = require('fs');
let c = fs.readFileSync('src/components/student/CodingGames.jsx', 'utf8');

c = c.replace("'https://code.org/learn'", "'https://code.org/tr'");

fs.writeFileSync('src/components/student/CodingGames.jsx', c, 'utf8');
console.log('Fixed code.org URL');
