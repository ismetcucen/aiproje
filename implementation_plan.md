# OHEP Dojo (Sınıf Yıldızları - Puanlama Sistemi)

Bu plan, öğretmenlerin ilkokul ve ortaokul (3,4,5,6,7) öğrencilerine anlık rozet ve puan gönderebildiği oyunlaştırma modülünü (ClassDojo benzeri) içerir.

## Proposed Changes

### `src/firebase/schema.js`
- **[MODIFY]**: `awardDojoPoints(studentId, points, reason)` fonksiyonu eklenecek.
- Bu fonksiyon öğrencinin profilindeki `dojoPoints` değerini artıracak ve bildirimi tetiklemek için `lastDojoAward` adında bir obje (puan, sebep, timestamp) güncelleyecek.

### `src/components/teacher/ClassDojoBoard.jsx`
- **[NEW]**: Öğretmen ve Admin paneline eklenecek yeni kontrol arayüzü.
- Seçilen sınıfın (3-7 arası) tüm öğrencilerini Avatar ve isimleriyle kartlar halinde listeleyecek.
- Kartın üzerine tıklandığında "+1 Harika Fikir", "+2 Liderlik" gibi hazır rozet butonları çıkacak.

### `src/components/student/DojoNotificationListener.jsx`
- **[NEW]**: Öğrenci ekranında arka planda çalışan dinleyici.
- Kendi profilindeki `lastDojoAward` değiştiği an (yeni bir rozet geldiğinde) ekranın ortasında kocaman bir görsel, havai fişek animasyonu ve "Öğretmeninden +X Puan Kazandın: [Sebep]" yazısı çıkaracak.

### `src/pages/student/StudentPanel.jsx`
- **[MODIFY]**: Sol menüye öğrencinin güncel yıldız puanı eklenecek (Örn: ⭐️ 45).
- Bileşenin en altına `<DojoNotificationListener />` eklenecek.

### `src/pages/teacher/TeacherPanel.jsx` & `src/pages/admin/AdminPanel.jsx`
- **[MODIFY]**: Sol menüye "🌟 Sınıf Yıldızları" sekmesi eklenecek. Tıklandığında `ClassDojoBoard` açılacak.

## Verification Plan
1. Admin hesabından 5. sınıf seçilerek bir öğrenciye "+2 Harika Fikir" rozeti gönderilecek.
2. Öğrenci panelinde anında ekranda animasyonla rozetin belirdiği test edilecek.
3. Sol menüde öğrencinin yıldız sayısının arttığı doğrulanacak.
