// ÖZEL HAMDULLAH EMİNPAŞA OKULLARI (ÖHEP)
// 19 - 23 Ekim Öğlen Beslenme Menüsü

export const WEEKLY_MENU = {
  1: {
    dayName: 'Pazartesi',
    calorie: '~710 kcal',
    items: [
      'Tarhana Çorbası',
      'Etli Nohut',
      'Pirinç Pilavı',
      'Yoğurt',
      'Çoban Salata'
    ]
  },
  2: {
    dayName: 'Salı',
    calorie: '~720 kcal',
    items: [
      'Domates Çorbası',
      'Mantı (Yoğurtlu, Soslu)',
      'Salata (Havuç, Turp)',
      'Meyve'
    ]
  },
  3: {
    dayName: 'Çarşamba',
    calorie: '~690 kcal',
    items: [
      'Mercimek Çorbası',
      'Kıymalı Patates Oturtma',
      'Kuru Cacık',
      'Tulumba Tatlısı'
    ]
  },
  4: {
    dayName: 'Perşembe',
    calorie: '~730 kcal',
    items: [
      'Arpa Şehriye Çorbası',
      'Balık / Kök Sebze',
      'Akdeniz Salatası',
      'Helva'
    ]
  },
  5: {
    dayName: 'Cuma',
    calorie: '~660 kcal',
    items: [
      'Mantar Çorbası',
      'Baget Haşlama',
      'Pirinç Pilavı',
      'Mevsim Salatası',
      'Meyve'
    ]
  }
}

/**
 * Günün menüsünü getirir.
 * Resmi 19-23 Ekim beslenme programından o günün menüsünü döner.
 */
export function getTodaysLunchMenu(customMenu, customCalorie, targetDate = new Date()) {
  const dayOfWeek = targetDate.getDay() // 0: Pazar, 1: Pzt, ..., 5: Cuma, 6: Cmt

  if (dayOfWeek >= 1 && dayOfWeek <= 5 && WEEKLY_MENU[dayOfWeek]) {
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
    dayName: 'Pazartesi (Önizleme)',
    calorie: WEEKLY_MENU[1].calorie,
    items: WEEKLY_MENU[1].items,
    isCustom: false,
    isWeekend: true
  }
}
