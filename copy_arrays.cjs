const fs = require('fs');

const d = fs.readFileSync('src/data/defaultCurriculum.js', 'utf8');
const c = fs.readFileSync('src/data/curriculum.js', 'utf8');

// The arrays in defaultCurriculum.js are inside CURRICULUM_TEMPLATES
const tMatch = d.match(/const CURRICULUM_TEMPLATES = (\{.*?\});/s);
if (tMatch) {
  const templates = eval('(' + tMatch[1] + ')');
  const three = templates["3"];
  const four = templates["4"];
  
  // Format them
  const threeStr = JSON.stringify(three, null, 4);
  const fourStr = JSON.stringify(four, null, 4);
  
  // Now replace in curriculum.js
  let newC = c.replace(/"3":\s*\[[\s\S]*?\],\s*"4":/s, '"3": ' + threeStr + ',\n  "4":');
  newC = newC.replace(/"4":\s*\[[\s\S]*?\],\s*"5":/s, '"4": ' + fourStr + ',\n  "5":');
  
  fs.writeFileSync('src/data/curriculum.js', newC, 'utf8');
  console.log("Success");
} else {
  console.log("Failed to find CURRICULUM_TEMPLATES");
}
