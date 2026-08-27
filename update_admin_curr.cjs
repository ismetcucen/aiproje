const fs = require('fs');

// Read both files
const defaultCurr = fs.readFileSync('src/data/defaultCurriculum.js', 'utf8');
const oldCurr = fs.readFileSync('src/data/curriculum.js', 'utf8');

// Extract the "3" array
const threeMatch = defaultCurr.match(/"3":\s*\[(.*?)\]\s*,/s);
const fourMatch = defaultCurr.match(/"4":\s*\[(.*?)\]\s*,/s);

if (threeMatch && fourMatch) {
  let newThree = `  "3": [${threeMatch[1]}],\n`;
  let newFour = `  "4": [${fourMatch[1]}],\n`;
  
  // Replace in oldCurr
  let modified = oldCurr.replace(/"3":\s*\[.*?\]\s*,/s, newThree);
  modified = modified.replace(/"4":\s*\[.*?\]\s*,/s, newFour);
  
  fs.writeFileSync('src/data/curriculum.js', modified, 'utf8');
  console.log("Updated curriculum.js with new 3 and 4 grade contents");
} else {
  console.log("Failed to extract");
}
