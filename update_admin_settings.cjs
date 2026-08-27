const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AdminPanel.jsx', 'utf8');

if (!c.includes('ClassSettings')) {
  c = c.replace(
    "import CurriculumEditor from '../../components/admin/CurriculumEditor'",
    "import CurriculumEditor from '../../components/admin/CurriculumEditor'\nimport ClassSettings from '../../components/teacher/ClassSettings'"
  );
  
  c = c.replace(
    "{ id: 'attendance', label: 'Yoklama',      icon: '✅' },",
    "{ id: 'attendance', label: 'Yoklama',      icon: '✅' },\n  { id: 'settings',   label: 'Ayarlar',      icon: '⚙️' },"
  );
  
  c = c.replace(
    "{active === 'attendance' && <Attendance />}",
    "{active === 'attendance' && <Attendance />}\n          {active === 'settings'   && <ClassSettings />}"
  );
  
  fs.writeFileSync('src/pages/admin/AdminPanel.jsx', c, 'utf8');
  console.log('AdminPanel updated with Settings menu');
}
