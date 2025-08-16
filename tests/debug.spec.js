// Debug test to check JavaScript loading and errors
const { test, expect } = require('@playwright/test');

test('Debug JavaScript loading and functionality', async ({ page }) => {
  const errors = [];
  const consoleMessages = [];
  
  // Capture JavaScript errors
  page.on('pageerror', (error) => {
    errors.push(error.message);
    console.log('❌ JavaScript Error:', error.message);
  });
  
  // Capture console messages
  page.on('console', (msg) => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    console.log(`📝 Console ${msg.type()}:`, msg.text());
  });
  
  await page.goto('/');
  
  // Wait a bit for all scripts to load
  await page.waitForTimeout(5000);
  
  console.log('\n=== JavaScript Errors ===');
  console.log(errors.length ? errors : 'No JavaScript errors');
  
  console.log('\n=== Console Messages ===');
  consoleMessages.forEach(msg => console.log(msg));
  
  // Check if critical elements exist
  console.log('\n=== Element Checks ===');
  
  const titleExists = await page.locator('#app-title-text').count();
  console.log(`Title element exists: ${titleExists > 0}`);
  
  const scanButtonExists = await page.locator('#scan-button').count();
  console.log(`Scan button exists: ${scanButtonExists > 0}`);
  
  const historyButtonExists = await page.locator('#history-button').count();
  console.log(`History button exists: ${historyButtonExists > 0}`);
  
  // Check if JavaScript functions exist
  const jsCheck = await page.evaluate(() => {
    return {
      puterExists: typeof window.puter !== 'undefined',
      translations: typeof window.translations !== 'undefined',
      toggleHistoryModal: typeof window.toggleHistoryModal !== 'undefined' || 
                         typeof toggleHistoryModal !== 'undefined',
      scanExists: document.getElementById('scan-button') !== null,
      titleText: document.getElementById('app-title-text')?.textContent || 'NOT FOUND'
    };
  });
  
  console.log('\n=== JavaScript State ===');
  Object.entries(jsCheck).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  
  // Check scan button state
  const scanButtonDisabled = await page.locator('#scan-button').getAttribute('disabled');
  console.log(`Scan button disabled: ${scanButtonDisabled !== null}`);
  
  // Test history button click
  try {
    await page.click('#history-button', { timeout: 2000 });
    console.log('✅ History button clicked successfully');
    
    const modalClasses = await page.locator('#history-modal').getAttribute('class');
    console.log(`Modal classes after click: ${modalClasses}`);
  } catch (error) {
    console.log(`❌ History button click failed: ${error.message}`);
  }
  
  // This test always passes - it's just for debugging
  expect(true).toBe(true);
});