const fs = require('fs');
require('child_process').execSync('git checkout src/data/curriculum.js');

const defCurrStr = fs.readFileSync('src/data/defaultCurriculum.js', 'utf8');

const threeMatch = defCurrStr.match(/"3":\s*\[(.*?)\]\s*,\s*"4":/s);
const fourMatch = defCurrStr.match(/"4":\s*\[(.*?)\]\s*,\s*"5":/s);

if (threeMatch && fourMatch) {
  let oldCurrStr = fs.readFileSync('src/data/curriculum.js', 'utf8');
  
  oldCurrStr = oldCurrStr.replace(/"3":\s*\[.*?\]\s*,\s*"4":/s, '"3": [' + threeMatch[1] + '],\n  "4":');
  
  oldCurrStr = oldCurrStr.replace(/"4":\s*\[.*?\]\s*,\s*"5":/s, '"4": [' + fourMatch[1] + '],\n  "5":');

  fs.writeFileSync('src/data/curriculum.js', oldCurrStr, 'utf8');
  console.log("Replaced successfully");
} else {
  console.log("Failed to match 3 and 4");
}
