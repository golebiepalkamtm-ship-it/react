import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 10000 });
    const isJsLoading = await page.evaluate(() => document.documentElement.classList.contains('js-loading'));
    const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML.substring(0, 500));
    console.log('js-loading present:', isJsLoading);
    console.log('root innerHTML:', rootHtml);
  } catch (err) {
    console.log('Navigation Error:', err.message);
  }

  await browser.close();
})();
