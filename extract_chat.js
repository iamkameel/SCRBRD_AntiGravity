const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to specific URL...');
  await page.goto('https://chatgpt.com/share/69afebff-5f10-800b-a5d2-ab8db398973a', { waitUntil: 'networkidle' });
  
  console.log('Waiting for content to load...');
  await page.waitForTimeout(5000);
  
  try {
    // Try to click "Stay logged out" if it exists
    const stayLoggedOutBtn = await page.$('text="Stay logged out"');
    if (stayLoggedOutBtn) {
      console.log('Clicking "Stay logged out"...');
      await stayLoggedOutBtn.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log('No "Stay logged out" button found or error clicking.', e);
  }

  // Extract article or specific conversation text
  const content = await page.evaluate(() => {
    // ChatGPT shared links usually have conversational text in specific elements
    // Let's just grab the whole innerText first to be safe
    return document.body.innerText;
  });
  
  fs.writeFileSync('chatgpt_content.txt', content);
  console.log('Content saved to chatgpt_content.txt');
  
  await browser.close();
})();
