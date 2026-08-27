const fs = require('fs');

// 1. UPDATE LessonTools.jsx (Add Pictoblox & Arduino)
let toolsContent = fs.readFileSync('src/components/student/LessonTools.jsx', 'utf8');
const newTools = `  ,
  {
    id: 'pictoblox',
    title: 'PictoBlox (AI & ML)',
    desc: 'Scratch tabanlı arayüzle Yapay Zeka ve Makine Öğrenmesi projeleri geliştir!',
    url: 'https://pictoblox.ai/ide/',
    icon: '🐼',
    external: false
  },
  {
    id: 'arduino',
    title: 'Arduino Web Editor',
    desc: 'Arduino kartlarını doğrudan tarayıcı üzerinden kodla! (Yeni sekmede açılır)',
    url: 'https://app.arduino.cc/',
    icon: '♾️',
    external: true
  }
]`;
toolsContent = toolsContent.replace(']', newTools);
fs.writeFileSync('src/components/student/LessonTools.jsx', toolsContent, 'utf8');

// 2. UPDATE CodingGames.jsx (Add MakeCode Arcade)
let gamesContent = fs.readFileSync('src/components/student/CodingGames.jsx', 'utf8');
const newGames = `  ,
  {
    id: 'makecodearcade',
    title: 'MakeCode Arcade',
    desc: 'Kendi retro atari oyunlarını bloklarla tasarla ve oyna!',
    url: 'https://arcade.makecode.com/',
    icon: '👾',
    external: false
  }
]`;
gamesContent = gamesContent.replace(']', newGames);
fs.writeFileSync('src/components/student/CodingGames.jsx', gamesContent, 'utf8');

console.log('Added Pictoblox, Arduino, MakeCode Arcade');
