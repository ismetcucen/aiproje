import urllib.request
import re
from bs4 import BeautifulSoup

units = {
  1437: "1. Ünite: Teknoloji Ve Tasarım Öğreniyorum",
  1438: "2. Ünite: Temel Tasarım",
  1439: "3. Ünite: Tasarım Odaklı Süreç",
  1440: "4. Ünite: Bilgisayar Destekli Tasarım",
  1441: "5. Ünite: Mimari Tasarım",
  1442: "6. Ünite: Doğadan Tasarıma",
  1443: "7. Ünite: Enerjinin Dönüşümü Ve Tasarım",
  1444: "8. Ünite: Bütünleşik Öğrenme: Steam",
  1445: "9. Ünite: Yapay Zekâ Ve Akıllı Ürünler"
}

for uid, title in units.items():
    url = f"https://tymm.meb.gov.tr/teknoloji-tasarim-dersi/unite/{uid}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        soup = BeautifulSoup(html, 'html.parser')
        
        # We need to find elements containing the outcomes (usually something like TT.7.1.1 or similar format)
        print(f"\n--- {title} ---")
        
        # Find all divs with text containing 'TT.7.' or just print all text in learning outcomes section
        # Look for the section titled 'Öğrenme Çıktıları'
        found = False
        for div in soup.find_all('div', class_='learning-outcome'):
            print(div.get_text(strip=True))
            found = True
            
        if not found:
            for p in soup.find_all('p'):
                text = p.get_text(strip=True)
                if 'TT.7' in text:
                    print(text)
                
    except Exception as e:
        print(f"Error fetching {url}: {e}")

