// Modal close debug test
const { test, expect } = require('@playwright/test');

test('Debug modal closing issue', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  // Open modal
  await page.click('#history-button');
  await page.waitForTimeout(1000);
  
  console.log('\n=== After Opening ===');
  let classes = await page.locator('#history-modal').getAttribute('class');
  console.log(`Modal classes: ${classes}`);
  
  // Test different closing methods
  console.log('\n=== Testing Close Methods ===');
  
  // Method 1: Click on modal background (the div itself)
  const modalBoundingBox = await page.locator('#history-modal').boundingBox();
  console.log(`Modal bounding box:`, modalBoundingBox);
  
  // Click in the top-left corner of the modal (should be background)
  if (modalBoundingBox) {
    await page.click('#history-modal', { 
      position: { x: 10, y: 10 } 
    });
    await page.waitForTimeout(500);
    
    classes = await page.locator('#history-modal').getAttribute('class');
    console.log(`After corner click: ${classes}`);
  }
  
  // If still open, try direct function call
  if (!classes.includes('hidden')) {
    console.log('Modal still open, trying direct function call...');
    await page.evaluate(() => {
      toggleHistoryModal(false);
    });
    await page.waitForTimeout(500);
    
    classes = await page.locator('#history-modal').getAttribute('class');
    console.log(`After direct call: ${classes}`);
  }
  
  // Check if close button exists and try clicking it
  const closeButtonExists = await page.locator('#history-modal button').count();
  console.log(`Close buttons found: ${closeButtonExists}`);
  
  if (closeButtonExists > 0 && !classes.includes('hidden')) {
    await page.click('#history-modal button');
    await page.waitForTimeout(500);
    
    classes = await page.locator('#history-modal').getAttribute('class');
    console.log(`After close button: ${classes}`);
  }
  
  expect(true).toBe(true);
});