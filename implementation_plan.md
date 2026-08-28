# Canlı Sınıf (Nearpod Tarzı Etkileşimli Tahta)

Bu plan, öğretmenlerin tüm öğrencilerin ekranını anlık olarak kontrol edebildiği, slayt yansıtabildiği ve kilitli sorular sorabildiği "Canlı Sınıf" modülünü açıklar.

## User Review Required

- **Görsel Boyutu:** Veritabanını yormamak adına, öğretmenin yükleyeceği görseller otomatik olarak sıkıştırılacaktır (Max ~200KB).
- **Zorunlu Soru Kilidi:** Öğretmen zorunlu soru gönderdiğinde, öğrenci uygulamanın neresinde olursa olsun (oyun oynuyor bile olsa) ekranı kilitlenecek ve cevap verene kadar hiçbir yere tıklayamayacaktır.

## Proposed Changes

### `src/firebase/schema.js`
- **[MODIFY] `schema.js`**: `live_sessions` ve `live_answers` koleksiyonları için okuma/yazma ve dinleme fonksiyonları eklenecek.
  - `startLiveSession`, `updateLiveSlide`, `askLiveQuestion`, `submitLiveAnswer`, `endLiveSession` vb.
  
### `firestore/firestore.rules`
- **[MODIFY] `firestore.rules`**: `live_sessions` ve `live_answers` koleksiyonları için gerekli güvenlik kuralları eklenecek (Öğrenci okuyabilir, öğretmen/admin yazabilir).

### `src/components/teacher/LiveClassControl.jsx`
- **[NEW] `LiveClassControl.jsx`**: Öğretmenin (veya adminin) canlı sınıfı başlattığı, görsel yüklediği (base64 sıkıştırılmış), soru sorduğu ve gelen cevapları anlık gördüğü kontrol masası.

### `src/components/student/LiveSessionLocker.jsx`
- **[NEW] `LiveSessionLocker.jsx`**: Öğrenci ekranında sürekli arka planda çalışan dinleyici (Listener). Eğer aktif bir zorunlu soru varsa, tüm ekranı kaplayan ve sadece cevap yazıldığında kapanan bir tam ekran kilit arayüzü çıkarır.

### `src/pages/teacher/TeacherPanel.jsx` & `src/pages/admin/AdminPanel.jsx`
- **[MODIFY]**: Menülere "Canlı Sınıf" (Live Class) sekmesi eklenecek ve `LiveClassControl` bileşenini render edecek.

### `src/pages/student/StudentPanel.jsx`
- **[MODIFY]**: En dış kapsayıcıya `<LiveSessionLocker />` eklenecek, böylece öğrenci hangi sekmede olursa olsun öğretmenin komutu anında ekranını kilitleyebilecek.

## Verification Plan

### Manual Verification
1. Öğretmen hesabından "Canlı Sınıf" açılacak, bir resim ve soru gönderilecek.
2. Farklı bir tarayıcıda öğrenci hesabıyla giriş yapılacak. Öğrencinin o an ekranının kilitlenip kilitlenmediği test edilecek.
3. Öğrenci cevap verdikten sonra kilidin kalktığı ve cevabın anında öğretmen ekranına düştüğü doğrulanacak.
