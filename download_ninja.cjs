const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('https://opengameart.org/content/ninja-adventure', { waitUntil: 'networkidle2' });
  
  // Find the zip link
  const zipUrl = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const zipLink = links.find(l => l.href.endsWith('.zip'));
    return zipLink ? zipLink.href : null;
  });

  if (zipUrl) {
    console.log('Found ZIP URL:', zipUrl);
    // Download it using https
    const file = fs.createWriteStream('ninja.zip');
    https.get(zipUrl, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Download completed');
        browser.close();
      });
    }).on('error', (err) => {
      console.error(err);
      browser.close();
    });
  } else {
    console.log('No ZIP found');
    browser.close();
  }
})();
