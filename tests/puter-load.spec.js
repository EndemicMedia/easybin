const { test, expect } = require('@playwright/test');

test.describe('Puter.js Loading Tests', () => {
  test('Puter.js loads successfully without CSP blocking', async ({ page }) => {
    const messages = [];
    const errors = [];
    
    page.on('console', msg => {
      messages.push(msg.text());
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    // Check if Puter.js loaded successfully
    const puterExists = await page.evaluate(() => {
      return typeof window.puter !== 'undefined';
    });
    
    // Check if puter.ai is available
    const puterAIExists = await page.evaluate(() => {
      return window.puter && typeof window.puter.ai !== 'undefined';
    });
    
    console.log('Puter exists:', puterExists);
    console.log('Puter.ai exists:', puterAIExists);
    console.log('Console messages:', messages.filter(m => m.includes('Puter')));
    console.log('Page errors:', errors);
    
    // Should not see "Puter.js failed to load" message
    expect(messages.some(msg => msg.includes('Puter.js failed to load'))).toBeFalsy();
    
    // Should have puter object available
    expect(puterExists).toBeTruthy();
    expect(puterAIExists).toBeTruthy();
  });
  
  test('AI scanning works with Puter.js loaded', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    // Check if puter is available before proceeding
    const puterExists = await page.evaluate(() => {
      return typeof window.puter !== 'undefined' && typeof window.puter.ai !== 'undefined';
    });
    
    if (!puterExists) {
      console.log('Skipping AI test - Puter.js not loaded');
      return;
    }
    
    // Click Open Camera
    await page.click('#open-camera-button');
    await page.waitForTimeout(3000);
    
    // Mock the AI response to avoid actual API call
    await page.evaluate(() => {
      window.puter.ai.chat = async (prompt, imageData) => {
        return {
          content: JSON.stringify({
            items: [{
              itemName: "Test Plastic Bottle",
              primaryBin: "recyclable",
              primaryConfidence: 0.95,
              material: "plastic",
              reasoning: "This is a test item",
              isContaminated: false,
              position: "center"
            }]
          })
        };
      };
    });
    
    // Click scan button
    await page.click('#scan-button');
    await page.waitForTimeout(2000);
    
    // Should see AI results displayed
    await expect(page.locator('#item-name')).toContainText('Test Plastic Bottle');
    
    console.log('✅ AI scanning works with mocked response');
  });
});