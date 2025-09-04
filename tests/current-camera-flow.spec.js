const { test, expect } = require('@playwright/test');

test.describe('Current Camera Flow Tests', () => {
  test('Open Camera button initializes camera correctly', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Initially camera should be hidden and scan button disabled
    await expect(page.locator('#camera')).toHaveClass(/hidden/);
    await expect(page.locator('#scan-button')).toHaveAttribute('disabled');
    await expect(page.locator('#open-camera-button')).toBeVisible();
    
    console.log('✅ Initial state correct: camera hidden, scan disabled, open button visible');
    
    // Click Open Camera button
    await page.click('#open-camera-button');
    await page.waitForTimeout(4000); // Wait for camera initialization
    
    // After opening camera: camera visible, scan enabled, open button hidden
    await expect(page.locator('#camera')).not.toHaveClass(/hidden/);
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    console.log('✅ Camera opened successfully: camera visible, scan enabled');
  });
  
  test('Fallback AI works after camera initialization', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    const messages = [];
    page.on('console', msg => {
      messages.push(msg.text());
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Click Open Camera
    await page.click('#open-camera-button');
    await page.waitForTimeout(4000);
    
    // Click Scan
    await page.click('#scan-button');
    await page.waitForTimeout(4000);
    
    // Should see fallback AI working
    expect(messages.some(msg => msg.includes('Fallback AI Response'))).toBeTruthy();
    await expect(page.locator('#item-name')).toContainText('Detected Item');
    await expect(page.locator('#bin-header')).toBeVisible();
    
    console.log('✅ Full workflow works: Open Camera → Scan → Fallback AI → Results');
  });
  
  test('Application loads correctly with all elements', async ({ page }) => {
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Check essential UI elements
    await expect(page.locator('#app-title-text')).toBeVisible();
    await expect(page.locator('#open-camera-button')).toBeVisible();
    await expect(page.locator('#scan-button')).toBeVisible();
    await expect(page.locator('#history-button')).toBeVisible();
    await expect(page.locator('#language-select')).toBeVisible();
    await expect(page.locator('#country-select')).toBeVisible();
    
    console.log('✅ All UI elements present and visible');
  });
});