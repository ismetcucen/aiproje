const fs = require('fs');
let c = fs.readFileSync('src/components/NotificationBell.jsx', 'utf8');

c = c.replace(/\\`/g, '`');

fs.writeFileSync('src/components/NotificationBell.jsx', c, 'utf8');
