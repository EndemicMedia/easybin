const { test, expect } = require('@playwright/test');

test.describe('Working Camera Flow Tests', () => {
  test('Complete camera workflow with proper timing', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    const messages = [];
    page.on('console', msg => {
      messages.push(msg.text());
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    // Initial state: camera hidden, scan disabled
    await expect(page.locator('#camera')).toHaveClass(/hidden/);
    await expect(page.locator('#scan-button')).toHaveAttribute('disabled');
    
    console.log('✅ Initial state correct');
    
    // Click Open Camera
    await page.click('#open-camera-button');
    
    // Wait for specific console messages indicating camera is ready
    await page.waitForFunction(
      () => {
        return window.console.messages?.some(msg => 
          msg.includes('Camera video is now visible') || 
          msg.includes('scanButton after: false')
        ) || 
        document.querySelector('#camera').classList.contains('hidden') === false;
      },
      { timeout: 10000 }
    );
    
    // Verify camera is now visible and scan is enabled
    await expect(page.locator('#camera')).not.toHaveClass(/hidden/);
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    console.log('✅ Camera opened and scan enabled');
    
    // Click scan button
    await page.click('#scan-button');
    await page.waitForTimeout(4000);
    
    // Verify fallback AI worked
    expect(messages.some(msg => msg.includes('Fallback AI Response'))).toBeTruthy();
    await expect(page.locator('#item-name')).toContainText('Detected Item');
    
    console.log('✅ Complete workflow successful');
  });
  
  test('Basic UI elements load correctly', async ({ page }) => {
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // All essential elements should be visible
    await expect(page.locator('#app-title-text')).toBeVisible();
    await expect(page.locator('#open-camera-button')).toBeVisible();  
    await expect(page.locator('#scan-button')).toBeVisible(); // Button exists but disabled
    await expect(page.locator('#history-button')).toBeVisible();
    
    console.log('✅ UI elements load correctly');
  });
  
  test('Fallback AI system provides realistic responses', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Initialize camera
    await page.click('#open-camera-button');
    await page.waitForTimeout(6000); // Wait for camera setup
    
    // Scan
    await page.click('#scan-button');
    await page.waitForTimeout(4000); // Wait for AI processing
    
    // Check realistic content
    const itemName = await page.locator('#item-name').textContent();
    const binClassification = await page.locator('.bin-name-region').textContent();
    const reasoning = await page.locator('#item-description').textContent();
    
    expect(itemName).toBeTruthy();
    expect(binClassification).toBeTruthy();
    expect(reasoning).toContain('appears to be');
    
    console.log('✅ Realistic AI responses provided');
  });
});