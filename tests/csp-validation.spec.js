const { test, expect } = require('@playwright/test');

test.describe('CSP and Resource Loading Tests', () => {
  test('TailwindCSS loads without CSP violations', async ({ page }) => {
    const cspViolations = [];
    const messages = [];
    
    page.on('console', msg => {
      messages.push(msg.text());
      if (msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    // Check if TailwindCSS loaded properly
    const tailwindLoaded = await page.evaluate(() => {
      // Check if Tailwind classes are applied
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return computedStyle.display !== '';
    });
    
    console.log('TailwindCSS loaded:', tailwindLoaded);
    console.log('CSP violations:', cspViolations);
    console.log('Console messages:', messages.filter(m => 
      m.includes('TailwindCSS') || 
      m.includes('cdn.jsdelivr') || 
      m.includes('Content Security Policy')
    ));
    
    // Should have no CSP violations for TailwindCSS
    const tailwindCSPViolations = cspViolations.filter(v => v.includes('tailwindcss'));
    expect(tailwindCSPViolations.length).toBe(0);
  });
  
  test('Application loads with proper security headers', async ({ page }) => {
    const response = await page.goto('http://localhost:5050');
    
    // Check security headers
    const headers = response.headers();
    console.log('Security headers:', {
      csp: headers['content-security-policy'],
      xFrameOptions: headers['x-frame-options'],
      xContentType: headers['x-content-type-options'],
      referrerPolicy: headers['referrer-policy']
    });
    
    expect(headers['content-security-policy']).toContain('default-src');
    expect(headers['content-security-policy']).toContain('cdn.jsdelivr.net');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
  });
  
  test('Fallback AI system works with proper headers', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    const messages = [];
    page.on('console', msg => {
      messages.push(msg.text());
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    // Click Open Camera
    await page.click('#open-camera-button');
    await page.waitForTimeout(3000);
    
    // Click scan button
    await page.click('#scan-button');
    await page.waitForTimeout(3000);
    
    // Should see fallback AI working
    expect(messages.some(msg => msg.includes('Fallback AI Response'))).toBeTruthy();
    await expect(page.locator('#item-name')).toContainText('Detected Item');
    
    console.log('✅ Fallback AI system works with security headers');
  });
});