const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
config.storage = {
  rules: "storage.rules"
};
fs.writeFileSync('firebase.json', JSON.stringify(config, null, 2));
