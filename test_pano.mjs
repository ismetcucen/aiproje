import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('https://ohepai.vercel.app/pano', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  if (content.includes('Yükleniyor')) {
    console.log("STUCK ON LOADING");
  } else {
    console.log("LOADED SOMETHING");
  }
  
  await browser.close();
})();
