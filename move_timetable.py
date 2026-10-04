import re

with open('src/pages/DigitalBoardViewer.jsx', 'r') as f:
    code = f.read()

# Extract Zaman Çizelgesi
timetable_match = re.search(r'(?s)({\/\* Zaman Çizelgesi \*\/}.*?)(?={\/\* Günün Menüsü \*\/})', code)
if not timetable_match:
    print("Could not find Zaman Cizelgesi")
    exit(1)
timetable_code = timetable_match.group(1).strip() + "\n\n"

# Remove Zaman Çizelgesi from the left column
code = code.replace(timetable_match.group(1), '')

# Extract Nöbetçi Öğretmenler
nobetci_match = re.search(r'(?s)({\/\* Nöbetçi Öğretmenler \*\/}.*?)(?={\/\* Günün Sözü \*\/})', code)
if not nobetci_match:
    print("Could not find Nobetci Ogretmenler")
    exit(1)

# Replace Nobetci Ogretmenler with Zaman Cizelgesi in the right column
code = code.replace(nobetci_match.group(1), timetable_code)

# Update Menu Title
code = code.replace('<span>🍽️</span> Günün Menüsü', '<span>🍽️</span> GÜNÜN MENÜSÜ - ÖĞLE YEMEĞİ')
code = code.replace('<span>🍽️</span> GÜNÜN MENÜSÜ', '<span>🍽️</span> GÜNÜN MENÜSÜ - ÖĞLE YEMEĞİ') # just in case
# Ensure it doesn't duplicate
code = code.replace('GÜNÜN MENÜSÜ - ÖĞLE YEMEĞİ - ÖĞLE YEMEĞİ', 'GÜNÜN MENÜSÜ - ÖĞLE YEMEĞİ')

with open('src/pages/DigitalBoardViewer.jsx', 'w') as f:
    f.write(code)
print("Success")
