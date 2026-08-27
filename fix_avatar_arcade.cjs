const fs = require('fs');

// 1. UPDATE LessonTools.jsx (Fix Avatar Studio)
let toolsContent = fs.readFileSync('src/components/student/LessonTools.jsx', 'utf8');
toolsContent = toolsContent.replace("'https://demo.readyplayer.me/avatar?frameApi'", "'https://avatarmaker.com/'");
toolsContent = toolsContent.replace("title: 'Avatar Stüdyosu (3D)'", "title: 'Avatar Stüdyosu'");
toolsContent = toolsContent.replace("desc: 'Kendi 3 boyutlu karakterini tasarla, giydir ve tarzını yarat!'", "desc: 'Kendi profil avatarını tasarla, indir ve paylaş! (Yeni sekmede açılır)'");
// add external: true if not present for avatar
toolsContent = toolsContent.replace(
  "icon: '👤'\n  }",
  "icon: '👤',\n    external: true\n  }"
);
fs.writeFileSync('src/components/student/LessonTools.jsx', toolsContent, 'utf8');

// 2. UPDATE CodingGames.jsx (Fix MakeCode Arcade)
let gamesContent = fs.readFileSync('src/components/student/CodingGames.jsx', 'utf8');
gamesContent = gamesContent.replace(
  "desc: 'Kendi retro atari oyunlarını bloklarla tasarla ve oyna!',",
  "desc: 'Kendi retro atari oyunlarını bloklarla tasarla ve oyna! (Yeni sekmede açılır)',"
);
gamesContent = gamesContent.replace(
  "icon: '👾',\n    external: false\n  }",
  "icon: '👾',\n    external: true\n  }"
);
fs.writeFileSync('src/components/student/CodingGames.jsx', gamesContent, 'utf8');

console.log('Fixed Avatar and Arcade');
