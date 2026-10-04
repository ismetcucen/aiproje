import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import http from 'http';

async function waitPort(port) {
  while (true) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => resolve(res));
        req.on('error', reject);
      });
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
}

async function run() {
  const server = spawn('npm', ['run', 'preview'], { cwd: '/Users/ismetcucen/Desktop/aiproje' });
  
  await waitPort(4173);
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:4173/pano', { waitUntil: 'domcontentloaded' });
  
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: '/tmp/pano_screenshot_2.png' });
  
  await browser.close();
  server.kill();
  console.log("Screenshot 2 saved");
}

run();
