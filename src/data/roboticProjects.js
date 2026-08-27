export const ROBOTIC_PROJECTS = [
  {
    id: 1,
    title: "🌱 Akıllı Sera",
    summary: "ESP32 tabanlı otonom sera kontrol ve izleme sistemi.",
    description: "Bu projede bitkilerin ihtiyaç duyduğu nem, sıcaklık ve su seviyelerini sürekli takip ederek otomatik sulama yapan ve verileri bir web paneli üzerinden sunan bir IoT serası geliştirilir.",
    materials: [
      "ESP32 Geliştirme Kartı",
      "Toprak Nemi Sensörü (Korozyon Dirençli)",
      "DHT11 veya DHT22 Isı ve Nem Sensörü",
      "5V Mini Su Pompası ve Silikon Hortum",
      "Röle Modülü (Pompayı kontrol etmek için)",
      "12V Güç Kaynağı ve Voltaj Düşürücü (Step-down)",
      "Jumper Kablolar ve Breadboard",
      "Plastik Kutu veya Pleksi Sera İskeleti"
    ],
    steps: [
      "Sensör Bağlantıları: DHT11 ve Toprak Nemi sensörleri ESP32'ye bağlanır.",
      "Pompa Devresi: Su pompasını tetiklemek için röle ESP32'nin dijital pinine bağlanır.",
      "Kodlama: Sensörlerden veri okuma algoritması Arduino IDE veya MicroPython ile yazılır.",
      "IoT Entegrasyonu: Firebase veya Blynk kullanılarak web/mobil üzerinden canlı veri aktarımı sağlanır.",
      "Otomasyon: Toprak nemi belirli bir seviyenin altına düştüğünde pompanın 3 saniye çalışıp durmasını sağlayan koşul blokları (if/else) koda eklenir."
    ]
  },
  {
    id: 2,
    title: "🏭 Mini Akıllı Fabrika",
    summary: "Ürün bant üzerinde ilerlerken renk/boyut sınıflandırması yapan sistem.",
    description: "Konveyör bant sistemi üzerinde ilerleyen objelerin renklerini veya boyutlarını sensör yardımıyla algılayıp, servo motor kolları ile farklı kutulara ayrıştıran endüstriyel otomasyon simülasyonu.",
    materials: [
      "Arduino Mega veya ESP32",
      "Mini Konveyör Bant Sistemi (DC Motorlu)",
      "L298N Motor Sürücü",
      "TCS3200 Renk Sensörü veya Mesafe Sensörü",
      "SG90 veya MG996R Servo Motor (2 veya 3 adet)",
      "IR (Kızılötesi) Engel Algılama Sensörü",
      "3D Baskı Ayrıştırma Kutuları ve Mekanik Parçalar"
    ],
    steps: [
      "Mekanik Kurulum: Konveyör bandı monte edilir ve DC motora L298N sürücüsü bağlanır.",
      "Sensör Konumlandırma: IR sensörü ürünün geldiğini tespit edecek şekilde bandın ortasına yerleştirilir.",
      "Sınıflandırma: Renk sensörü IR sensörün hemen yanına yerleştirilip ürünün rengi kod üzerinde analiz edilir.",
      "Ayrıştırma Kolları: Servo motorlar belirlenen açılara dönerek bandın sonundaki ürünü sağa veya sola (ilgili kutuya) iter.",
      "Sistem Testi: Bant sürekli çalışırken gelen nesnelerin %95 doğrulukla ayrıştırılması için sensör kalibrasyonu yapılır."
    ]
  },
  {
    id: 3,
    title: "🚗 Otonom Araç",
    summary: "Çizgi izleyen, engelden kaçan ve trafik ışığı okuyan yapay zeka destekli araç.",
    description: "Klasik bir çizgi izleyen robotun çok ötesinde, üzerindeki kamera modülü sayesinde trafik işaretlerini (dur tabelası, kırmızı ışık) tanıyıp kurallara uygun hareket eden mini otonom araç.",
    materials: [
      "Raspberry Pi 4 veya ESP32-CAM",
      "Arduino Uno (Alt şasi kontrolü için)",
      "Robot Araba Şasisi (4 Tekerli, 4 DC Motorlu)",
      "L298N Motor Sürücü",
      "TCRT5000 Çizgi İzleme Sensörü (3'lü veya 5'li modül)",
      "HC-SR04 Ultrasonik Mesafe Sensörü",
      "Kamera Modülü (Pi Camera veya OV2640)",
      "18650 Lipo Pil ve Pil Yuvası"
    ],
    steps: [
      "Şasi Montajı: Motorlar, tekerlekler, sürücü kartı ve Arduino araca monte edilir.",
      "Çizgi İzleme ve Engel Algılama: Sensörlerle siyah çizgiyi takip eden ve engele 10cm kala duran temel PID algoritması yazılır.",
      "Görüntü İşleme: Kamera modülü sisteme entegre edilerek OpenCV veya Teachable Machine ile trafik ışığı/dur tabelası eğitilir.",
      "Haberleşme: Raspberry Pi görüntü analizini yapıp Arduino'ya (İleri/Dur/Yavaşla) komutlarını gönderir.",
      "Saha Testi: Hazırlanan bir maket yolda aracın otonom sürüş kapasitesi test edilir."
    ]
  },
  {
    id: 4,
    title: "🦾 Robotik Kol",
    summary: "Kamera yardımıyla nesne algılayıp taşıyan robotik manipülatör.",
    description: "İnsan kolu hareketlerini simüle eden, üzerine yerleştirilen bir yapay zeka modülüyle önüne konan nesnenin ne olduğunu (Örn: elma mı çöp mü?) algılayıp onu doğru yere taşıyan proje.",
    materials: [
      "4 Eksenli Robot Kol Şasisi (Pleksi veya 3D Baskı)",
      "4 x SG90 veya MG996R Servo Motor",
      "Arduino Uno",
      "PCA9685 16-Kanal PWM Servo Sürücü (Gerekirse)",
      "Webcam veya AI Vizyon Sensörü (HuskyLens vb.)",
      "Joystick Modülü (Manuel kontrol için)",
      "5V 3A Harici Güç Kaynağı"
    ],
    steps: [
      "Mekanik Toplama: Robot kolun omuz, dirsek, bilek ve kıskaç kısımlarına servo motorlar takılarak birleştirilir.",
      "Manuel Kontrol (Test): İlk aşamada joystick modülü ile motorların 0-180 derece limitleri ve hassasiyetleri ayarlanır.",
      "Kinematik Hesaplama: Kolun uzayda (x, y, z) hedefe tam ulaşabilmesi için basit ters kinematik fonksiyonları yazılır.",
      "AI Entegrasyonu: AI kamerası hedef objenin x-y koordinatını bulup Arduino'ya seri port üzerinden yollar.",
      "Otomasyon: Robot koldan, objenin olduğu konuma gidip nesneyi kıskacıyla tutarak belirnen depolama noktasına bırakması istenir."
    ]
  },
  {
    id: 5,
    title: "🚨 Arama-Kurtarma Robotu",
    summary: "Zorlu arazilerde canlı tespiti yapan tekerlekli/paletli robot.",
    description: "Deprem, yangın veya doğal afet simülasyonlarında enkaz altında kalanları aramak üzere tasarlanmış, kamera ve çevresel sensörlerle donatılmış uzaktan kontrollü robot.",
    materials: [
      "Paletli Tank Şasisi veya Arazi Tekerlekleri",
      "ESP32-CAM",
      "L298N Motor Sürücü",
      "DHT11 (Sıcaklık) ve MQ-2 (Gaz/Duman) Sensörü",
      "PIR Sensörü (Hareket Algılama)",
      "Yüksek Güçlü LED El Feneri (Karanlık için)",
      "Buzzer (Siren için)"
    ],
    steps: [
      "Araç Dinamikleri: Paletli şasiye motorlar bağlanır, her iki tarafın (sağ ve sol) bağımsız hız kontrolü yapılarak tank dönüşü (spin) kodlanır.",
      "Telemetri (Veri) Sistemi: Gaz ve sıcaklık sensöründen alınan veriler ESP32 üzerinden anlık olarak web paneline yansıtılır.",
      "Kamera Sistemi: ESP32-CAM modülü ile WiFi üzerinden anlık canlı görüntü aktarımı (stream) sağlanır.",
      "Canlı Tespiti: PIR sensörü bir hareket algıladığında web panelinde kırmızı uyarı çıkar ve robot siren çalmaya başlar.",
      "Kontrol Paneli: Bilgisayarın yön tuşları veya mobildeki butonlar ile aracı uzaktan sürebilmek için HTML/JS arayüzü yazılır."
    ]
  },
  {
    id: 6,
    title: "🅿️ Akıllı Otopark",
    summary: "Araç algılama, otomatik bariyer ve boş yer göstergeli otopark.",
    description: "Bir alışveriş merkezi veya site otoparkının maket versiyonu. Kapıda plakayı veya aracı görünce açılan bariyer ve içerideki boş/dolu park alanlarını ekranda gösteren sistem.",
    materials: [
      "Arduino Mega",
      "Servo Motor (Bariyer için)",
      "RFID Okuyucu veya IR Engel Sensörü (Giriş Tespiti için)",
      "Çoklu LDR veya Ultrasonik Sensör (Her park yeri için 1 adet)",
      "I2C LCD Ekran (2x16 veya 4x20)",
      "Kırmızı ve Yeşil LED'ler",
      "Maket Karton veya Ahşap Otopark Zemin"
    ],
    steps: [
      "Park Yerlerinin Hazırlanması: Maket üzerinde 4 adet park yeri çizilir, her birine 1 adet sensör ve durum LED'i (kırmızı/yeşil) yerleştirilir.",
      "Giriş Kapısı: Kapıya bariyer olarak servo motor ve araç geldiğini algılaması için giriş sensörü konulur.",
      "Mantıksal Kodlama: Araç bir park yerine girdiğinde (sensör mesafesi azaldığında) o yerin LED'i kırmızı yanar ve boş yer sayısı 1 azaltılır.",
      "LCD Ekran: Ekranda sürekli 'Toplam Boş Yer: X' yazar. Boş yer kalmadıysa ekranda 'OTOPARK DOLU' yazar ve bariyer kimseye açılmaz.",
      "Optimizasyon: Aynı aracı iki kere saymamak için koda gecikme (debounce) süreleri eklenir."
    ]
  },
  {
    id: 7,
    title: "🏠 Akıllı Ev",
    summary: "Sensörler ve IoT tabanlı tam otomatik ev otomasyonu.",
    description: "Kapı güvenliğinden otomatik perde sistemine, yangın alarmından sesle açılan lambalara kadar modern bir akıllı evin kapsamlı maket projesi.",
    materials: [
      "ESP8266 veya ESP32 Geliştirme Kartı",
      "MQ-2 Gaz Sensörü (Mutfak için)",
      "Su Seviye Sensörü (Su baskını için)",
      "LDR (Işık sensörü) ve Servo (Perdeler için)",
      "RFID (Giriş kapısı şifresi için)",
      "Röle Modülü (Ev ışıkları/220V simülasyonu için)",
      "Ahşap Maket Ev Şasisi"
    ],
    steps: [
      "Giriş Güvenliği: Evin kapısına RFID okuyucu takılır. Sadece tanımlı anahtarlık okutulduğunda kapı servosu (kilit) açılır.",
      "İklimlendirme ve Aydınlatma: Hava karardığında (LDR) evin lambaları otomatik yanar. Çok aydınlıksa perdeler çekilir.",
      "Afet Güvenliği: Gaz sızıntısı veya su baskını olduğunda sistem alarm verir ve internet üzerinden kullanıcının cep telefonuna bildirim yollar.",
      "IoT Kontrolü: Evin tüm sistemlerini manuel kapatıp açabilmek için Blynk veya yerel bir web sunucusu üzerinden kontrol ekranı yapılır.",
      "Sesli Komut (Opsiyonel): Sisteme bir mikrofon eklenerek veya cep telefonu asistanı ile bağlanarak 'Işıkları Aç' komutu entegre edilir."
    ]
  },
  {
    id: 8,
    title: "♿ Engelli Destek Sistemi",
    summary: "Görme/İşitme engelli bireyler için giyilebilir teknolojik yardımcılar.",
    description: "Örneğin, görme engelliler için bir 'Akıllı Baston' (önüne çıkan engeli titreşimle bildiren) veya işitme engelliler için sesleri titreşime dönüştüren bir bileklik prototipi.",
    materials: [
      "Arduino Nano veya Giyilebilir Kart (LilyPad)",
      "HC-SR04 Ultrasonik Sensör",
      "Titreşim Motoru Modülü",
      "Buzzer",
      "Pil Yuvası ve Anahtar (Switch)",
      "Baston, Şapka veya Bileklik (Giyilebilir Şasi)"
    ],
    steps: [
      "Tasarım Kararı: Projenin bir akıllı baston mu yoksa şapka/gözlük eklentisi mi olacağına karar verilir.",
      "Montaj: Mesafe sensörü karşıyı (veya yeri) görecek şekilde, titreşim motoru ise kullanıcının parmağına temas edecek şekilde yerleştirilir.",
      "Algoritma: 100cm'de yavaş titreşim, 50cm'de orta, 20cm'den yakında sürekli titreşim (veya ses) verecek şekilde eşik değerleri kodlanır.",
      "Güç Tüketimi: Sistemin pille uzun süre çalışabilmesi için gereksiz yere ölçüm yapması engellenir (uyku modları).",
      "Test ve Gerçek Hayat Senaryosu: Gözler kapatılarak koridorda bir labirent parkuru test edilir ve algılama hassasiyeti optimize edilir."
    ]
  },
  {
    id: 9,
    title: "🌍 Çevre İzleme Sistemi",
    summary: "Güneş enerjili hava kalitesi ve çevre verisi ölçüm istasyonu.",
    description: "Okulun bahçesine veya penceresine kurulacak, hava kirliliğini (PM2.5, CO2), sıcaklığı, nemi, UV ışınlarını sürekli ölçüp analiz eden hava durumu istasyonu.",
    materials: [
      "ESP32 veya ESP8266",
      "MQ-135 Hava Kalitesi (Gaz) Sensörü",
      "BME280 (Sıcaklık, Nem ve Basınç)",
      "UV Sensörü",
      "Güneş Paneli (5V) ve Lityum Şarj Modülü (TP4056)",
      "Lityum İyon 18650 Pil",
      "Su Geçirmez Dış Mekan Kutu"
    ],
    steps: [
      "Enerji Sistemi: Güneş paneli TP4056 şarj devresine bağlanır, devre hem pili şarj eder hem de ESP32'yi besler.",
      "Sensör Okumaları: BME280, MQ-135 ve UV sensöründen veriler kalibre edilerek sayısal değerlere dönüştürülür.",
      "Veritabanı Kaydı: Cihaz okulun Wi-Fi ağına bağlanır ve okuduğu verileri her 5 dakikada bir Firebase veya ThingSpeak'e kaydeder.",
      "Veri Analizi Gösterge Paneli: Toplanan veriler bir web sitesinde çizgi grafikleri halinde günlük, haftalık, aylık olarak çizdirilir.",
      "Uyarı Sistemi: Hava kalitesi sağlığa zararlı seviyeye ulaştığında sistem otomatik uyarı mesajı üretir."
    ]
  },
  {
    id: 10,
    title: "🤖 AI Robot",
    summary: "Nesneyi görüp tanıyan ve karar mekanizması işleten zeki asistan.",
    description: "Önceden belirlenmiş kod blokları yerine etrafındaki objeleri kamera ile tanıyarak ('Bu bir kitap', 'Bu bir su şişesi') kendi kararını veren ve iletişim kuran insansı/mobil robot.",
    materials: [
      "Raspberry Pi 4 veya güçlü geliştirme kartı",
      "USB veya Pi Kamera Modülü",
      "Hoparlör ve USB Mikrofon",
      "DC Motorlu Mobil Şasi veya Servo Eklem (Kafa hareketi)",
      "Görüntü İşleme Yazılımı (OpenCV + YOLO veya SSD)",
      "LLM/API Bağlantısı (OpenAI API vb.)"
    ],
    steps: [
      "Görme Yeteneği (Computer Vision): Kameradan alınan canlı görüntü üzerinden nesne tespiti (YOLO algoritması) çalıştırılır.",
      "Duyma ve Konuşma (NLP): Mikrofon üzerinden ortam sesi metne (Speech-to-Text), verilen yanıt da sese (Text-to-Speech) çevrilir.",
      "Karar Mekanizması: Robot bir şişe algıladığında ve öğrenci 'Bana onu getir' dediğinde nesne koordinatını hesaplayıp o yöne ilerler.",
      "Yapay Zeka Sohbeti: Robotun arka planında bir Büyük Dil Modeli (ChatGPT) çalışır, böylece sorulan herhangi bir soruya sesli mantıklı cevap verir.",
      "Gelişmiş Etkileşim: Kişi yüz tanıma ile sisteme kaydedilir, robot kişiyi görünce ismiyle hitap eder."
    ]
  }

  ,
  {
    id: 11,
    title: "♻️ Akıllı Geri Dönüşüm Kutusu (AI Çöp Kutusu)",
    summary: "Atıkları kamerasından tanıyarak doğru bölmeye ayıran yapay zeka destekli sistem.",
    description: "Öğrencilerin Teachable Machine veya OpenCV kullanarak plastik, kağıt, metal ve camı eğittiği, kameranın atığı tanıdıktan sonra servo motor ile doğru hazneyi açtığı yenilikçi bir çevre STEM projesi.",
    materials: [
      "Raspberry Pi veya ESP32-CAM",
      "Kamera Modülü",
      "Servo Motor (Kapak veya yönlendirici rampa için)",
      "Ultrasonik Sensör (Çöp kutusunun doluluğunu ölçmek için)",
      "Karton, Ahşap veya 3D Baskı Çöp Kutusu Şasisi"
    ],
    steps: [
      "Model Eğitimi: Yapay zeka aracılığıyla farklı çöp türlerinin yüzlerce fotoğrafı çekilerek görüntü işleme modeli eğitilir.",
      "Mekanik Sistem: Ana giriş hunisine konan çöpün, motorun dönmesiyle ilgili alt hazneye düşmesini sağlayacak rampa inşa edilir.",
      "Otomasyon: Kamera çöpü gördüğünde yapay zeka modeline sorar, gelen 'Plastik' cevabına göre servo motor rampayı plastik haznesine çevirir.",
      "Akıllı Uyarı: Herhangi bir hazne dolduğunda (Ultrasonik sensör ölçümü) LCD ekranda veya web panelinde 'Kutu Doldu' uyarısı verilir."
    ]
  },
  {
    id: 12,
    title: "☀️ Güneş Takipli Enerji Sistemi (Solar Tracker)",
    summary: "Verimliliği artırmak için güneşi (ışığı) otonom takip eden güneş paneli.",
    description: "Sürdürülebilir enerji mantığını kavramak için tasarlanmış, üzerindeki ışık sensörleri sayesinde her zaman en parlak ışık kaynağına (Güneş'e) yönelen 2 eksenli mekanizma.",
    materials: [
      "Arduino Uno",
      "4 adet LDR (Işık Bağımlı Direnç)",
      "2 adet SG90 Mini Servo Motor (X ve Y ekseni için)",
      "Mini Güneş Paneli (5V)",
      "Pan-Tilt Servo Braketi (3D Baskı veya Pleksi)",
      "Multimetre (Üretilen enerjiyi ölçmek için)"
    ],
    steps: [
      "Pan-Tilt Montajı: İki servo motor birbirine dik olacak şekilde (sağ-sol ve yukarı-aşağı) monte edilir.",
      "Sensör Yerleşimi: Güneş panelinin dört köşesine (veya aralarına artı şeklinde engel koyarak) 4 adet LDR yerleştirilir.",
      "Algoritma: Arduino LDR'lerden gelen ışık değerlerini okur. Örneğin sol taraf daha aydınlıksa yatay motoru sola döndürür.",
      "Analiz ve STEM Çıktısı: Öğrenciler, sabit duran bir panel ile güneşi takip eden panelin ürettiği enerjiyi multimetre ile ölçüp verimlilik farkını matematiksel olarak hesaplar."
    ]
  },
  {
    id: 13,
    title: "🫀 Giyilebilir Sağlık Asistanı",
    summary: "Nabız, sıcaklık ve düşme algılaması yapan akıllı saat/bileklik prototipi.",
    description: "Biyomedikal mühendisliğine giriş niteliğinde olan bu projede, kullanıcının hayati verilerini okuyan ve tehlike anında (örn: düşme) uyarı veren bir cihaz tasarlanır.",
    materials: [
      "ESP8266 veya Arduino Nano",
      "MAX30102 Kalp Atışı (Nabız) ve Oksijen Sensörü",
      "MPU6050 İvmeölçer ve Jiroskop (Düşme tespiti için)",
      "0.96 inch OLED Ekran",
      "Buzzer ve Titreşim Motoru",
      "Kumaş veya cırt cırtlı bant (Bileklik tasarımı için)"
    ],
    steps: [
      "Donanım Testi: Sensörler tek tek test edilip parmaktan doğru nabız değeri ve bilekten eğim verisi okunur.",
      "Arayüz Tasarımı: OLED ekranda anlık nabız ve durum ikonları (Kalp atışı animasyonu) kodlanır.",
      "Düşme Algoritması (Fall Detection): İvmeölçer verisinde ani bir serbest düşüş ve durma tespit edilirse sistem acil durum moduna geçer.",
      "IoT Bildirimi: Eğer cihaz WiFi ağına bağlıysa, düşme anında belirlenen bir e-posta adresine veya telefona otomatik acil durum mesajı yollanır."
    ]
  },
  {
    id: 14,
    title: "🛸 Mars Rover (Uzay Keşif Aracı)",
    summary: "Zorlu arazilerde devrilmeden ilerleyen rocker-bogie süspansiyonlu gezgin.",
    description: "NASA'nın Curiosity ve Perseverance araçlarında kullandığı mekanik yapıyı (Rocker-Bogie) öğreten, topraktan nem/gaz analizi yapabilen uzaktan kumandalı veya otonom araştırma robotu.",
    materials: [
      "Rocker-Bogie Şasisi (6 tekerlekli, 3D baskı ile üretilmesi önerilir)",
      "6 adet DC Redüktörlü Motor",
      "Motor Sürücü (L298N veya PCA9685)",
      "Arduino Mega + Bluetooth (HC-05) modülü",
      "Toprak Nemi, DHT11 Sıcaklık ve MQ Gaz Sensörleri",
      "Mini Robot Kol Eklem (Toprak numunesi almak için)"
    ],
    steps: [
      "Mekanik ve Süspansiyon: 6 tekerlekli rocker-bogie mekanizması kurulur (Bu mekanizma aracın engelleri devrilmeden aşmasını sağlar).",
      "Hareket Kontrolü: 6 motorun senkronize ileri-geri hareketleri Bluetooth üzerinden telefondan kontrol edilecek şekilde programlanır.",
      "Veri Toplama: Robot zorlu bir engelin üzerine çıkarılır ve o noktadaki toprağa sensörlerini batırarak değer okur.",
      "Telemetri İstasyonu: Okunan veriler tıpkı bir uzay üssündeymiş gibi bilgisayar ekranındaki gösterge paneline yansıtılır."
    ]
  },
  {
    id: 15,
    title: "🪴 Topraksız Tarım (Hydroponics) İstasyonu",
    summary: "Su, ışık ve PH seviyesini otomatik ayarlayan akıllı laboratuvar serası.",
    description: "Geleceğin tarım teknolojilerini (AgriTech) öğreten bu projede, bitkiler toprak olmadan sadece besinli su ve yapay fotosentez ışıklarıyla büyütülür.",
    materials: [
      "ESP32 Geliştirme Kartı",
      "Su Pompası ve Hortumlar",
      "PH Sensörü ve Su Sıcaklığı Sensörü",
      "Grow Light (Bitki Büyütme) LED Şeritleri (Kırmızı/Mavi tayf)",
      "Ultrasonik Sensör (Su deposunun seviyesini ölçmek için)",
      "Röle Modülü (LED ve Pompa kontrolü için)",
      "PVC Borular veya Plastik Saklama Kapları"
    ],
    steps: [
      "Sistem Kurulumu: Suyun PVC borular içinden devridaim yapacağı hidroponik altyapı maketi kurulur.",
      "Aydınlatma (Fotosentez): Röle kullanılarak Grow LED'lerin günde sadece belirli saatlerde (Örn: sabah 8, akşam 8 arası) yanması kodlanır.",
      "Sıvı Kontrolü: Su seviyesi azaldığında uyarı verilir, su sıcaklığı ve PH değerleri periyodik ölçülüp kaydedilir.",
      "Biyolojik Gözlem: Öğrenciler sistemin içine marul veya fesleğen tohumu eker ve normal toprakla büyüyen bitki ile büyüme hızlarını kıyaslayarak bilimsel rapor hazırlar."
    ]
  }
];
];
