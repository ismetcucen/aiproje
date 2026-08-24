const fs = require('fs');

const dateRanges = [
  "14 - 18 Eylül", "21 - 25 Eylül", "28 Eyl - 2 Eki", "5 - 9 Ekim", "12 - 16 Ekim", "19 - 23 Ekim", "26 - 30 Ekim",
  "2 - 6 Kasım", "9 - 13 Kasım", "23 - 27 Kasım", "30 Kas - 4 Ara", "7 - 11 Aralık", "14 - 18 Aralık", "21 - 25 Aralık",
  "28 Ara - 1 Oca", "4 - 8 Ocak", "11 - 15 Ocak", "18 - 22 Ocak", "8 - 12 Şubat", "15 - 19 Şubat", "22 - 26 Şubat",
  "1 - 5 Mart", "15 - 19 Mart", "22 - 26 Mart", "29 Mar - 2 Nis", "5 - 9 Nisan", "12 - 16 Nisan", "19 - 23 Nisan",
  "26 - 30 Nisan", "3 - 7 Mayıs", "10 - 14 Mayıs", "17 - 21 Mayıs", "24 - 28 Mayıs", "31 May - 4 Haz", "7 - 11 Haziran", "14 - 18 Haziran"
];

let content = fs.readFileSync('src/data/curriculum.js', 'utf8');

for (let i = 1; i <= 36; i++) {
  const range = dateRanges[i-1];
  const regex = new RegExp(`{ week: ${i},\\s+title:`, 'g');
  content = content.replace(regex, `{ week: ${i}, dateRange: "${range}", title:`);
}

fs.writeFileSync('src/data/curriculum.js', content, 'utf8');
console.log('Done');
