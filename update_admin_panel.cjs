const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AdminPanel.jsx', 'utf8');

if (!c.includes('AIEducationTools')) {
  c = c.replace(
    "import HighSchoolAILab from '../../components/student/HighSchoolAILab'",
    "import HighSchoolAILab from '../../components/student/HighSchoolAILab'\nimport AIEducationTools from '../../components/admin/AIEducationTools'"
  );
  
  // Add to menu
  c = c.replace(
    "{ id: 'ailab', label: 'Lise AI Lab', icon: '🧠' },",
    "{ id: 'ailab', label: 'Lise AI Lab', icon: '🧠' },\n  { id: 'aiedu', label: 'Eğitimde YZ', icon: '🏫' },"
  );
  
  // Add route
  c = c.replace(
    "{active === 'ailab'       && <HighSchoolAILab />}",
    "{active === 'ailab'       && <HighSchoolAILab />}\n          {active === 'aiedu'       && <AIEducationTools />}"
  );
  
  fs.writeFileSync('src/pages/admin/AdminPanel.jsx', c, 'utf8');
  console.log('Updated AdminPanel.jsx');
}
