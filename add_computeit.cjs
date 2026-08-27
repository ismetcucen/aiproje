const fs = require('fs');
let c = fs.readFileSync('src/components/student/CodingGames.jsx', 'utf8');

const newGame = `  ,
  {
    id: 'computeit',
    title: 'Compute it',
    desc: 'Kodları okuyarak bilgisayarın kendisi sen ol! Yön tuşlarıyla algoritmaları çöz.',
    url: 'https://compute-it.toxicode.fr/',
    icon: '💻'
  }
]`;

c = c.replace(']', newGame);
fs.writeFileSync('src/components/student/CodingGames.jsx', c, 'utf8');
console.log('Added Compute it');
