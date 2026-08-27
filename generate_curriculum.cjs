const fs = require('fs');

const grade3 = [
  "Dosya-klasör-klavye", "Canva tasarım", "Dikkat geliştirme", "Dikkat geliştirme",
  "Örüntü kodlama", "Sezar şifreleme", "Fırça robot", "Amiral battı",
  "Okyanusları temizliyorum", "Code org - müzik", "uzay yolculuk", "trafik lambası",
  "türk bayrağı uzaya çıkıyor", "gezegenlere ulaşıyoruz", "kar küresi yapımı", "Scratch giriş",
  "Muz toplama", "Harflerin dansı", "Makey makey", "Makey makey",
  "Microbit", "Microbit", "Kodu game lab", "Kodu game lab",
  "pivot animator", "pivot animator", "3d tasarım", "3d tasarım",
  "3d baskı", "proje", "proje", "proje",
  "yapay zeka", "yapay zeka", "yapay zeka", "yapay zeka"
];

const grade4 = [
  "internet güvenliği", "siber zorbalık", "iyi dijital vatandaş", "dijital ayak izi - güçlü şifre",
  "bilgisayarlar - donanımlar", "klavye-dosya", "wordpad", "bilgisayarsız kodlama",
  "code.org basit kod", "code.org çizim", "little dot", "compute it",
  "blockly", "kodu game lab", "kodu game lab", "scratch harf",
  "scratch gezgin fare", "scratch top sektirme", "parola - adın ne", "devre tasarımı",
  "seri- paralel bağlama", "yer silme robotu", "micro bit", "isimlik duygu rozeti",
  "gece lambası - termometre", "müzik yapımı", "sulama", "pusula yapımı",
  "yz müzik yapımı", "chat gpt", "quick draw", "tinkercad",
  "3d tasarım", "yapay zeka", "yapay zeka", "yapay zeka"
];

const makeDesc = (title, week) => {
  const t = title.toLowerCase();
  if (t.includes('dosya') || t.includes('klavye') || t.includes('bilgisayarlar')) return "Bilgisayarın temel bileşenlerini tanır, dosya ve klasör yönetimini kavrar.";
  if (t.includes('canva') || t.includes('wordpad')) return "Dijital içerik oluşturma araçlarını kullanarak temel tasarımlar ve metinler oluşturur.";
  if (t.includes('dikkat') || t.includes('amiral')) return "Mantıksal akıl yürütme ve dikkat geliştirici oyunlaştırma etkinlikleriyle odaklanma becerisini artırır.";
  if (t.includes('kodlama') || t.includes('code.org') || t.includes('blockly') || t.includes('compute')) return "Blok tabanlı kodlama platformları ile algoritmik düşünme becerilerini geliştirir.";
  if (t.includes('şifre') || t.includes('parola')) return "Bilgi güvenliği ve temel şifreleme yöntemlerini (Sezar şifreleme, güçlü şifre oluşturma) kavrar.";
  if (t.includes('robot') || t.includes('devre') || t.includes('bağlama')) return "Temel elektronik devre elemanlarını tanır ve basit robotik projelerin mantığını anlar.";
  if (t.includes('scratch') || t.includes('kodu game lab') || t.includes('pivot')) return "Oyun geliştirme platformlarında sahneler oluşturur ve karakterlere hareket komutları verir.";
  if (t.includes('makey') || t.includes('micro') || t.includes('isimlik')) return "Fiziksel programlama araçlarını (Makey Makey, Micro:bit) kullanarak dış dünya ile bilgisayar arasında köprü kurar.";
  if (t.includes('3d') || t.includes('tinkercad')) return "3 Boyutlu tasarım araçlarını kullanarak temel geometrik şekillerden modeller oluşturur.";
  if (t.includes('proje')) return "Öğrendiği araçları kullanarak kendi özgün dijital veya fiziksel ürününü projelendirir.";
  if (t.includes('yapay zeka') || t.includes('chat gpt') || t.includes('quick draw') || t.includes('yz')) return "Yapay zeka araçlarının çalışma mantığını anlar ve kendi üretim süreçlerinde etik kurallara uyarak kullanır.";
  if (t.includes('güvenlik') || t.includes('zorbalık') || t.includes('vatandaş') || t.includes('ayak izi')) return "Dijital ortamlarda güvende kalmanın yollarını, siber zorbalığı ve dijital ayak izi kavramlarını açıklar.";
  return "Konuya ilişkin temel kavramları anlar ve pratik uygulamalarla pekiştirir.";
};

const g3 = grade3.map((title, i) => ({
  week: i + 1,
  title: title.charAt(0).toUpperCase() + title.slice(1),
  desc: makeDesc(title, i + 1)
}));

const g4 = grade4.map((title, i) => ({
  week: i + 1,
  title: title.charAt(0).toUpperCase() + title.slice(1),
  desc: makeDesc(title, i + 1)
}));

let content = fs.readFileSync('src/data/defaultCurriculum.js', 'utf8');

const sIdx = content.indexOf('"3-4": [');
const eIdx = content.indexOf('  "5-6": [');
const newStr = `"3": ${JSON.stringify(g3, null, 4)},\n  "4": ${JSON.stringify(g4, null, 4)},\n`;

content = content.substring(0, sIdx) + newStr + content.substring(eIdx);

content = content.replace('let templateKey = "3-4";', 'let templateKey = grade.toString();');
content = content.replace(
  'if (grade === 5 || grade === 6) templateKey = "5-6";', 
  'if (grade === 3) templateKey = "3";\n    else if (grade === 4) templateKey = "4";\n    else if (grade === 5 || grade === 6) templateKey = "5-6";'
);

fs.writeFileSync('src/data/defaultCurriculum.js', content, 'utf8');
console.log('Curriculum updated strictly');
