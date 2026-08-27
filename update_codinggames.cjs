const fs = require('fs');
let c = fs.readFileSync('src/components/student/CodingGames.jsx', 'utf8');

const newGame = `  ,
  {
    id: 'codeforlife',
    title: 'Code For Life',
    desc: 'Rapid Router oyunu ile teslimat minibüsünü kodlayarak yönlendir! (Yeni sekmede açılır)',
    url: 'https://www.codeforlife.education/rapidrouter/',
    icon: '🚚',
    external: true
  }
]`;

c = c.replace(']', newGame);

// Update onClick logic
c = c.replace(
  'onClick={() => setActiveGame(g)}',
  'onClick={() => g.external ? window.open(g.url, "_blank") : setActiveGame(g)}'
);

fs.writeFileSync('src/components/student/CodingGames.jsx', c, 'utf8');
console.log('Updated CodingGames.jsx');
