// ÖZEL HAMDULLAH EMİNPAŞA OKULLARI (ÖHEP)
// 1. Hafta Beslenme Programı (Öğle Yemeği)

export const WEEKLY_MENU = {
  1: {
    dayName: 'Pazartesi',
    calorie: '~740 kcal',
    items: [
      'Tavuk Çorbası',
      'Kuru Fasulye',
      'Pirinç Pilavı',
      'Akdeniz Salatası',
      'Mevsim Meyvesi'
    ]
  },
  2: {
    dayName: 'Salı',
    calorie: '~690 kcal',
    items: [
      'Ezogelin Çorbası',
      'Tavuk Sote',
      'Erişte',
      'Ayran',
      'Puding'
    ]
  },
  3: {
    dayName: 'Çarşamba',
    calorie: '~710 kcal',
    items: [
      'Yayla Çorbası',
      'Misket Köfte',
      'Bulgur Pilavı',
      'Salata',
      'Mevsim Meyvesi'
    ]
  },
  4: {
    dayName: 'Perşembe',
    calorie: '~720 kcal',
    items: [
      'Mantar Çorbası',
      'Zeytinyağlı Bezelye',
      'Pirinç Pilavı',
      'Karışık Turşu',
      'Yoğurt'
    ]
  },
  5: {
    dayName: 'Cuma',
    calorie: '~620 kcal',
    items: [
      'Şehriye Çorbası',
      'Çoban Kavurma',
      'Domatesli Bulgur Pilavı',
      'Yeşil Salata',
      'Cacık'
    ]
  }
}

/**
 * Günün menüsünü getirir.
 * Eğer Firebase'den özel bir menü girilmişse onu,
 * yoksa haftalık resmi beslenme programından o günün menüsünü döner.
 */
export function getTodaysLunchMenu(customMenu, customCalorie, targetDate = new Date()) {
  // Eğer panelden özel ve geçerli menü girilmişse
  const validCustom = Array.isArray(customMenu) 
    ? customMenu.map(i => (typeof i === 'string' ? i.trim() : '')).filter(Boolean)
    : []

  if (validCustom.length > 0) {
    return {
      dayName: targetDate.toLocaleDateString('tr-TR', { weekday: 'long' }),
      calorie: customCalorie || '',
      items: validCustom,
      isCustom: true,
      isWeekend: false
    }
  }

  const dayOfWeek = targetDate.getDay() // 0: Pazar, 1: Pzt, ..., 5: Cuma, 6: Cmt

  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    const scheduled = WEEKLY_MENU[dayOfWeek]
    return {
      dayName: scheduled.dayName,
      calorie: scheduled.calorie,
      items: scheduled.items,
      isCustom: false,
      isWeekend: false
    }
  }

  // Hafta sonu ise Pazartesi menüsünü önizleme olarak sun
  return {
    dayName: 'Pazartesi (Gelecek Hafta)',
    calorie: WEEKLY_MENU[1].calorie,
    items: WEEKLY_MENU[1].items,
    isCustom: false,
    isWeekend: true
  }
}
