const fs = require('fs');
let c = fs.readFileSync('src/components/teacher/ClassSettings.jsx', 'utf8');

c = c.replace(
  'Eğlence ve Kodlama Modülü',
  'Oyunlar ve Ders Araçları Modülü'
);
c = c.replace(
  '<strong> "Kodlama ve Oyunlar"</strong> sekmesi belirir.',
  '<strong> "Oyunlar"</strong> ve <strong> "Araçlar"</strong> sekmeleri belirir.'
);
c = c.replace(
  'Blockly Games ve Scratch',
  'Blockly Games, Scratch (TurboWarp), MakeCode (Micro:bit) ve Çizim Araçları'
);

fs.writeFileSync('src/components/teacher/ClassSettings.jsx', c, 'utf8');
