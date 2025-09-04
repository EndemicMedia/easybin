const { test, expect } = require('@playwright/test');

test.describe('Scan Button Visibility Tests', () => {
  test('Scan button is visible in left panel', async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Check that scan button exists and is visible
    await expect(page.locator('#scan-button')).toBeVisible();
    await expect(page.locator('#scan-button')).toHaveText(/Identify Item/);
    
    // Initially disabled
    await expect(page.locator('#scan-button')).toHaveAttribute('disabled');
    
    console.log('✅ Scan button is visible and disabled initially');
  });

  test('Scan button becomes enabled after camera opens', async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Click Open Camera button
    await page.click('#open-camera-button');
    
    // Wait for camera initialization
    await page.waitForTimeout(5000);
    
    // Check that scan button is now enabled
    await expect(page.locator('#scan-button')).toBeVisible();
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    console.log('✅ Scan button is enabled after camera opens');
  });

  test('Check button location and styling', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Get button properties
    const button = page.locator('#scan-button');
    const boundingBox = await button.boundingBox();
    const classes = await button.getAttribute('class');
    
    console.log('Button bounding box:', boundingBox);
    console.log('Button classes:', classes);
    
    // Check if button has proper styling
    expect(classes).toContain('w-full');
    expect(classes).toContain('modern-btn');
    
    // Check button is in viewport
    expect(boundingBox.width).toBeGreaterThan(0);
    expect(boundingBox.height).toBeGreaterThan(0);
    
    console.log('✅ Button has proper styling and is in viewport');
  });
});