import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  generateContentWithFallback, 
  testGeminiApiKey, 
  resolveGeminiApiKey,
  TEKNOFEST_SYSTEM_PROMPT 
} from '../../utils/geminiService';
import { 
  saveProjectAssistantDraft, 
  getProjectDraftsByStudent, 
  getAllProjectDraftsForSchool,
  deleteProjectAssistantDraft,
  updateSchoolSettings,
  getSchoolSettings
} from '../../firebase/schema';

// TEKNOFEST & TÜBİTAK Kategorileri
const COMPETITIONS = [
  { id: 'teknofest', name: 'TEKNOFEST Havacılık, Uzay ve Teknoloji Festivali', icon: '🚀' },
  { id: 'tubitak_2204_b', name: 'TÜBİTAK 2204-B Ortaokul Araştırma Projeleri', icon: '🔬' },
  { id: 'tubitak_2204_a', name: 'TÜBİTAK 2204-A Lise Araştırma Projeleri', icon: '🧪' },
  { id: 'etwinning', name: 'eTwinning & Erasmus+ İnovasyon Projesi', icon: '🌍' },
];

const TEKNOFEST_CATEGORIES = [
  'İnsanlık Yararına Teknoloji (Sağlık, Afet, Sosyal İnovasyon)',
  'Akıllı Ulaşım & Otonom Sistemler',
  'Eğitim Teknolojileri',
  'Tarım & Çevre Teknolojileri',
  'Engelsiz Yaşam Teknolojileri',
  'Yapay Zekâ ve Veri Bilimi',
  'Akıllı Şehirler & Enerji Verimliliği',
  'Robotik ve Mekatronik Sistemler',
  'Siber Güvenlik & Blokzincir'
];

const STEPS = [
  { num: 1, title: 'Kategori & Kapsam', icon: '🎯', desc: 'Yarışma, alan ve hedef kitle seçimi' },
  { num: 2, title: 'Problem & Çözüm', icon: '💡', desc: 'Gerçek dünya sorunu ve yenilikçi fikir' },
  { num: 3, title: 'Özgün Değer', icon: '🌟', desc: 'Benzer projelerden farkı ve literatür' },
  { num: 4, title: 'Teknik Altyapı', icon: '⚙️', desc: 'Mikrodenetleyici, sensör ve yazılım mimarisi' },
  { num: 5, title: 'Resmi Rapor Taslağı', icon: '📄', desc: 'Ön Değerlendirme raporu çıktısı' },
  { num: 6, title: 'Sanal Jüri', icon: '⚖️', desc: 'Zorlu sorular ve puanlama simülasyonu' },
];

export default function TeknofestAssistant({ isTeacher = false, initialDraft = null }) {
  const { user, profile } = useAuth();
  
  // Proje Form Verisi
  const [currentStep, setCurrentStep] = useState(1);
  const [activeDraftId, setActiveDraftId] = useState(null);
  const [projectData, setProjectData] = useState({
    title: '',
    competition: 'teknofest',
    category: 'İnsanlık Yararına Teknoloji (Sağlık, Afet, Sosyal İnovasyon)',
    targetAudience: 'Ortaokul / Lise',
    problemStatement: '',
    solutionIdea: '',
    literatureReview: '',
    innovativeAspect: '',
    hardwareComponents: '',
    softwareStack: '',
    systemArchitecture: '',
    reportDraft: '',
    juryFeedback: ''
  });

  // UI Durumları
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResponseToast, setAiResponseToast] = useState('');

  // API Anahtarı Yönetimi
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keyTestStatus, setKeyTestStatus] = useState(null);

  // Proje Listesini Yükle
  useEffect(() => {
    if (user?.uid) {
      loadDrafts();
    }
  }, [user]);

  useEffect(() => {
    if (initialDraft) {
      handleSelectDraft(initialDraft);
    }
  }, [initialDraft]);

  async function loadDrafts() {
    try {
      if (isTeacher) {
        const drafts = await getAllProjectDraftsForSchool(profile?.schoolCode);
        setSavedDrafts(drafts);
      } else {
        const drafts = await getProjectDraftsByStudent(user.uid);
        setSavedDrafts(drafts);
      }
    } catch (err) {
      console.error('Taslaklar yüklenirken hata:', err);
    }
  }

  // Otomatik / Manuel Kaydet
  async function handleSave(silent = false) {
    if (!user?.uid) return;
    if (!projectData.title.trim() && !projectData.problemStatement.trim()) {
      if (!silent) alert('Kaydetmeden önce lütfen en azından bir Proje Başlığı veya Problem yazın.');
      return;
    }

    setSaving(true);
    try {
      const draftPayload = {
        ...(activeDraftId ? { id: activeDraftId } : {}),
        userId: user.uid,
        userFullName: profile?.fullName || user.email || 'Öğrenci',
        schoolCode: profile?.schoolCode || 'global_school',
        currentStep,
        ...projectData,
      };

      const savedId = await saveProjectAssistantDraft(draftPayload);
      if (!activeDraftId) setActiveDraftId(savedId);
      
      setSaveMessage('✓ Buluta kaydedildi');
      loadDrafts();
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      setSaveMessage('⚠️ Kayıt başarısız oldu');
    } finally {
      setSaving(false);
    }
  }

  function handleSelectDraft(draft) {
    setActiveDraftId(draft.id);
    setProjectData({
      title: draft.title || '',
      competition: draft.competition || 'teknofest',
      category: draft.category || TEKNOFEST_CATEGORIES[0],
      targetAudience: draft.targetAudience || 'Ortaokul / Lise',
      problemStatement: draft.problemStatement || '',
      solutionIdea: draft.solutionIdea || '',
      literatureReview: draft.literatureReview || '',
      innovativeAspect: draft.innovativeAspect || '',
      hardwareComponents: draft.hardwareComponents || '',
      softwareStack: draft.softwareStack || '',
      systemArchitecture: draft.systemArchitecture || '',
      reportDraft: draft.reportDraft || '',
      juryFeedback: draft.juryFeedback || ''
    });
    setCurrentStep(draft.currentStep || 1);
    setShowDraftsModal(false);
  }

  function handleNewProject() {
    if (confirm('Yeni bir proje başlatmak istiyor musunuz? (Mevcut kaydedilmemiş değişiklikler sıfırlanır)')) {
      setActiveDraftId(null);
      setCurrentStep(1);
      setProjectData({
        title: '',
        competition: 'teknofest',
        category: TEKNOFEST_CATEGORIES[0],
        targetAudience: 'Ortaokul / Lise',
        problemStatement: '',
        solutionIdea: '',
        literatureReview: '',
        innovativeAspect: '',
        hardwareComponents: '',
        softwareStack: '',
        systemArchitecture: '',
        reportDraft: '',
        juryFeedback: ''
      });
    }
  }

  async function handleDeleteDraft(id, e) {
    e.stopPropagation();
    if (confirm('Bu proje taslağını silmek istediğinize emin misiniz?')) {
      await deleteProjectAssistantDraft(id);
      if (activeDraftId === id) {
        handleNewProject();
      }
      loadDrafts();
    }
  }

  // --- YAPAY ZEKA DANIŞMAN ENTEGRASYONLARI ---

  // 1. Problem ve Çözüm Fikrini Geliştirme (Sokratik Rehber)
  async function aiRefineProblemSolution() {
    if (!projectData.problemStatement.trim() && !projectData.solutionIdea.trim()) {
      alert('Lütfen önce aklınızdaki problem veya çözüm fikrinden en az birkaç cümle yazın.');
      return;
    }
    setAiLoading(true);
    setAiError('');

    const prompt = `Yarışma: ${projectData.competition.toUpperCase()}
Kategori: ${projectData.category}
Hedef Kitle: ${projectData.targetAudience}
Mevcut Proje Adı: ${projectData.title || 'Henüz belirlenmedi'}

Öğrencinin Problem Tanımı:
"${projectData.problemStatement}"

Öğrencinin Çözüm Fikri:
"${projectData.solutionIdea}"

GÖREV:
1. Öğrencinin yazdığı problemi ve çözümü incele.
2. Problemi daha çarpıcı, istatistiksel ve bilimsel bir dille yeniden ifade et.
3. Çözüm fikrini TEKNOFEST jürisinin aradığı kriterlere (Uygulanabilirlik, Yerlilik, Fayda) uygun olacak şekilde zenginleştir.
4. Bu projeye 3 adet etkileyici ve akılda kalıcı Proje Başlığı (İsim) öner.
5. Öğrenciye projesini daha da güçlendirmesi için 2 adet yönlendirici soru sor.

Lütfen yanıtını temiz markdown başlıklarıyla (###) Türkçe olarak ver.`;

    try {
      const result = await generateContentWithFallback({ prompt });
      setAiResponseToast('Yapay Zeka Danışmanı fikirlerinizi analiz etti!');
      setProjectData(prev => ({
        ...prev,
        solutionIdea: prev.solutionIdea + '\n\n---\n🤖 AI DANIŞMAN ÖNERİLERİ:\n' + result.text
      }));
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  // 2. Özgün Değer ve Benzer Projeler Analizi
  async function aiAnalyzeOriginality() {
    if (!projectData.solutionIdea.trim()) {
      alert('Lütfen önce 2. Adımda çözüm fikrinizi oluşturun veya doldurun.');
      return;
    }
    setAiLoading(true);
    setAiError('');

    const prompt = `Yarışma: ${projectData.competition.toUpperCase()}
Kategori: ${projectData.category}
Proje: ${projectData.title}
Çözüm Açıklaması: ${projectData.solutionIdea}

GÖREV:
1. Piyasada veya geçmiş TEKNOFEST/TÜBİTAK yarışmalarında benzer ne tür çözümler var? Bunların eksik yönleri (gap / açık) neler?
2. Bizim projemizi bu benzerlerden ayıran "Özgün Değer (Yenilikçi Yön)" tam olarak ne olabilir? (Sensör seçimi mi, yerli yazılım mı, düşük maliyet mi, yapay zeka algoritması mı?)
3. Raporun "Özgün Değer ve Benzerlerinden Farkı" bölümüne yazılabilecek resmi bir akademik paragraf yaz.`;

    try {
      const result = await generateContentWithFallback({ prompt });
      setProjectData(prev => ({
        ...prev,
        innovativeAspect: result.text
      }));
      setAiResponseToast('Özgün Değer analizi tamamlandı!');
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  // 3. Teknik Mimari ve Donanım Önerisi
  async function aiSuggestHardwareSoftware() {
    if (!projectData.solutionIdea.trim()) {
      alert('Lütfen önce projenizin ne yapacağını (Çözüm fikri) yazın.');
      return;
    }
    setAiLoading(true);
    setAiError('');

    const prompt = `Yarışma: ${projectData.competition}
Kategori: ${projectData.category}
Proje Fikri: ${projectData.solutionIdea}
Özgün Yönü: ${projectData.innovativeAspect}

GÖREV:
Bu projenin prototipini üretmek için en uygun, maliyet etkin ve okullarda kolay bulunabilen teknik bileşenleri listele:
1. **Mikrodenetleyici & Kart Önerisi:** (Örn: ESP32-WROOM, Arduino Uno, Raspberry Pi 4, STM32 vb. hangisi neden?)
2. **Kullanılacak Sensör ve Modüller:** (Örn: Sıcaklık, MQ gaz sensörü, Ultrasonik, Kamera modülü, LoRa, GPS vb.)
3. **Yazılım & Algoritma Mimarisi:** (Python, C++ / Arduino IDE, React / Web Arayüzü, Mobil Uygulama, TinyML veya TensorFlow Lite vb.)
4. **Veri Akış Şeması:** (Sensör -> ESP32 -> Bulut/MQTT -> Kullanıcı Arayüzü adımları).`;

    try {
      const result = await generateContentWithFallback({ prompt });
      setProjectData(prev => ({
        ...prev,
        systemArchitecture: result.text
      }));
      setAiResponseToast('Teknik mimari ve donanım planı hazırlandı!');
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  // 4. Resmi TEKNOFEST Rapor Taslağı Derleme
  async function aiGenerateFullReport() {
    if (!projectData.title.trim()) {
      alert('Lütfen önce projenize bir başlık verin.');
      return;
    }
    setAiLoading(true);
    setAiError('');

    const prompt = `Aşağıdaki proje bilgilerini kullanarak TEKNOFEST Ön Değerlendirme Raporu formatında eksiksiz, profesyonel ve resmi bir proje raporu hazırla:

PROJE BAŞLIĞI: ${projectData.title}
YARIŞMA TÜRÜ: ${projectData.competition.toUpperCase()}
KATEGORİ: ${projectData.category}
HEDEF KİTLE: ${projectData.targetAudience}

PROBLEM BİLGİSİ:
${projectData.problemStatement}

ÇÖZÜM VE YÖNTEM:
${projectData.solutionIdea}

ÖZGÜN DEĞER:
${projectData.innovativeAspect}

TEKNİK MİMARİ & DONANIMLAR:
${projectData.systemArchitecture}

LÜTFEN ŞU BAŞLIKLAR ALTINDA DÜZENLE:
1. PROJE ÖZETİ (Max 200 kelime)
2. PROBLEMİN TANIMI VE GEREKÇE (İhtiyaç analizi ve istatistiki arka plan)
3. ÇÖZÜM ÖNERİSİ VE YÖNTEM (Proje nasıl çalışır, metodoloji)
4. YENİLİKÇİ YÖN VE ÖZGÜN DEĞER (Piyasadaki alternatiflerden farkı)
5. KULLANILACAK TEKNOLOJİLER VE DONANIM BİLEŞENLERİ
6. UYGULANABİLİRLİK VE TİCARİLEŞME / YAYGIN ETKİ POTANSİYELİ
7. TAHMİNİ MALİYET VE ZAMAN PLANI

Format: Akademik, ikna edici, jüriyi etkileyen profesyonel bir Türkçe üslup.`;

    try {
      const result = await generateContentWithFallback({ prompt });
      setProjectData(prev => ({
        ...prev,
        reportDraft: result.text
      }));
      setAiResponseToast('Resmi TEKNOFEST Rapor Taslağı başarıyla oluşturuldu!');
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  // 5. Sanal Jüri Simülasyonu & Zor Sorular
  async function aiSimulateJury() {
    if (!projectData.reportDraft.trim() && !projectData.solutionIdea.trim()) {
      alert('Lütfen önce projenizin detaylarını veya 5. Adımdaki rapor taslağını oluşturun.');
      return;
    }
    setAiLoading(true);
    setAiError('');

    const prompt = `Sen TEKNOFEST Final jürisinde yer alan, teknolojiyi ve yarışma kriterlerini en ince ayrıntısına kadar bilen çok kıdemli bir akademisyen/mühendissin.
Aşağıdaki projeyi acımasızca, dürüstçe fakat öğretici bir şekilde değerlendireceksin.

PROJE BAŞLIĞI: ${projectData.title}
KATEGORİ: ${projectData.category}
PROJE METNİ / RAPORU:
${projectData.reportDraft || projectData.solutionIdea}

GÖREVİN:
1. **Puan Simülasyonu:** (100 üzerinden tahmini puan ve gerekçesi: Özgünlük /25, Yöntem /25, Uygulanabilirlik /25, Sunum /25)
2. **Güçlü Yönler:** (Jürinin en çok beğeneceği 2 nokta)
3. **Kritik Zayıflıklar & Açıklar:** (Jürinin eleyebileceği 2 zayıf nokta)
4. **Jürinin Soracağı En Zor 3 Soru:** (Mülakatta öğrenciye sorulacak terletici teknik sorular)
5. **Bu Sorulara Nasıl Cevap Verilmeli?:** (Öğrencinin jüriyi etkileyebileceği ipuçları).`;

    try {
      const result = await generateContentWithFallback({ prompt });
      setProjectData(prev => ({
        ...prev,
        juryFeedback: result.text
      }));
      setAiResponseToast('Sanal Jüri simülasyonu tamamlandı!');
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  // API Anahtarı Testi & Kaydı
  async function handleTestAndSaveApiKey() {
    if (!customKeyInput.trim()) {
      alert('Lütfen geçerli bir API anahtarı girin.');
      return;
    }
    setKeyTestStatus({ loading: true, message: 'Google sunucuları test ediliyor...' });
    
    const testResult = await testGeminiApiKey(customKeyInput.trim());
    if (testResult.success) {
      setKeyTestStatus({ success: true, message: `Harika! Bağlantı başarılı (${testResult.model})` });
      try {
        // Okul ayarlarına kaydet
        await updateSchoolSettings('global_school', { geminiApiKey: customKeyInput.trim() });
        setTimeout(() => {
          setApiKeyModalOpen(false);
          setKeyTestStatus(null);
          setAiError('');
        }, 1500);
      } catch (e) {
        console.error('Ayarlar kaydedilemedi:', e);
      }
    } else {
      setKeyTestStatus({ success: false, message: testResult.error });
    }
  }

  // Raporu Panoya Kopyalama
  function copyReportToClipboard() {
    if (!projectData.reportDraft) return;
    navigator.clipboard.writeText(projectData.reportDraft);
    setSaveMessage('✓ Rapor panoya kopyalandı');
    setTimeout(() => setSaveMessage(''), 3000);
  }

  // Raporu Yazdırma (PDF olarak kaydet)
  function printReport() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${projectData.title || 'TEKNOFEST Proje Raporu'}</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            h2, h3 { color: #0f172a; margin-top: 24px; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
            .badge { display: inline-block; padding: 4px 10px; background: #e0e7ff; color: #3730a3; border-radius: 6px; font-weight: bold; font-size: 12px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="badge">${projectData.competition.toUpperCase()} - ${projectData.category}</div>
          <h1>${projectData.title || 'Proje Rapor Taslağı'}</h1>
          <p><strong>Öğrenci / Ekip:</strong> ${profile?.fullName || 'Belirtilmedi'} | <strong>Okul:</strong> ${profile?.schoolCode || 'ÖHEP'}</p>
          <pre>${projectData.reportDraft || 'Henüz rapor metni oluşturulmadı.'}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 relative overflow-y-auto custom-scrollbar">
      {/* Üst Başlık & Eylem Çubuğu */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md text-xl">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">TEKNOFEST & TÜBİTAK Proje Asistanı</h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                AI Mentor V2
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Fikirden Jüri Değerlendirmesine 6 Aşamalı Bilimsel Yol Haritası
            </p>
          </div>
        </div>

        {/* Eylem Butonları */}
        <div className="flex items-center gap-2 flex-wrap">
          {saveMessage && (
            <span className="text-xs font-semibold text-emerald-600 animate-pulse bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {saveMessage}
            </span>
          )}

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5"
          >
            💾 {saving ? 'Kaydediliyor...' : 'Taslağı Kaydet'}
          </button>

          <button
            onClick={() => setShowDraftsModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            📁 {isTeacher ? 'Öğrenci Projeleri' : 'Projelerim'} ({savedDrafts.length})
          </button>

          <button
            onClick={handleNewProject}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            ✨ Yeni Proje
          </button>

          <button
            onClick={() => setApiKeyModalOpen(true)}
            title="Gemini API Anahtarı Ayarları"
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors flex items-center gap-1"
          >
            🔑 API
          </button>
        </div>
      </header>

      {/* Hata veya Uyarı Bildirimi */}
      {aiError && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-red-800 animate-fadeIn">
          <div className="flex gap-2.5">
            <span className="text-lg">⚠️</span>
            <div className="text-xs leading-relaxed">
              <strong className="font-bold">Yapay Zeka Servisi Uyarısı:</strong> {aiError}
              <div className="mt-1">
                <button
                  onClick={() => setApiKeyModalOpen(true)}
                  className="font-bold underline hover:text-red-900 cursor-pointer"
                >
                  Buraya tıklayarak yeni ve geçerli bir Google Gemini API anahtarı tanımlayabilirsiniz.
                </button>
              </div>
            </div>
          </div>
          <button onClick={() => setAiError('')} className="text-red-400 hover:text-red-600 font-bold text-sm">✕</button>
        </div>
      )}

      {aiResponseToast && (
        <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-xs font-semibold">
          <span>✨ {aiResponseToast}</span>
          <button onClick={() => setAiResponseToast('')} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {/* Adım Çubuğu (Stepper Tabs) */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {STEPS.map((step) => {
            const isActive = currentStep === step.num;
            const isPassed = currentStep > step.num;
            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-50 to-rose-50/30 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                    : isPassed
                    ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    : 'bg-white border-slate-200/60 hover:bg-slate-50 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-base ${isActive ? 'scale-110' : ''}`}>{step.icon}</span>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-indigo-700' : isPassed ? 'text-slate-700' : 'text-slate-400'}`}>
                    Adım {step.num}
                  </span>
                </div>
                <span className={`text-xs font-bold truncate w-full ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* ADIM 1: Kategori & Kapsam */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>🎯</span> Adım 1: Yarışma, Kategori & Hedef
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Projenizi hangi yarışmaya hazırlıyorsunuz? Kategori seçimi yapay zekanın jüri kriterlerini doğru anlamasını sağlar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Proje Adı (Geçici veya Kesin)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Akıllı Afet Erken Uyarı ve Tahliye Kaskı (AFET-KASK)"
                  value={projectData.title}
                  onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Hedef Seviye / Yaş Grubu
                </label>
                <select
                  value={projectData.targetAudience}
                  onChange={(e) => setProjectData({ ...projectData, targetAudience: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  <option value="İlkokul (Minikler)">İlkokul (Minikler)</option>
                  <option value="Ortaokul (5-8. Sınıf)">Ortaokul (5-8. Sınıf)</option>
                  <option value="Lise (9-12. Sınıf)">Lise (9-12. Sınıf)</option>
                  <option value="Üniversite & Mezun">Üniversite & Mezun</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Yarışma Türü
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMPETITIONS.map((comp) => (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => setProjectData({ ...projectData, competition: comp.id })}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        projectData.competition === comp.id
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{comp.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{comp.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Yarışma Kategorisi / Alanı
                </label>
                <select
                  value={projectData.category}
                  onChange={(e) => setProjectData({ ...projectData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  {TEKNOFEST_CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  handleSave(true);
                  setCurrentStep(2);
                }}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                İleri: Problem & Çözüm Fikri ➜
              </button>
            </div>
          </div>
        )}

        {/* ADIM 2: Problem & Çözüm */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>💡</span> Adım 2: Problem ve Çözüm Fikri
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Dünyadaki hangi somut acıyı çözüyorsunuz? Jürinin en dikkat ettiği yer problem gerekçesidir.
                </p>
              </div>
              <button
                onClick={aiRefineProblemSolution}
                disabled={aiLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 text-white text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {aiLoading ? '🤖 Analiz Ediliyor...' : '✨ AI Sokratik Mentor ile Fikri Geliştir'}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  1. Problem Tanımı (Neyi, Neden Çözüyoruz?)
                </label>
                <textarea
                  rows={4}
                  placeholder="Örn: Deprem veya sel gibi acil durumlarda arama kurtarma ekipleri kapalı veya enkaz altındaki alanlarda GPS sinyali alamamakta, yaralıların konumu saatlerce tespit edilememektedir..."
                  value={projectData.problemStatement}
                  onChange={(e) => setProjectData({ ...projectData, problemStatement: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  2. Önerdiğiniz Çözüm Fikri (Nasıl Çözeceksiniz?)
                </label>
                <textarea
                  rows={6}
                  placeholder="Örn: Enkaz altında çalışan, LoRa sinyalleriyle 1 km mesafeden radyo frekansı üzerinden veri aktaran, termal ve gaz sensörleriyle donatılmış otonom bir mini keşif robotu tasarlıyoruz..."
                  value={projectData.solutionIdea}
                  onChange={(e) => setProjectData({ ...projectData, solutionIdea: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all leading-relaxed font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
              >
                ⬅ Geri
              </button>
              <button
                onClick={() => {
                  handleSave(true);
                  setCurrentStep(3);
                }}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                İleri: Özgün Değer & Literatür ➜
              </button>
            </div>
          </div>
        )}

        {/* ADIM 3: Özgün Değer */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>🌟</span> Adım 3: Özgün Değer ve Literatür Taraması
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Mevcut benzer ürünlerden farkınız ne? TEKNOFEST jürisi en yüksek puanı Özgün Değere verir.
                </p>
              </div>
              <button
                onClick={aiAnalyzeOriginality}
                disabled={aiLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 text-white text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {aiLoading ? '🤖 Analiz Yapılıyor...' : '🔍 Mevcut Çözümleri ve Boşlukları Analiz Et'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Özgün Değer ve Benzerlerinden Ayrılan Yönler
              </label>
              <textarea
                rows={10}
                placeholder="Örn: Piyasadaki arama-kurtarma robotları 15.000$ civarında olup sadece askeri kullanıma uygundur. Bizim çözümümüz yerli ESP32 mimarisi ve 3D yazıcı gövdesi ile maliyeti 100 kat düşürmekte ve LoRa mesh ağı sayesinde baz istasyonuna ihtiyaç duymamaktadır..."
                value={projectData.innovativeAspect}
                onChange={(e) => setProjectData({ ...projectData, innovativeAspect: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all leading-relaxed"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
              >
                ⬅ Geri
              </button>
              <button
                onClick={() => {
                  handleSave(true);
                  setCurrentStep(4);
                }}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                İleri: Teknik Altyapı & Mimari ➜
              </button>
            </div>
          </div>
        )}

        {/* ADIM 4: Teknik Altyapı */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>⚙️</span> Adım 4: Teknik Mimari, Donanım ve Yazılım
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Hangi mikrodenetleyici kartlar (ESP32, Arduino), sensörler ve algoritmalar kullanılacak?
                </p>
              </div>
              <button
                onClick={aiSuggestHardwareSoftware}
                disabled={aiLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {aiLoading ? '🤖 Tasarlanıyor...' : '🛠️ Donanım & Algoritma Mimarisi Önerisi Al'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Sistem Mimarisi, Sensörler ve Kod Blokları
              </label>
              <textarea
                rows={10}
                placeholder="Örn: 
- Mikrodenetleyici: ESP32-WROOM-32 (Dahili Wi-Fi & Bluetooth)
- Sensörler: MQ-2 Gaz Sensörü, HC-SR04 Ultrasonik, DHT22 Sıcaklık/Nem
- Yazılım: C++ (Arduino IDE) + Firebase Realtime DB + Web Dashboard..."
                value={projectData.systemArchitecture}
                onChange={(e) => setProjectData({ ...projectData, systemArchitecture: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all leading-relaxed font-mono text-xs"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
              >
                ⬅ Geri
              </button>
              <button
                onClick={() => {
                  handleSave(true);
                  setCurrentStep(5);
                }}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                İleri: Resmi Rapor Taslağı ➜
              </button>
            </div>
          </div>
        )}

        {/* ADIM 5: Resmi Rapor Taslağı */}
        {currentStep === 5 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>📄</span> Adım 5: TEKNOFEST Resmi Rapor Taslağı
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Önceki adımlarda girdiğiniz tüm bilgiler TEKNOFEST Ön Değerlendirme Raporu formatında akademik dile dönüştürülür.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={aiGenerateFullReport}
                  disabled={aiLoading}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-rose-600 to-amber-600 text-white text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? '🤖 Rapor Yazılıyor...' : '✨ Rapor Taslağını Otomatik Derle'}
                </button>
                {projectData.reportDraft && (
                  <>
                    <button
                      onClick={copyReportToClipboard}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      📋 Kopyala
                    </button>
                    <button
                      onClick={printReport}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      🖨️ Yazdır / PDF
                    </button>
                  </>
                )}
              </div>
            </div>

            <div>
              <textarea
                rows={14}
                placeholder="Raporunuz hazır olduğunda burada görüntülenecektir. 'Rapor Taslağını Otomatik Derle' butonuna tıklayarak oluşturabilir veya doğrudan kendiniz düzenleyebilirsiniz."
                value={projectData.reportDraft}
                onChange={(e) => setProjectData({ ...projectData, reportDraft: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all leading-relaxed font-sans"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
              >
                ⬅ Geri
              </button>
              <button
                onClick={() => {
                  handleSave(true);
                  setCurrentStep(6);
                }}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                İleri: Sanal Jüri Simülasyonu ➜
              </button>
            </div>
          </div>
        )}

        {/* ADIM 6: Sanal Jüri */}
        {currentStep === 6 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>⚖️</span> Adım 6: Sanal Jüri & Puanlama Simülasyonu
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Yarışmaya göndermeden önce projenizi yapay zeka hakemine inceletin. Jüri mülakatına tam hazır olun.
                </p>
              </div>
              <button
                onClick={aiSimulateJury}
                disabled={aiLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {aiLoading ? '⚖️ Jüri İnceliyor...' : '🎯 Jüri Simülasyonunu Başlat'}
              </button>
            </div>

            <div>
              <textarea
                rows={12}
                placeholder="Jüri değerlendirmesi, puan tahmini ve zorlayıcı mülakat soruları burada listelenecektir..."
                value={projectData.juryFeedback}
                onChange={(e) => setProjectData({ ...projectData, juryFeedback: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all leading-relaxed font-sans"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(5)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
              >
                ⬅ Geri
              </button>
              <button
                onClick={() => handleSave(false)}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                🎉 Projeyi Tamamla & Buluta Kaydet
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Kaydedilmiş Projeler Modalı */}
      {showDraftsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                📁 {isTeacher ? 'Öğrencilerin TEKNOFEST / TÜBİTAK Projeleri' : 'Kaydedilmiş Projelerim'}
              </h3>
              <button onClick={() => setShowDraftsModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
              {savedDrafts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Henüz kaydedilmiş bir proje taslağı yok.
                </div>
              ) : (
                savedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => handleSelectDraft(draft)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      activeDraftId === draft.id
                        ? 'border-indigo-500 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {draft.title || 'İsimsiz Proje'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {draft.userFullName ? `${draft.userFullName} • ` : ''}{draft.category} • Adım {draft.currentStep || 1}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteDraft(draft.id, e)}
                      title="Taslağı Sil"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDraftsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Anahtarı Yönetimi Modalı */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                🔑 Google Gemini API Anahtarı
              </h3>
              <button onClick={() => setApiKeyModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Google AI Studio (aistudio.google.com) üzerinden aldığınız ücretsiz API anahtarını buraya yapıştırıp canlı olarak test edebilirsiniz. Anahtar tüm sistemde anında devreye girer.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {keyTestStatus && (
              <div className={`p-3 rounded-xl text-xs font-medium ${
                keyTestStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                keyTestStatus.loading ? 'bg-indigo-50 text-indigo-800' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {keyTestStatus.message}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                İptal
              </button>
              <button
                onClick={handleTestAndSaveApiKey}
                disabled={keyTestStatus?.loading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50"
              >
                {keyTestStatus?.loading ? 'Test Ediliyor...' : 'Test Et & Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
