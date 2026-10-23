import { GoogleGenAI } from '@google/genai';
import { getSchoolSettings } from '../firebase/schema';

// Varsayılan modeller (Öncelik sırasına göre)
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

/**
 * Aktif Gemini API anahtarını çözer.
 * Önce Firestore okul ayarlarındaki 'geminiApiKey' değerine bakar (eğer girilmişse),
 * yoksa VITE_GEMINI_API_KEY çevre değişkenini kullanır.
 */
export async function resolveGeminiApiKey() {
  try {
    const settings = await getSchoolSettings('global_school');
    if (settings && settings.geminiApiKey && settings.geminiApiKey.trim()) {
      return settings.geminiApiKey.trim();
    }
  } catch (err) {
    console.warn('[GeminiService] Firestore ayarları okunamadı, .env kullanılıyor:', err);
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

/**
 * Hata mesajını analiz edip kullanıcı dostu Türkçe açıklamaya çevirir.
 */
function formatGeminiError(err) {
  const msg = err?.message || String(err);
  if (msg.includes('leaked') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return 'Google Gemini API anahtarınız geçersiz veya iptal edilmiş (Leaked/403). Lütfen ayarlardan veya .env dosyasından yeni bir Google AI Studio API anahtarı tanımlayın.';
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
    return 'Yapay zeka istek kotası anlık olarak doldu (429). Lütfen 1-2 dakika bekleyip tekrar deneyin.';
  }
  if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('Overloaded')) {
    return 'Google sunucuları şu an aşırı yoğun (503). Lütfen birkaç saniye sonra tekrar deneyin.';
  }
  if (msg.includes('SAFETY') || msg.includes('BLOCKED')) {
    return 'İçerik güvenlik filtrelerine takıldı. Lütfen sorunuzu veya ifadenizi farklı bir şekilde yazın.';
  }
  return `Yapay zeka yanıt oluştururken bir hata oluştu: ${msg}`;
}

/**
 * TEKNOFEST ve TÜBİTAK için sokratik mentor sistem talimatı.
 */
export const TEKNOFEST_SYSTEM_PROMPT = `Sen Türkiye'nin en deneyimli TEKNOFEST, TÜBİTAK 2204 ve eTwinning Proje Danışmanı ve Hakemisin.
GÖREVİN:
1. Öğrenci veya öğretmene bir hazır proje fabrikası gibi körü körüne her şeyi sen uydurma. Onların fikirlerini dinle ve sokratik danışman gibi rehberlik et.
2. TEKNOFEST kriterlerini (Özgün Değer, Problem Tanımı, Yöntem/Teknik Çözüm, Yerlilik/Milli Teknoloji, Uygulanabilirlik ve Jüri Kriterleri) titizlikle uygula.
3. Donanım ve yazılım önerilerinde gerçekçi ol (Örn: Arduino, ESP32, Raspberry Pi, Python, Flutter, OpenCV, TensorFlow Lite, LoRa, vb.).
4. Rapor bölümlerini resmi TEKNOFEST Ön Değerlendirme / Detay Raporu şablonu standartlarında, akademik ve anlaşılır bir Türkçe ile yapılandır.
5. Samimi, yapıcı, teşvik edici ancak bilimsel açıdan disiplinli bir üslup kullan.`;

/**
 * Fallback mekanizmalı içerik üretici.
 * @param {Object} options
 * @param {string} options.prompt - Kullanıcı promptu
 * @param {string} [options.systemInstruction] - Sistem talimatı
 * @param {Array} [options.history] - Sohbet geçmişi [{ role: 'user'|'model', parts: [{ text }] }]
 * @param {string} [options.customApiKey] - İsteğe bağlı özel API anahtarı
 * @returns {Promise<{ text: string, modelUsed: string }>}
 */
export async function generateContentWithFallback({
  prompt,
  systemInstruction = TEKNOFEST_SYSTEM_PROMPT,
  history = [],
  customApiKey = null
}) {
  const apiKey = customApiKey || (await resolveGeminiApiKey());

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API anahtarı bulunamadı! Lütfen ayarlardan veya .env.local dosyasından bir Google Gemini API anahtarı tanımlayın.');
  }

  let lastError = null;

  // Modelleri sırayla dener (Fallback)
  for (const modelName of FALLBACK_MODELS) {
    try {
      const ai = new GoogleGenAI({ apiKey, dangerouslyAllowBrowser: true });

      // Mesaj akışını oluştur
      const contents = [];
      if (history && history.length > 0) {
        contents.push(...history);
      }
      if (prompt) {
        contents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          temperature: 0.7,
        }
      });

      const responseText = response?.text || '';
      if (!responseText.trim()) {
        throw new Error(`Model ${modelName} boş yanıt döndürdü.`);
      }

      return {
        text: responseText,
        modelUsed: modelName
      };
    } catch (err) {
      console.warn(`[GeminiService] ${modelName} başarısız oldu, sonraki modele geçiliyor:`, err.message);
      lastError = err;
      // Eğer anahtar sızdırılmış (403) veya tamamen geçersiz ise diğer modelleri denemeye gerek yok
      if (err?.message?.includes('leaked') || err?.message?.includes('API_KEY_INVALID')) {
        break;
      }
    }
  }

  throw new Error(formatGeminiError(lastError));
}

/**
 * API anahtarının canlı çalışıp çalışmadığını test eder.
 */
export async function testGeminiApiKey(testKey) {
  try {
    const ai = new GoogleGenAI({ apiKey: testKey, dangerouslyAllowBrowser: true });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Merhaba, sadece "OK" yaz.' }] }],
      config: { maxOutputTokens: 10 }
    });
    return { success: true, text: response?.text || 'OK', model: 'gemini-2.5-flash' };
  } catch (err) {
    // 2.5-flash başarısız olursa 1.5-flash'ı dene
    try {
      const ai = new GoogleGenAI({ apiKey: testKey, dangerouslyAllowBrowser: true });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'Merhaba, sadece "OK" yaz.' }] }],
        config: { maxOutputTokens: 10 }
      });
      return { success: true, text: response?.text || 'OK', model: 'gemini-1.5-flash' };
    } catch (err2) {
      return { success: false, error: formatGeminiError(err2) };
    }
  }
}
