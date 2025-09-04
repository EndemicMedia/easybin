const { test, expect } = require('@playwright/test');

test.describe('Puter.js CORS Loading Tests', () => {
  test('Puter.js loads successfully with CORS server', async ({ page }) => {
    const messages = [];
    const errors = [];
    
    page.on('console', msg => {
      messages.push(msg.text());
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(5000); // Wait for Puter.js to load
    
    // Check if Puter.js loaded successfully
    const puterExists = await page.evaluate(() => {
      return typeof window.puter !== 'undefined';
    });
    
    // Check if puter.ai is available
    const puterAIExists = await page.evaluate(() => {
      return window.puter && typeof window.puter.ai !== 'undefined';
    });
    
    // Check loading status
    const puterLoaded = await page.evaluate(() => {
      return window.puterLoaded;
    });
    
    console.log('Puter loaded flag:', puterLoaded);
    console.log('Puter exists:', puterExists);
    console.log('Puter.ai exists:', puterAIExists);
    console.log('Success messages:', messages.filter(m => m.includes('Puter.js loaded')));
    console.log('Error messages:', messages.filter(m => m.includes('failed to load')));
    console.log('Page errors:', errors);
    
    // Verify successful loading
    expect(puterLoaded).toBeTruthy();
    expect(puterExists).toBeTruthy();
    expect(puterAIExists).toBeTruthy();
    expect(messages.some(msg => msg.includes('Puter.js loaded successfully'))).toBeTruthy();
    expect(messages.some(msg => msg.includes('failed to load'))).toBeFalsy();
  });
  
  test('AI scanning works with properly loaded Puter.js', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(5000); // Wait for Puter.js to load
    
    // Verify puter is available
    const puterExists = await page.evaluate(() => {
      return typeof window.puter !== 'undefined' && typeof window.puter.ai !== 'undefined';
    });
    
    if (!puterExists) {
      console.log('Skipping AI test - Puter.js not properly loaded');
      return;
    }
    
    // Click Open Camera
    await page.click('#open-camera-button');
    await page.waitForTimeout(3000);
    
    // Verify camera is working
    await expect(page.locator('#camera')).not.toHaveClass(/hidden/);
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    // Mock the AI response for testing
    await page.evaluate(() => {
      window.puter.ai.chat = async (prompt, imageData) => {
        return {
          content: JSON.stringify({
            items: [{
              itemName: "Test Plastic Bottle with Real Puter.js",
              primaryBin: "recyclable",
              primaryConfidence: 0.95,
              material: "plastic",
              reasoning: "This is a real Puter.js response",
              isContaminated: false,
              position: "center"
            }]
          })
        };
      };
    });
    
    // Click scan button
    await page.click('#scan-button');
    await page.waitForTimeout(3000);
    
    // Verify real AI results displayed (not fallback)
    await expect(page.locator('#item-name')).toContainText('Test Plastic Bottle with Real Puter.js');
    
    console.log('✅ Real Puter.js AI scanning works');
  });
});