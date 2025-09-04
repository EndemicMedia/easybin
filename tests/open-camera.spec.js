const { test, expect } = require('@playwright/test');

test.describe('Open Camera Button Tests', () => {
  test('Open Camera button shows and works correctly', async ({ page, context }) => {
    // Grant camera permissions to avoid permission dialogs
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Initially, camera should be hidden and open camera button should be visible
    await expect(page.locator('#camera')).toHaveClass(/hidden/);
    await expect(page.locator('#open-camera-button')).toBeVisible();
    await expect(page.locator('#open-camera-container')).toBeVisible();
    
    // Scan button should be disabled initially
    await expect(page.locator('#scan-button')).toHaveAttribute('disabled');
    
    // Click the Open Camera button
    await page.click('#open-camera-button');
    
    // Wait for camera initialization
    await page.waitForTimeout(3000);
    
    // After clicking, camera should be visible and open camera button should be hidden
    await expect(page.locator('#camera')).not.toHaveClass(/hidden/);
    await expect(page.locator('#open-camera-container')).toHaveClass(/hidden/);
    
    // Scan button should be enabled after camera loads
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    // Check status message changed to ready
    await expect(page.locator('#app-status')).toContainText('Ready to scan');
  });

  test('Camera permission flow works correctly', async ({ page }) => {
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Initially no camera permission dialog should appear automatically
    await expect(page.locator('#camera')).toHaveClass(/hidden/);
    await expect(page.locator('#open-camera-button')).toBeVisible();
    
    // Status should show waiting message
    await expect(page.locator('#app-status')).toContainText('Click "Open Camera" to start');
  });

  test('Console logs show correct sequence', async ({ page, context }) => {
    // Grant camera permissions to avoid permission dialogs
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    const messages = [];
    page.on('console', msg => {
      if (msg.text().includes('Open Camera button clicked') || 
          msg.text().includes('Camera access granted') ||
          msg.text().includes('Camera video is now visible')) {
        messages.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Click the Open Camera button
    await page.click('#open-camera-button');
    await page.waitForTimeout(3000);
    
    // Check that correct sequence of log messages appeared
    expect(messages).toContain('Open Camera button clicked');
    expect(messages.some(msg => msg.includes('Camera access granted'))).toBeTruthy();
    expect(messages.some(msg => msg.includes('Camera video is now visible'))).toBeTruthy();
  });
});