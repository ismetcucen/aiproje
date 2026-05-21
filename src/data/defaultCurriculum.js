// 3-10. Sınıflar İçin Yapay Zeka Müfredatı Veri Şablonu

const MODULES = [
  { id: 1, name: "Yapay Zekaya Giriş ve Temel Kavramlar", startWeek: 1, endWeek: 9 },
  { id: 2, name: "Algoritmalar ve Makine Öğrenmesi (ML)", startWeek: 10, endWeek: 18 },
  { id: 3, name: "Yapay Zeka ile Yaratıcı Üretim (Üretken AI)", startWeek: 19, endWeek: 27 },
  { id: 4, name: "Yapay Zeka Etiği, Güvenlik ve Gelecek", startWeek: 28, endWeek: 36 }
];

// Grade Groups: 3-4 (İlkokul), 5-6 (Ortaokul Giriş), 7-8 (Ortaokul İleri), 9-10 (Lise)
const CURRICULUM_TEMPLATES = {
  "3-4": [
    // Modül 1: Haftalar 1-9
    { week: 1, title: "Yapay Zeka Nedir?", desc: "Yapay zekanın ne olduğunu ve günlük hayattaki akıllı cihazları (akıllı süpürgeler, sesli asistanlar) öğreniyoruz." },
    { week: 2, title: "Robotlar ve İnsanlar", desc: "Robotların yapay zeka ile nasıl çalıştığını ve insanlardan farklarını tartışıyoruz." },
    { week: 3, title: "Çevremizdeki Akıllı Teknolojiler", desc: "Evimizde ve okulumuzda hangi cihazların yapay zeka kullandığını keşfediyoruz." },
    { week: 4, title: "Algılayıcılar (Sensörler) Dünyası", desc: "Robotların çevresini görmek, duymak ve hissetmek için kullandığı sensörleri öğreniyoruz." },
    { week: 5, title: "Komut Vermeyi Öğreniyorum", desc: "Bir bilgisayara adım adım nasıl talimat (komut) verileceğini oyunlarla deneyimliyoruz." },
    { week: 6, title: "Yapay Zeka Nasıl Görür?", desc: "Bilgisayarların kameralar yardımıyla nesneleri nasıl tanıdığını basit örneklerle inceliyoruz." },
    { week: 7, title: "Yapay Zeka Nasıl Duyar?", desc: "Konuşmalarimizi dinleyen ve kelimeleri anlayan ses tanıma teknolojilerini keşfediyoruz." },
    { week: 8, title: "Karar Verme Oyunu", desc: "Eğer-İse mantığıyla çalışan basit karar verme akışlarını oyunlaştırarak öğreniyoruz." },
    { week: 9, title: "İlk Modül Değerlendirmesi", desc: "Yapay zeka kavramlarını özetleyen eğlenceli bir bulmaca ve kısa bir taslak çalışması yapıyoruz." },
    // Modül 2: Haftalar 10-18
    { week: 10, title: "Makine Öğrenmesi Nedir?", desc: "Bilgisayarların kod yazılmadan, deneyimlerle nasıl öğrendiğini (makine öğrenmesi) keşfediyoruz." },
    { week: 11, title: "Örüntü ve Desenleri Bulma", desc: "Çevremizdeki şekil, renk ve ses kalıplarını (örüntüleri) bulma oyunları oynuyoruz." },
    { week: 12, title: "Yapay Zekaya Öğretme (Veri Ekleme)", desc: "Yapay zekanın öğrenebilmesi için görselleri ve sesleri nasıl etiketleyeceğimizi öğreniyoruz." },
    { week: 13, title: "Teachable Machine ile Tanışma", desc: "Google Teachable Machine kullanarak kendi el hareketlerimizi tanıyan bir yapay zeka eğitiyoruz." },
    { week: 14, title: "Görsel Sınıflandırma Yapalım", desc: "Kedi ve köpek resimlerini birbirinden ayıran basit bir sınıflandırma modeli hazırlıyoruz." },
    { week: 15, title: "Ses Sınıflandırma Yapalım", desc: "Farklı alkış veya ıslık seslerini tanıyan ses tabanlı bir model eğitiyoruz." },
    { week: 16, title: "Yapay Zeka Hataları", desc: "Eğittiğimiz modelin yanlış verilerle nasıl hatalı kararlar verebileceğini deneyimliyoruz." },
    { week: 17, title: "Doğru Veri Toplama Yöntemi", desc: "Daha iyi kararlar alan bir yapay zeka için temiz ve dengeli verinin önemini öğreniyoruz." },
    { week: 18, title: "Makine Öğrenmesi Sergisi", desc: "Şu ana kadar eğittiğimiz basit modelleri arkadaşlarımızla paylaşıp sunuyoruz." },
    // Modül 3: Haftalar 19-27
    { week: 19, title: "Yaratıcı Yapay Zeka Nedir?", desc: "Resim çizen, hikaye yazan üretken yapay zeka araçları hakkında ilk bilgileri alıyoruz." },
    { week: 20, title: "Yapay Zeka ile Resim Çizme", desc: "Basit kelimeler (prompt) kullanarak yapay zekaya hayalimizdeki resmi çizdiriyoruz." },
    { week: 21, title: "Kelime Sihirbazlığı (Prompt Giriş)", desc: "İstediğimiz resmi tam olarak alabilmek için yapay zekaya nasıl doğru kelimeler yazacağımızı öğreniyoruz." },
    { week: 22, title: "Ortaklaşa Hikaye Yazma", desc: "Yapay zeka ile cümle cümle paslaşarak eğlenceli bir masal veya macera hikayesi yazıyoruz." },
    { week: 23, title: "Yapay Zeka ve Müzik", desc: "Yapay zeka araçlarını kullanarak kendi kısa şarkımızı veya melodimizi üretiyoruz." },
    { week: 24, title: "Scratch AI Eklentileri Giriş", desc: "Scratch üzerinde kuklaları sesimizle veya hareketlerimizle yöneteceğimiz projeler tasarlıyoruz." },
    { week: 25, title: "Sesli Komutlu Scratch Oyunu", desc: "Scratch'te 'Yukarı' veya 'Zıpla' deyince hareket eden basit bir platform oyunu yapıyoruz." },
    { week: 26, title: "Görüntü Efektleri Projesi", desc: "Yapay zekanın yüzümüzü takip ederek ekranda maskeler veya şapkalar yerleştirdiği bir eğlence projesi yapıyoruz." },
    { week: 27, title: "Yaratıcı Proje Sunumu", desc: "Yapay zeka ile ürettiğimiz hikaye, resim veya oyunu sınıfta sergiliyoruz." },
    // Modül 4: Haftalar 28-36
    { week: 28, title: "Yapay Zeka Her Şeyi Bilir mi?", desc: "Yapay zekanın da yanılabileceğini, internetteki her bilginin doğru olmayabileceğini tartışıyoruz." },
    { week: 29, title: "Yapay Zeka Etiği Nedir?", desc: "Akıllı cihazları ve yapay zekayı kullanırken nasıl adil ve iyi davranacağımızı öğreniyoruz." },
    { week: 30, title: "Güvenli Chatbot Kullanımı", desc: "Yapay zeka sohbet robotlarıyla konuşurken kişisel bilgilerimizi (şifre, adres) neden vermememiz gerektiğini öğreniyoruz." },
    { week: 31, title: "Telif Hakkı Nedir? (Basitçe)", desc: "Yapay zekanın çizdiği resimlerin ve yazdığı yazıların kime ait olduğunu çocuk gözüyle tartışıyoruz." },
    { week: 32, title: "Yapay Zeka ve Çevre", desc: "Yapay zeka sunucularının çok enerji harcadığını ve doğayı korumak için neler yapabileceğimizi öğreniyoruz." },
    { week: 33, title: "Gelecekteki Akıllı Meslekler", desc: "Yapay zekanın gelecekte doktorlara, öğretmenlere veya itfaiyecilere nasıl yardım edeceğini hayal ediyoruz." },
    { week: 34, title: "Benim Gelecekteki Robotum", desc: "İnsanlığa yardım edecek, çevre dostu ve akıllı bir robot tasarlayıp resmini çiziyoruz." },
    { week: 35, title: "Yıl Sonu Portfolyo Hazırlığı", desc: "Yıl boyunca yaptığımız yapay zeka çalışmalarını bir araya getirip portfolyomuzu düzenliyoruz." },
    { week: 36, title: "Yıl Sonu AI Şenliği", desc: "Tüm projelerimizi, hikayelerimizi ve tasarımlarımızı okul genelinde paylaşıp kutluyoruz." }
  ],
  "5-6": [
    // Modül 1: Haftalar 1-9
    { week: 1, title: "Yapay Zekanın Tarihçesi ve Gelişimi", desc: "Yapay zekanın ilk fikirlerinden günümüzdeki modern asistanlara kadar uzanan yolculuğunu öğreniyoruz." },
    { week: 2, title: "İnsan Zekası vs. Yapay Zeka", desc: "Yaratıcılık, duygular, hız ve bellek konularında insan ile bilgisayarı karşılaştırıyoruz." },
    { week: 3, title: "Girdi, İşlem ve Çıktı Modeli", desc: "Yapay zekanın verileri nasıl topladığını (girdi), nasıl analiz ettiğini (işlem) ve ne ürettiğini (çıktı) inceliyoruz." },
    { week: 4, title: "Arama Motorları ve Yapay Zeka", desc: "Google veya YouTube gibi sistemlerin arama sonuçlarını yapay zeka ile nasıl kişiselleştirdiğini öğreniyoruz." },
    { week: 5, title: "Turing Testi Nedir?", desc: "Bir makinenin insan gibi düşünüp düşünemediğini ölçen Turing Testi kavramını oyunlarla anlıyoruz." },
    { week: 6, title: "Bilgisayarlı Görüye Giriş", desc: "Yapay zekanın pikselleri analiz ederek nesneleri, yüzleri ve engelleri nasıl ayırt ettiğini görüyoruz." },
    { week: 7, title: "Doğal Dil İşlemenin Temelleri", desc: "Sesli komutların ve metinlerin kelime kelime nasıl analiz edilip anlamlandırıldığını öğreniyoruz." },
    { week: 8, title: "Uzman Sistemler ve Karar Mekanizmaları", desc: "Belli kurallara göre teşhis veya öneri sunan ilk yapay zeka mantık modellerini inceliyoruz." },
    { week: 9, title: "Konu Özeti ve Quiz", desc: "Yapay zeka temel kavramlarını pekiştireceğimiz eğlenceli bir bilgi yarışması ve sunum hazırlığı yapıyoruz." },
    // Modül 2: Haftalar 10-18
    { week: 10, title: "Makine Öğrenmesi Yöntemleri", desc: "Denetimli (Supervised) ve Denetimsiz (Unsupervised) öğrenme farklarını temel düzeyde öğreniyoruz." },
    { week: 11, title: "Karar Ağaçları (Decision Trees)", desc: "Sorular sorarak sonuca ulaşan karar ağacı şemalarını kağıt üzerinde çiziyoruz." },
    { week: 12, title: "Veri Seti (Dataset) Nedir?", desc: "Yapay zekanın beslendiği veri setlerinin yapısını, özelliklerini ve etiketlemeyi öğreniyoruz." },
    { week: 13, title: "Teachable Machine: Gelişmiş Projeler", desc: "Teachable Machine kullanarak nesneleri ve duruşları (pose) algılayan daha karmaşık modeller eğitiyoruz." },
    { week: 14, title: "Duruş (Pose) Tanıma ile Spor Asistanı", desc: "Kamerada doğru oturuş veya spor hareketlerini algılayıp uyarı veren bir model yapıyoruz." },
    { week: 15, title: "Çöp Sınıflandırma Yapay Zekası", desc: "Geri dönüştürülebilir malzemeleri (plastik, kağıt, cam) ayırt eden bir çevre modeli tasarlıyoruz." },
    { week: 16, title: "Yapay Zekada Yanlılık (Bias)", desc: "Eğitim verisi eksik olduğunda yapay zekanın nasıl taraflı veya adaletsiz sonuçlar üretebileceğini tartışıyoruz." },
    { week: 17, title: "Veri Temizliği ve Önemi", desc: "Modellerimizi hatalı tahminlerden kurtarmak için verilerimizi nasıl düzenleyeceğimizi öğreniyoruz." },
    { week: 18, title: "Proje Sunumu ve Değerlendirme", desc: "Hazırladığımız makine öğrenmesi modellerini test edip sınıfla paylaşıyoruz." },
    // Modül 3: Haftalar 19-27
    { week: 19, title: "Üretken Yapay Zeka Araçları", desc: "Metinden görsel, ses veya tasarım üreten popüler yapay zeka araçlarını güvenli kullanmayı öğreniyoruz." },
    { week: 20, title: "Prompt Yazım Teknikleri (Prompt Engineering)", desc: "İyi bir prompt yazmak için Rol, Görev ve Format kurallarını uyguluyoruz." },
    { week: 21, title: "Yapay Zeka ile Karakter Tasarımı", desc: "Kendi yarattığımız bir oyun karakterinin özelliklerini prompt yazarak tasarlıyoruz." },
    { week: 22, title: "Yapay Zeka Destekli Kitap Yazımı", desc: "Hikayenin kurgusunu yapay zekaya planlatıp, görsellerini de yapay zekayla üreterek mini bir kitap yapıyoruz." },
    { week: 23, title: "Yapay Zeka ile Sunum Hazırlama", desc: "Yapay zeka araçlarından faydalanarak seçtiğimiz bir bilimsel konuyu anlatan şık bir slayt tasarlıyoruz." },
    { week: 24, title: "Block Tabanlı Yapay Zeka Programlama", desc: "Scratch benzeri platformlarda yapay zeka bloklarını kullanarak kodlama yapıyoruz." },
    { week: 25, title: "Akıllı Çevirmen Projesi", desc: "Söylediğimiz Türkçe kelimeleri anında 3 farklı dile çeviren sesli bir uygulama kodluyoruz." },
    { week: 26, title: "Sanat Eleştirmeni Yapay Zeka", desc: "Kameraya gösterilen resimleri inceleyip renklerini yorumlayan eğlenceli bir proje tasarlıyoruz." },
    { week: 27, title: "Yaratıcı Eserlerin Sergilenmesi", desc: "Yapay zeka yardımıyla ürettiğimiz dijital tasarımları ve hikayeleri sunuyoruz." },
    // Modül 4: Haftalar 28-36
    { week: 28, title: "Halüsinasyon (Uydurma) Kavramı", desc: "Yapay zekanın bazen doğru görünen ama tamamen uydurma olan bilgiler (halüsinasyon) üretmesini inceliyoruz." },
    { week: 29, title: "Deepfake Teknolojisi ve Tehlikeleri", desc: "Sahte ses ve video üretim teknolojilerini tanıyarak gerçeği sahteden nasıl ayırt edeceğimizi tartışıyoruz." },
    { week: 30, title: "Dijital Ayak İzi ve Gizlilik", desc: "Yapay zeka modellerinin internetteki verilerimizle nasıl eğitildiğini ve gizliliğimizi nasıl koruyacağımızı öğreniyoruz." },
    { week: 31, title: "Yapay Zeka ve Fikri Mülkiyet", desc: "Yapay zekanın internetten öğrendiği sanatçıların eserleri üzerindeki hakları etik açıdan tartışıyoruz." },
    { week: 32, title: "Yapay Zekanın Enerji Tüketimi", desc: "Büyük dil modellerini eğitmenin karbon ayak izini ve yeşil teknoloji çözümlerini inceliyoruz." },
    { week: 33, title: "Gelecekte Değişecek Meslekler", desc: "Yapay zeka ile birlikte hangi mesleklerin evrileceğini ve hangi yeni becerilere ihtiyaç duyacağımızı araştırıyoruz." },
    { week: 34, title: "Toplumsal Fayda İçin Yapay Zeka", desc: "Açlık, iklim krizi veya eğitimde fırsat eşitliği için nasıl yapay zeka projeleri geliştirilebileceğini düşünüyoruz." },
    { week: 35, title: "Portfolyo Güncelleme ve Tasarım", desc: "Dönem boyunca ürettiğimiz çalışmaları profesyonel bir portfolyo şablonuna yerleştiriyoruz." },
    { week: 36, title: "Yıl Sonu Proje Kutlaması", desc: "Geliştirdiğimiz yapay zeka projelerini jüriye (öğretmenler/arkadaşlar) sunarak tamamlıyoruz." }
  ],
  "7-8": [
    // Modül 1: Haftalar 1-9
    { week: 1, title: "Yapay Zeka ve Veri Çağı", desc: "Büyük veri (Big Data) kavramını ve yapay zekanın veriyle nasıl beslendiğini analiz ediyoruz." },
    { week: 2, title: "Algoritmik Düşünce ve Akış Şemaları", desc: "Problemleri çözmek için algoritmik adımları tasarlamayı ve akış şemalarını öğreniyoruz." },
    { week: 3, title: "Doğal Dil İşleme (NLP) Modelleri", desc: "Yapay zekanın insan dilini analiz etme yöntemlerini (tokenization, lematization vb.) öğreniyoruz." },
    { week: 4, title: "Yapay Sinir Ağlarına (Neural Networks) Giriş", desc: "İnsan beynindeki nöronlardan esinlenen yapay sinir ağlarının yapısını ve katmanlarını keşfediyoruz." },
    { week: 5, title: "Bilgisayarlı Görü ve Filtreler", desc: "Görüntü işlemede piksellerin nasıl filtrelendiğini ve kenar algılama mantığını öğreniyoruz." },
    { week: 6, title: "Öneri Sistemleri Nasıl Çalışır?", desc: "Netflix, Spotify gibi platformların bize nasıl şarkı veya film önerdiğini arkadaki algoritmalarla inceliyoruz." },
    { week: 7, title: "Ses Sentezleme ve Konuşma Teknolojileri", desc: "Yazıyı sese (TTS) ve sesi yazıya (STT) çeviren sistemlerin çalışma dinamiklerini öğreniyoruz." },
    { week: 8, title: "Akıllı Ajanlar ve IoT (Nesnelerin İnterneti)", desc: "Sensörler ve yapay zeka ile donatılmış akıllı ev ve şehir sistemlerini keşfediyoruz." },
    { week: 9, title: "Modül Sonu Değerlendirme Projesi", desc: "Öğrendiğimiz mimarileri açıklayan görsel bir şema veya sunum hazırlıyoruz." },
    // Modül 2: Haftalar 10-18
    { week: 10, title: "Regresyon ve Sınıflandırma Farkı", desc: "Sayısal tahmin yapma (Regresyon) ile gruplandırma yapma (Sınıflandırma) farkını öğreniyoruz." },
    { week: 11, title: "K-En Yakın Komşu (KNN) Algoritması", desc: "Verileri en yakın benzerlerine göre sınıflandıran KNN algoritmasını el örnekleriyle çözüyoruz." },
    { week: 12, title: "Gözetimli Öğrenme ve Etiketli Veri", desc: "Eğitim sürecinde girdi ve çıktıların önceden belli olduğu gözetimli makine öğrenmesini detaylandırıyoruz." },
    { week: 13, title: "Gözetimsiz Öğrenme ve Kümeleme", desc: "Etiketsiz verilerin kendi içindeki benzerliklere göre kümelenmesini (Clustering) öğreniyoruz." },
    { week: 14, title: "Pekiştirmeli Öğrenme (Reinforcement Learning)", desc: "Deneme-yanılma ve ödül-ceza mekanizmasıyla öğrenen yapay zeka modellerini (örn: satranç oynayan AI) inceliyoruz." },
    { week: 15, title: "Model Değerlendirme (Doğruluk Oranı)", desc: "Eğittiğimiz modelin ne kadar başarılı olduğunu ölçmeyi (Accuracy, Precision, Recall) öğreniyoruz." },
    { week: 16, title: "Aşırı Öğrenme (Overfitting) Nedir?", desc: "Yapay zekanın verileri ezberlemesi problemini ve bu hatayı nasıl önleyeceğimizi inceliyoruz." },
    { week: 17, title: "Veri Görselleştirme Teknikleri", desc: "Veri setlerini grafikler, tablolar ve şemalarla analiz etmeyi öğreniyoruz." },
    { week: 18, title: "Makine Öğrenmesi Proje Sunumu", desc: "Öğrencilerin tasarladığı özgün ML modellerinin sunulması." },
    // Modül 3: Haftalar 19-27
    { week: 19, title: "Büyük Dil Modelleri (LLM) Dünyası", desc: "ChatGPT, Gemini gibi büyük dil modellerinin çalışma prensiplerini ve mimarilerini öğreniyoruz." },
    { week: 20, title: "Gelişmiş Prompt Teknikleri (Few-Shot Prompting)", desc: "Yapay zekaya örnekler vererek (Few-Shot) daha kaliteli yanıtlar almayı deneyimliyoruz." },
    { week: 21, title: "Yapay Zeka ile Arayüz Prototipi Çizme", desc: "Fikirlerimizi web sitelerine veya mobil uygulamalara dönüştüren yapay zeka araçlarını keşfediyoruz." },
    { week: 22, title: "Etkileşimli Chatbot Tasarlama", desc: "Belirli kuralları ve bilgi tabanı olan, kullanıcı sorularını yanıtlayan bir sohbet robotu kurguluyoruz." },
    { week: 23, title: "Yapay Zeka ve Kodlama Yardımı", desc: "Kod yazarken yapay zeka asistanlarını (Copilot vb.) doğru ve etik şekilde kullanmayı öğreniyoruz." },
    { week: 24, title: "AI ile Grafik Tasarım ve İllüstrasyon", desc: "Vektörel çizimler ve profesyonel grafikler üreten yapay zekaları öğreniyoruz." },
    { week: 25, title: "Veri Analizi Yapan Yapay Zekalar", desc: "Yapay zekaya büyük veri tabloları vererek analiz ettirmeyi ve rapor hazırlatmayı öğreniyoruz." },
    { week: 26, title: "Yapay Zeka Destekli Video Kurgusu", desc: "Yazıdan video oluşturan veya videoları otomatik düzenleyen araçları keşfediyoruz." },
    { week: 27, title: "Gelişmiş Üretken AI Projesi", desc: "Tasarlanan yaratıcı medya veya yazılım projesinin tamamlanıp sunulması." },
    // Modül 4: Haftalar 28-36
    { week: 28, title: "Bilgi Dezenformasyonu ve AI", desc: "Yapay zeka ile üretilen sahte haberleri ve bunları tespit eden doğrulama araçlarını öğreniyoruz." },
    { week: 29, title: "Etik Yapay Zeka İlkeleri", desc: "Şeffaflık, adalet, hesap verebilirlik ve insan odaklı yapay zeka kavramlarını tartışıyoruz." },
    { week: 30, title: "Telif Hakları ve Lisanslama", desc: "Yapay zeka eğitiminde kullanılan verilerin yasal durumunu ve sanatçı haklarını inceliyoruz." },
    { week: 31, title: "Yapay Zekada Ayrımcılık Sorunları", desc: "Yapay zekanın geçmiş verilerden öğrenerek cinsiyet veya ırk ayrımcılığı yapması vakalarını inceliyoruz." },
    { week: 32, title: "Kişisel Verilerin Korunması Kanunu (KVKK)", desc: "Yapay zeka sistemlerine veri yüklerken yasal haklarımızı ve KVKK kurallarını öğreniyoruz." },
    { week: 33, title: "Yapay Zeka Çağında Mesleki Eğilimler", desc: "Gelecekte hangi becerilerin (eleştirel düşünme, problem çözme, prompt yazımı) önem kazanacağını öğreniyoruz." },
    { week: 34, title: "Sosyal Sorumluluk Projesi Tasarımı", desc: "Toplumsal veya çevresel bir sorunu yapay zeka kullanarak çözmeyi hedefleyen bir proje taslağı yazıyoruz." },
    { week: 35, title: "Portfolyo Web Sitesi Hazırlığı", desc: "Tüm çalışmalarımızı sergileyeceğimiz dijital bir portfolyo oluşturuyoruz." },
    { week: 36, title: "Yıl Sonu AI Sergi Sunumu", desc: "Projelerin okul topluluğu önünde sunulması ve sertifika töreni." }
  ],
  "9-10": [
    // Modül 1: Haftalar 1-9
    { week: 1, title: "Yapay Zekanın Matematiksel Temelleri", desc: "Yapay zekanın arkasındaki temel matematiksel kavramları (istatistik, olasılık, matrisler) genel hatlarıyla öğreniyoruz." },
    { week: 2, title: "Veri Bilimi Süreçleri (CRISP-DM)", desc: "Bir veri projesinin iş probleminden başlayıp dağıtıma kadar giden standart yaşam döngüsünü öğreniyoruz." },
    { week: 3, title: "Python ile Veri Analizine Giriş", desc: "Python dilinde yapay zeka için kullanılan veri kütüphanelerini (NumPy, Pandas) ve temel yapıları öğreniyoruz." },
    { week: 4, title: "Yapay Sinir Ağlarında Aktivasyon Fonksiyonları", desc: "Yapay sinir ağlarında nöronların nasıl ateşlendiğini (ReLU, Sigmoid vb.) teorik olarak öğreniyoruz." },
    { week: 5, title: "Bilgisayarlı Görüde CNN Mimarisi", desc: "Evrişimli Sinir Ağlarının (CNN) görüntüdeki özellikleri nasıl yakaladığını derinlemesine inceliyoruz." },
    { week: 6, title: "Doğal Dil İşlemede RNN ve Transformer", desc: "Metin dizilerini işleyen RNN mimarilerinden günümüzdeki Transformer (Attention) mekanizmasına geçişi öğreniyoruz." },
    { week: 7, title: "AI Donanımları: CPU vs. GPU vs. TPU", desc: "Yapay zeka modellerinin eğitilmesinde donanımların önemini ve paralelleştirme mantığını kavrıyoruz." },
    { week: 8, title: "Bulut Tabanlı AI Servisleri", desc: "Google Cloud, AWS veya Azure üzerindeki hazır yapay zeka API'lerini ve kullanım yollarını keşfediyoruz." },
    { week: 9, title: "Modül Değerlendirmesi: Teknik Makale Analizi", desc: "Popüler bir yapay zeka uygulamasının teknik mimarisini inceleyen kısa bir analiz yazıyoruz." },
    // Modül 2: Haftalar 10-18
    { week: 10, title: "Doğrusal Regresyon (Linear Regression)", desc: "En basit tahmin algoritması olan doğrusal regresyonun matematiksel mantığını öğreniyoruz." },
    { week: 11, title: "Lojistik Regresyon ve Sınıflandırma", desc: "Evet/Hayır şeklinde sınıflandırma yapan lojistik regresyon modelini öğreniyoruz." },
    { week: 12, title: "Karar Ağaçları ve Random Forest", desc: "Birden fazla karar ağacının birleşimiyle çalışan Random Forest algoritmasının çalışma şeklini inceliyoruz." },
    { week: 13, title: "K-Means Kümeleme Algoritması", desc: "Veri setlerini en uygun merkez noktalara göre gruplayan K-Means mantığını kavrıyoruz." },
    { week: 14, title: "Gradient Descent (Yokuş Aşağı İniş)", desc: "Yapay zekanın hata oranını en aza indirmek için kullandığı optimizasyon algoritmasını (Gradient Descent) öğreniyoruz." },
    { week: 15, title: "Model Test Etme ve Hata Metrikleri", desc: "MSE, R-Square, Karışıklık Matrisi (Confusion Matrix) gibi hata ölçüm yöntemlerini öğreniyoruz." },
    { week: 16, title: "Underfitting ve Overfitting Çözümleri", desc: "Ezberleme ve öğrenememe durumlarında veri artırma (data augmentation) ve regularizasyon tekniklerini öğreniyoruz." },
    { week: 17, title: "Veri Seti Hazırlama ve Ön İşleme", desc: "Kayıp verileri doldurma, normalleştirme ve kategorik verileri sayısala dönüştürmeyi öğreniyoruz." },
    { week: 18, title: "Python ile İlk ML Modelimizi Eğitelim", desc: "Hazır bir veri seti kullanarak Python'da scikit-learn ile regresyon modeli eğitiyoruz." },
    // Modül 3: Haftalar 19-27
    { week: 19, title: "Üretken Yapay Zeka ve Parametreler", desc: "Büyük dil modellerinde Temperature, Top-P gibi parametrelerin üretilen metnin yaratıcılığına etkisini öğreniyoruz." },
    { week: 20, title: "Prompt Zincirleme (Prompt Chaining)", desc: "Karmaşık görevleri çözmek için yapay zekayı adım adım yönlendiren prompt zincirleri kuruyoruz." },
    { week: 21, title: "Yapay Zeka ile Kod Geliştirme Süreçleri", desc: "GitHub Copilot benzeri araçlarla temiz kod yazma ve hata ayıklama tekniklerini uyguluyoruz." },
    { week: 22, title: "API Entegrasyonu ile Uygulama Geliştirme", desc: "Web sitemize Gemini API'sini bağlayarak kullanıcıdan girdi alan ve AI yanıtı gösteren fonksiyonlar kodluyoruz." },
    { week: 23, title: "AI Destekli Mobil Uygulama Tasarımı", desc: "Mobil prototip oluştururken kullanıcı deneyimini yapay zekayla nasıl optimize edeceğimizi öğreniyoruz." },
    { week: 24, title: "RAG (Retrieval-Augmented Generation) Nedir?", desc: "Yapay zekanın kendi bilgi sınırlarını aşarak dış belgelerden bilgi okuyup yanıt vermesi mantığını kavrıyoruz." },
    { week: 25, title: "Yapay Zeka ile Veri Madenciliği", desc: "İnternet sayfalarından veri çekme (scraping) ve bu veriyi yapay zekayla analiz etme projesi yapıyoruz." },
    { week: 26, title: "Görüntü ve Ses Üretimi Parametreleri", desc: "Stable Diffusion veya Midjourney gibi görsel üretim modellerinde tohum (seed) ve negatif prompt mantığını öğreniyoruz." },
    { week: 27, title: "Kapsamlı Yapay Zeka Uygulaması Geliştirme", desc: "Backend veya frontend katmanında yapay zeka kullanan özgün bir proje geliştiriyoruz." },
    // Modül 4: Haftalar 28-36
    { week: 28, title: "Yapay Zeka Yönetmeliği (AI Act) ve Yasalar", desc: "Avrupa Birliği Yapay Zeka Yasası gibi küresel düzenlemeleri ve yasal sınırları öğreniyoruz." },
    { week: 29, title: "Algoritmik Önyargı ve Sosyal Adalet", desc: "Yapay zekanın kredi başvurularında, işe alımlarda veya hukukta yarattığı etik krizleri analiz ediyoruz." },
    { week: 30, title: "Yapay Zeka ve Siber Güvenlik", desc: "Yapay zeka ile yapılan oltalama (phishing) saldırıları ve yapay zeka güvenliğini (prompt injection vb.) inceliyoruz." },
    { week: 31, title: "Telif Hakları ve Açık Kaynak AI", desc: "Açık kaynak kodlu modellerin (Llama, Mistral) önemini ve lisans haklarını tartışıyoruz." },
    { week: 32, title: "Yapay Zekanın İklim Değişikliğine Etkisi", desc: "Süper bilgisayarların soğutulması için harcanan su/elektrik miktarı ve yeşil yapay zeka çözümlerini inceliyoruz." },
    { week: 33, title: "Geleceğin AI Meslekleri ve Girişimcilik", desc: "AI ürün yöneticiliği, prompt mühendisliği ve yapay zeka odaklı yeni girişim fikirlerini tartışıyoruz." },
    { week: 34, title: "Toplumsal Çözüm Odaklı AI Projesi", desc: "Sosyal veya insani bir krize yapay zeka tabanlı çözüm sunan proje planı hazırlıyoruz." },
    { week: 35, title: "Profesyonel Portfolyo ve GitHub", desc: "Projelerimizi GitHub ve kişisel web sayfamızda sunarak iş/akademik başvuru portfolyosu hazırlıyoruz." },
    { week: 36, title: "Yıl Sonu Mezuniyet AI Sunumları", desc: "Geliştirilen projelerin sunumu ve geri bildirim oturumu." }
  ]
};

/**
 * Generates the complete curriculum list for Firestore seeding.
 * Maps templates to the precise grade number.
 * @returns {Array} List of curriculum documents to write.
 */
export function generateCurriculumList() {
  const result = [];
  
  // Generate for each grade from 3 to 10
  for (let grade = 3; grade <= 10; grade++) {
    let templateKey = "3-4";
    if (grade === 5 || grade === 6) templateKey = "5-6";
    else if (grade === 7 || grade === 8) templateKey = "7-8";
    else if (grade === 9 || grade === 10) templateKey = "9-10";
    
    const weeks = CURRICULUM_TEMPLATES[templateKey];
    
    weeks.forEach(item => {
      // Determine module ID and name based on week number
      const mod = MODULES.find(m => item.week >= m.startWeek && item.week <= m.endWeek) || MODULES[0];
      
      result.push({
        gradeNumber: grade,
        week: item.week,
        title: item.title,
        description: item.desc,
        moduleId: mod.id,
        moduleName: mod.name,
        contentType: grade >= 9 ? "code" : "text", // Default content type suggest
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }
  
  return result;
}

export { MODULES };
