import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const grade5 = [
    { week: 1, title: "Bilişim Teknolojileri ve Günlük Yaşam", description: "Bilişim teknolojilerinin günlük hayatımızdaki yeri ve önemi. (Haftalık 2 Saat)" },
    { week: 2, title: "Bilgisayar Sistemleri", description: "Donanım ve yazılım kavramları. (Haftalık 2 Saat)" },
    { week: 3, title: "Dosya ve Klasör Yönetimi", description: "Dijital ortamda verilerin düzenlenmesi ve yönetimi. (Haftalık 2 Saat)" },
    { week: 4, title: "Etik Kurallar ve Dijital Vatandaşlık", description: "İnternet ortamında uyulması gereken etik kurallar. (Haftalık 2 Saat)" },
    { week: 5, title: "Dijital Ayak İzi", description: "Siber zorbalık ve dijital ayak izi kavramları. (Haftalık 2 Saat)" },
    { week: 6, title: "Bilgi Güvenliği", description: "Güçlü şifre oluşturma ve kişisel verilerin korunması. (Haftalık 2 Saat)" },
    { week: 7, title: "Dijital Telif Hakları", description: "Dijital dünyada lisans türleri ve telif hakları. (Haftalık 2 Saat)" },
    { week: 8, title: "İletişim Teknolojileri", description: "E-posta kullanımı ve dijital iletişim araçları. (Haftalık 2 Saat)" },
    { week: 9, title: "Problem Çözme Adımları", description: "Bir problemi çözerken izlenmesi gereken mantıksal adımlar. (Haftalık 2 Saat)" },
    { week: 10, title: "Problem Çözme Stratejileri", description: "Farklı problem türlerine göre çözüm stratejileri. (Haftalık 2 Saat)" },
    { week: 11, title: "Algoritmaya Giriş", description: "Algoritma kavramı ve günlük hayattan örnekler. (Haftalık 2 Saat)" },
    { week: 12, title: "Akış Şemaları", description: "Akış şeması sembolleri ve temel kuralları. (Haftalık 2 Saat)" },
    { week: 13, title: "Algoritma Tasarımı", description: "Akış şemaları kullanarak basit algoritma tasarımları. (Haftalık 2 Saat)" },
    { week: 14, title: "Mantıksal Sorgular", description: "Karar yapıları (Eğer-İse) ile algoritmalar. (Haftalık 2 Saat)" },
    { week: 15, title: "Blok Tabanlı Programlamaya Giriş", description: "Programlama arayüzünün tanıtımı. (Haftalık 2 Saat)" },
    { week: 16, title: "İlk Programım", description: "Karakteri hareket ettirme ve temel animasyon. (Haftalık 2 Saat)" },
    { week: 17, title: "Olaylar ve Tetikleyiciler", description: "Programın klavye veya fare ile tetiklenmesi. (Haftalık 2 Saat)" },
    { week: 18, title: "Yarıyıl Değerlendirmesi", description: "Dönem boyunca öğrenilen konuların tekrarı. (Haftalık 2 Saat)" },
    { week: 19, title: "Döngüler", description: "Algoritmik yapılarda tekrar eden işlemler (Döngüler). (Haftalık 2 Saat)" },
    { week: 20, title: "Desenler ve Çizimler", description: "Döngü komutlarını kullanarak şekiller çizdirme. (Haftalık 2 Saat)" },
    { week: 21, title: "Koşullu İfadeler", description: "Eğer-İse-Değilse yapısının kullanımı. (Haftalık 2 Saat)" },
    { week: 22, title: "Mantıksal Operatörler", description: "İçiçe koşullar ve ve/veya operatörleri. (Haftalık 2 Saat)" },
    { week: 23, title: "Değişken Kavramı", description: "Programlamada değişken oluşturma ve kullanma. (Haftalık 2 Saat)" },
    { week: 24, title: "Puan Hesaplama", description: "Değişkenleri kullanarak basit bir puan sistemi yapımı. (Haftalık 2 Saat)" },
    { week: 25, title: "Senkronizasyon", description: "Haber sal ve bekle komutları ile karakter etkileşimi. (Haftalık 2 Saat)" },
    { week: 26, title: "Oyun Tasarımı", description: "Basit bir oyunun kurallarını ve senaryosunu hazırlama. (Haftalık 2 Saat)" },
    { week: 27, title: "Oyun Geliştirme 1", description: "Karakterlerin ve dekorların tasarlanması. (Haftalık 2 Saat)" },
    { week: 28, title: "Oyun Geliştirme 2", description: "Oyunun kodlanması ve test edilmesi. (Haftalık 2 Saat)" },
    { week: 29, title: "Kelime İşlemci Programları", description: "Arayüz kullanımı ve metin biçimlendirme. (Haftalık 2 Saat)" },
    { week: 30, title: "Belge Düzenleme", description: "Madde işaretleri, tablolar ve resim ekleme işlemleri. (Haftalık 2 Saat)" },
    { week: 31, title: "Sunum Programları", description: "Etkili sunum hazırlama ilkeleri ve arayüz kullanımı. (Haftalık 2 Saat)" },
    { week: 32, title: "Slayt Tasarımı", description: "Geçişler, animasyonlar ve medya ekleme. (Haftalık 2 Saat)" },
    { week: 33, title: "Araştırma Teknikleri", description: "İnternette araştırma teknikleri ve bilgi güvenilirliği. (Haftalık 2 Saat)" },
    { week: 34, title: "Dijital Ürün Geliştirme 1", description: "Dönem sonu projesi planlama ve tasarımı. (Haftalık 2 Saat)" },
    { week: 35, title: "Dijital Ürün Geliştirme 2", description: "Dönem sonu projesinin uygulanması. (Haftalık 2 Saat)" },
    { week: 36, title: "Proje Sunumları", description: "Hazırlanan projelerin sunumu ve yıl sonu değerlendirmesi. (Haftalık 2 Saat)" }
];

const grade6 = [
    { week: 1, title: "Geçmişten Geleceğe Teknoloji", description: "Bilişim teknolojilerinin gelişimi ve geleceği. (Haftalık 2 Saat)" },
    { week: 2, title: "İşletim Sistemleri", description: "İşletim sistemlerinin görevleri ve özellikleri. (Haftalık 2 Saat)" },
    { week: 3, title: "Gelişmiş Arama Teknikleri", description: "Arama motorlarında gelişmiş sorgulama yöntemleri. (Haftalık 2 Saat)" },
    { week: 4, title: "Zararlı Yazılımlar", description: "Zararlı yazılım türleri ve dijital korunma yolları. (Haftalık 2 Saat)" },
    { week: 5, title: "Bilgi Ağları", description: "İnternetin çalışma mantığı ve ağ türleri. (Haftalık 2 Saat)" },
    { week: 6, title: "Bilişim Suçları", description: "Bilişim suçları ve siber güvenliğin hukuki boyutu. (Haftalık 2 Saat)" },
    { week: 7, title: "İşbirliği Araçları", description: "Bulut depolama ve senkronizasyon. (Haftalık 2 Saat)" },
    { week: 8, title: "Ortak Çalışma", description: "Çevrimiçi ortak döküman oluşturma ve yönetme. (Haftalık 2 Saat)" },
    { week: 9, title: "İleri Düzey Problemler", description: "Algoritmalarda karmaşık yapıların çözümlenmesi. (Haftalık 2 Saat)" },
    { week: 10, title: "Alt Problemlere Ayırma", description: "Büyük problemleri parçalara bölerek çözme stratejisi. (Haftalık 2 Saat)" },
    { week: 11, title: "Elektronik Tablolamaya Giriş", description: "Elektronik tablo programlarının arayüzü ve hücre mantığı. (Haftalık 2 Saat)" },
    { week: 12, title: "Hücre İşlemleri", description: "Satır ve sütun işlemleri, veri biçimlendirme. (Haftalık 2 Saat)" },
    { week: 13, title: "Temel Formüller", description: "Toplama, ortalama, en büyük ve en küçük değer fonksiyonları. (Haftalık 2 Saat)" },
    { week: 14, title: "Veri Yönetimi", description: "Tablolarda verileri sıralama ve filtreleme. (Haftalık 2 Saat)" },
    { week: 15, title: "Veri Görselleştirme", description: "Tablolardaki verileri kullanarak grafikler oluşturma. (Haftalık 2 Saat)" },
    { week: 16, title: "Blok Tabanlı Programlama (Hatırlatma)", description: "Döngüler ve koşullu yapıların tekrarı. (Haftalık 2 Saat)" },
    { week: 17, title: "Karakter Haberleşmesi", description: "Farklı karakterlerin olaylar aracılığıyla etkileşimi. (Haftalık 2 Saat)" },
    { week: 18, title: "Yarıyıl Değerlendirmesi", description: "Dönem boyunca öğrenilen konuların tekrarı. (Haftalık 2 Saat)" },
    { week: 19, title: "Matematiksel Operatörler", description: "Değişkenler ile gelişmiş matematiksel işlemler. (Haftalık 2 Saat)" },
    { week: 20, title: "Döngülerle Karmaşık İşlemler", description: "Şartlı döngüler ve içiçe döngüler. (Haftalık 2 Saat)" },
    { week: 21, title: "Gelişmiş Değişkenler", description: "Liste yapısı ve birden fazla veri tutma. (Haftalık 2 Saat)" },
    { week: 22, title: "Alt Programlar (Fonksiyonlar)", description: "Programlamada kendi bloğunu oluşturma. (Haftalık 2 Saat)" },
    { week: 23, title: "İleri Seviye Oyun Senaryosu", description: "Oyun kurgusu, seviye tasarımı ve kurallar. (Haftalık 2 Saat)" },
    { week: 24, title: "Klonlama ve Rastgele Sayılar", description: "Programlamada klon komutları ile düşman üretimi. (Haftalık 2 Saat)" },
    { week: 25, title: "Oyun Geliştirme 1", description: "Oyun mekaniklerinin kodlanması. (Haftalık 2 Saat)" },
    { week: 26, title: "Oyun Geliştirme 2", description: "Hata ayıklama (debugging) ve iyileştirme. (Haftalık 2 Saat)" },
    { week: 27, title: "Metin Tabanlı Kodlamaya Giriş", description: "Python dili arayüzü ve temel özellikleri. (Haftalık 2 Saat)" },
    { week: 28, title: "Değişkenler ve Veri Tipleri", description: "Python'da int, float ve string kullanımları. (Haftalık 2 Saat)" },
    { week: 29, title: "Giriş/Çıkış İşlemleri", description: "Python'da print ve input komutları. (Haftalık 2 Saat)" },
    { week: 30, title: "Matematiksel İşlemler", description: "Python programlama dilinde hesaplamalar. (Haftalık 2 Saat)" },
    { week: 31, title: "Karar Yapıları", description: "Python'da If, Elif, Else kullanımı. (Haftalık 2 Saat)" },
    { week: 32, title: "Bilişim ve Toplumsal Dönüşüm", description: "Teknolojinin toplum üzerindeki etkileri. (Haftalık 2 Saat)" },
    { week: 33, title: "Yapay Zekaya Bakış", description: "Yapay zeka kavramı ve günlük hayattaki karşılığı. (Haftalık 2 Saat)" },
    { week: 34, title: "Geleceğin Teknolojileri", description: "Gelecekteki teknolojik gelişmeler ve meslekler. (Haftalık 2 Saat)" },
    { week: 35, title: "Yıl Sonu Projesi", description: "Metin tabanlı veya blok tabanlı proje tasarımı. (Haftalık 2 Saat)" },
    { week: 36, title: "Proje Sunumları", description: "Hazırlanan projelerin sunumu ve değerlendirmesi. (Haftalık 2 Saat)" }
];

async function updateCurriculum(grade, dataArray) {
  let batch = [];
  for (let i = 0; i < dataArray.length; i++) {
    const w = dataArray[i];
    const docRef = doc(db, 'curriculum', `grade_${grade}_week_${w.week}`);
    batch.push(
      setDoc(docRef, {
        gradeNumber: grade,
        week: w.week,
        title: w.title,
        description: w.description,
        activity: w.description,
        contentType: 'topic',
        createdAt: new Date()
      })
    );
  }
  await Promise.all(batch);
  console.log(`Grade ${grade} curriculum updated.`);
}

async function run() {
  await updateCurriculum(5, grade5);
  await updateCurriculum(6, grade6);
  process.exit(0);
}

run().catch(console.error);
