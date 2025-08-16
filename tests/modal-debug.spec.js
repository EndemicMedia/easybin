// Modal debug test
const { test, expect } = require('@playwright/test');

test('Debug modal opening issue', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  // Check initial state
  console.log('\n=== Initial State ===');
  const initialClasses = await page.locator('#history-modal').getAttribute('class');
  console.log(`Initial modal classes: ${initialClasses}`);
  
  // Check if function exists
  const functionExists = await page.evaluate(() => {
    return {
      toggleExists: typeof toggleHistoryModal !== 'undefined',
      historyModalElement: document.getElementById('history-modal') !== null,
      historyButtonElement: document.getElementById('history-button') !== null
    };
  });
  
  console.log('Function/Element checks:', functionExists);
  
  // Try to call the function directly
  try {
    const directCall = await page.evaluate(() => {
      if (typeof toggleHistoryModal !== 'undefined') {
        toggleHistoryModal(true);
        return document.getElementById('history-modal')?.className;
      }
      return 'Function not found';
    });
    console.log(`Direct function call result: ${directCall}`);
  } catch (error) {
    console.log(`Direct call failed: ${error.message}`);
  }
  
  // Reset modal and try button click
  await page.evaluate(() => {
    const modal = document.getElementById('history-modal');
    if (modal) {
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50';
    }
  });
  
  console.log('\n=== Button Click Test ===');
  await page.click('#history-button');
  await page.waitForTimeout(1000);
  
  const afterClickClasses = await page.locator('#history-modal').getAttribute('class');
  console.log(`After click classes: ${afterClickClasses}`);
  
  // Check event listeners and button properties
  const eventInfo = await page.evaluate(() => {
    const button = document.getElementById('history-button');
    return {
      onClickAttribute: button ? button.getAttribute('onclick') : null,
      buttonExists: button !== null
    };
  });
  
  console.log('Event listener info:', eventInfo);
  
  expect(true).toBe(true);
});