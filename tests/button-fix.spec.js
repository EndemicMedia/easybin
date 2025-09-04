const { test, expect } = require('@playwright/test');

test.describe('Open Camera Button Fix Tests', () => {
  test('Open Camera button event listener is properly attached', async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    const messages = [];
    page.on('console', msg => {
      messages.push(msg.text());
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Check for setup messages
    expect(messages).toContain('DOM loaded, initializing app...');
    expect(messages).toContain('Setting up Open Camera button event listener');
    
    // Ensure button exists and is clickable
    await expect(page.locator('#open-camera-button')).toBeVisible();
    
    // Click the button
    await page.click('#open-camera-button');
    await page.waitForTimeout(1000);
    
    // Check that click was registered
    expect(messages).toContain('Open Camera button clicked');
    expect(messages.some(msg => msg.includes('Camera access granted'))).toBeTruthy();
    
    console.log('All console messages:', messages.filter(m => 
      m.includes('DOM loaded') || 
      m.includes('Setting up') || 
      m.includes('Open Camera button clicked') ||
      m.includes('Camera access')
    ));
  });
  
  test('Camera initialization works after button click', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Initially camera should be hidden and button visible
    await expect(page.locator('#camera')).toHaveClass(/hidden/);
    await expect(page.locator('#open-camera-button')).toBeVisible();
    
    // Click Open Camera
    await page.click('#open-camera-button');
    await page.waitForTimeout(3000);
    
    // After click, camera should be visible and button hidden
    await expect(page.locator('#camera')).not.toHaveClass(/hidden/);
    await expect(page.locator('#open-camera-container')).toHaveClass(/hidden/);
    
    // Status should be updated
    await expect(page.locator('#app-status')).toContainText('Ready to scan');
  });
});