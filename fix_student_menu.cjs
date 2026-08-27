const fs = require('fs');
let c = fs.readFileSync('src/pages/student/StudentPanel.jsx', 'utf8');

c = c.replace(
  '{MENU.map(item => (',
  '{[...MENU, ...(settings.codingModuleEnabled ? [{ id: "games", label: "Eğlence & Kodlama", icon: "🎮" }] : [])].map(item => ('
);

fs.writeFileSync('src/pages/student/StudentPanel.jsx', c, 'utf8');
