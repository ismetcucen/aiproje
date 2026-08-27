const fs = require('fs');

let c = fs.readFileSync('src/components/student/HighSchoolAILab.jsx', 'utf8');

// 1. Character.ai & ChatPDF to Text/Edu (I'll put them in text)
const textTools = `
  { cat: 'text', title: 'Character.ai', url: 'https://character.ai/', icon: '🎭', desc: 'Tarihi figürler ve özel karakterlerle sohbet et.' },
  { cat: 'text', title: 'ChatPDF', url: 'https://www.chatpdf.com/', icon: '📖', desc: 'PDF kitaplarını yükle ve içindeki bilgilerle sohbet et.' },`;
c = c.replace("// --- Görsel, Video, Ses ve Sunum ---", textTools + "\n\n  // --- Görsel, Video, Ses ve Sunum ---");


// 2. Leonardo.ai & HeyGen to Visual
const visualTools = `
  { cat: 'visual', title: 'Leonardo.ai', url: 'https://leonardo.ai/', icon: '🖼️', desc: 'İleri düzey, inanılmaz kalitede yapay zeka görsel üretimi.' },
  { cat: 'visual', title: 'HeyGen', url: 'https://www.heygen.com/', icon: '👩‍💼', desc: 'Fotoğrafları ve metinleri kullanarak sanal insan/sunucu videoları yap.' },`;
c = c.replace("// --- Teknik Geliştirme ve Veri Analizi ---", visualTools + "\n\n  // --- Teknik Geliştirme ve Veri Analizi ---");

// 3. Skybox AI (Blockade Labs) to Visual or Dev. Let's add it to visual/dev. Dev is fine.
const devTools = `
  { cat: 'dev', title: 'Blockade Labs (Skybox)', url: 'https://skybox.blockadelabs.com/', icon: '🌌', desc: 'Metin yazarak içine girebileceğin 360 derece (VR) dünyalar tasarla.' },`;
c = c.replace("// --- Yardımcı Araçlar ---", devTools + "\n\n  // --- Yardımcı Araçlar ---");

fs.writeFileSync('src/components/student/HighSchoolAILab.jsx', c, 'utf8');
console.log('Added Character.ai, ChatPDF, Leonardo, HeyGen, Skybox');
