const fs = require('fs');

// 1. UPDATE LessonTools.jsx (Add Tinkercad)
let toolsContent = fs.readFileSync('src/components/student/LessonTools.jsx', 'utf8');
const newTool = `  ,
  {
    id: 'tinkercad',
    title: 'Tinkercad',
    desc: '3D tasarımlar yap ve sanal Arduino elektronik devreleri kur. (Yeni sekmede açılır)',
    url: 'https://www.tinkercad.com/',
    icon: '🧊',
    external: true
  }
]`;
toolsContent = toolsContent.replace(']', newTool);
fs.writeFileSync('src/components/student/LessonTools.jsx', toolsContent, 'utf8');

// 2. UPDATE CodingGames.jsx (Add Code.org and Quick Draw)
let gamesContent = fs.readFileSync('src/components/student/CodingGames.jsx', 'utf8');
const newGames = `  ,
  {
    id: 'codeorg',
    title: 'Code.org',
    desc: 'Eğlenceli görevlerle kodlama öğren ve kendi projeni yarat. (Yeni sekmede açılır)',
    url: 'https://code.org/learn',
    icon: '🌐',
    external: true
  },
  {
    id: 'quickdraw',
    title: 'Quick, Draw! (AI)',
    desc: '20 saniye içinde çizim yap, Google yapay zekası ne çizdiğini tahmin etsin! (Yeni sekmede açılır)',
    url: 'https://quickdraw.withgoogle.com/',
    icon: '✏️',
    external: true
  }
]`;
gamesContent = gamesContent.replace(']', newGames);
fs.writeFileSync('src/components/student/CodingGames.jsx', gamesContent, 'utf8');

console.log('Added Tinkercad, Code.org, Quick Draw!');
