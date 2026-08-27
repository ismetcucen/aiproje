const fs = require('fs');

let c = fs.readFileSync('src/firebase/schema.js', 'utf8');

const newSeed = `export async function seedCurriculum() {
  const q = query(collection(db, 'curriculum'), limit(1))
  const snap = await getDocs(q)
  
  // Sadece sürüm kontrolü yap
  const versionRef = doc(db, 'curriculum_metadata', 'version_v2');
  const versionSnap = await getDoc(versionRef);
  
  if (versionSnap.exists()) return; // Zaten v2 yüklenmiş
  
  const list = generateCurriculumList()
  const batch = writeBatch(db)
  
  list.forEach(c => {
    const docRef = doc(db, 'curriculum', \`grade_\${c.gradeNumber}_week_\${c.week}\`)
    batch.set(docRef, c)
  })
  
  await batch.commit()
  await setDoc(versionRef, { installed: true });
}`;

// replace the old seedCurriculum completely
c = c.replace(/export async function seedCurriculum\(\) \{[\s\S]*?await batch\.commit\(\)\n\}/, newSeed);

fs.writeFileSync('src/firebase/schema.js', c, 'utf8');
console.log('Smart seed applied');
