const { test, expect } = require('@playwright/test');

test.describe('Simple Workflow Tests', () => {
  test('Camera workflow works with element state checking', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    // Initial state
    await expect(page.locator('#camera')).toHaveClass(/hidden/);
    await expect(page.locator('#open-camera-button')).toBeVisible();
    
    // Click Open Camera
    await page.click('#open-camera-button');
    
    // Wait longer and check for camera visibility by checking the class directly
    let attempts = 0;
    while (attempts < 15) { // 15 attempts = 15 seconds max
      const cameraClasses = await page.locator('#camera').getAttribute('class');
      const scanDisabled = await page.locator('#scan-button').getAttribute('disabled');
      
      if (!cameraClasses.includes('hidden') && scanDisabled === null) {
        console.log('✅ Camera ready after', attempts + 1, 'seconds');
        break;
      }
      
      await page.waitForTimeout(1000);
      attempts++;
    }
    
    // Verify final state
    await expect(page.locator('#camera')).not.toHaveClass(/hidden/);
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    console.log('✅ Camera workflow completed successfully');
  });
  
  test('Non-camera features work correctly', async ({ page }) => {
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(2000);
    
    // Test country switching
    await page.selectOption('#country-select', 'DE');
    await page.waitForTimeout(1000);
    const countryValue = await page.locator('#country-select').inputValue();
    expect(countryValue).toBe('DE');
    
    // Test history modal
    await page.click('#history-button');
    await expect(page.locator('#history-modal')).toBeVisible();
    
    // Close modal
    await page.keyboard.press('Escape');
    await expect(page.locator('#history-modal')).not.toBeVisible();
    
    console.log('✅ Non-camera features work correctly');
  });
  
  test('Security headers are present', async ({ page }) => {
    const response = await page.goto('http://localhost:5050');
    
    const headers = response.headers();
    expect(headers['content-security-policy']).toContain('default-src');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    
    console.log('✅ Security headers present and correct');
  });
});