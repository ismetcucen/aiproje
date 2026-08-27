const fs = require('fs');

function addBellToPanel(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('NotificationBell')) {
    content = content.replace(
      "import { useAuth }",
      "import { useAuth }\nimport NotificationBell from '../../components/NotificationBell'"
    );
    
    // In the header, right after the active school badge or user avatar, add the bell.
    // Let's insert it before the school badge.
    content = content.replace(
      '<div className="hidden md:flex items-center gap-3',
      '<NotificationBell />\n          <div className="hidden md:flex items-center gap-3'
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Added to ' + filePath);
  }
}

addBellToPanel('src/pages/admin/AdminPanel.jsx');
addBellToPanel('src/pages/teacher/TeacherPanel.jsx');
addBellToPanel('src/pages/student/StudentPanel.jsx');
