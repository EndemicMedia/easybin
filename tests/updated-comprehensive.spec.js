const { test, expect } = require('@playwright/test');

test.describe('Updated Comprehensive Tests', () => {
  test.beforeEach(async ({ page, browserName }) => {
    if (browserName === 'chromium') {
      await page.context().grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    }
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
  });

  test('Application loads with correct initial state', async ({ page }) => {
    // Essential UI elements
    await expect(page.locator('#app-title-text')).toContainText('Smart Trash Separator');
    await expect(page.locator('#open-camera-button')).toBeVisible();
    await expect(page.locator('#scan-button')).toBeVisible();
    await expect(page.locator('#history-button')).toBeVisible();
    
    // Initial camera state (manual initialization)
    await expect(page.locator('#camera')).toHaveClass(/hidden/);
    await expect(page.locator('#scan-button')).toHaveAttribute('disabled');
    
    console.log('✅ Application loads with correct initial state');
  });
  
  test('History functionality works correctly', async ({ page }) => {
    // Open history modal
    await page.click('#history-button');
    await expect(page.locator('#history-modal')).toBeVisible();
    
    // Close history modal (clicking close button)
    await page.click('#history-modal .close-button, #history-modal button[aria-label*="close"], #history-modal button');
    await page.waitForTimeout(1000);
    
    console.log('✅ History functionality works');
  });
  
  test('Country selection works', async ({ page }) => {
    // Change country
    await page.selectOption('#country-select', 'DE');
    
    // Verify selection persisted
    const selectedValue = await page.locator('#country-select').inputValue();
    expect(selectedValue).toBe('DE');
    
    console.log('✅ Country selection works');
  });
  
  test('Security headers are properly configured', async ({ page }) => {
    const response = await page.goto('http://localhost:5050');
    const headers = response.headers();
    
    expect(headers['content-security-policy']).toContain('default-src');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    
    console.log('✅ Security headers properly configured');
  });
  
  test('External resources load without CSP violations', async ({ page }) => {
    const cspViolations = [];
    
    page.on('console', msg => {
      if (msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    // Should have no CSP violations for essential resources
    const criticalViolations = cspViolations.filter(v => 
      v.includes('tailwindcss') || 
      v.includes('font-awesome') || 
      v.includes('script-src')
    );
    
    expect(criticalViolations.length).toBe(0);
    
    console.log('✅ External resources load without CSP violations');
  });
  
  test('UI elements are accessible', async ({ page }) => {
    // Check for ARIA labels and accessibility attributes
    await expect(page.locator('#open-camera-button')).toHaveAttribute('aria-label');
    await expect(page.locator('#scan-button')).toHaveAttribute('aria-label');
    await expect(page.locator('#camera')).toHaveAttribute('aria-label');
    await expect(page.locator('#language-select')).toHaveAttribute('aria-label');
    await expect(page.locator('#country-select')).toHaveAttribute('aria-label');
    
    console.log('✅ UI elements have proper accessibility attributes');
  });
});