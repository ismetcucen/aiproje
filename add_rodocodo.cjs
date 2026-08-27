const fs = require('fs');
let c = fs.readFileSync('src/components/student/CodingGames.jsx', 'utf8');

const newGame = `  ,
  {
    id: 'rodocodo',
    title: 'Rodocodo (Kodlama)',
    desc: 'Kod bloklarını kullanarak sevimli robota yol göster ve bulmacaları çöz!',
    url: 'https://game.rodocodo.com/hour-of-code/',
    icon: '🤖'
  }
]`;

c = c.replace(']', newGame);
fs.writeFileSync('src/components/student/CodingGames.jsx', c, 'utf8');
console.log('Added Rodocodo');
