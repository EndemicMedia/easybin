const { test, expect } = require('@playwright/test');

test.describe('Puter.js Debug Tests', () => {
  test('Debug Puter.js loading with network monitoring', async ({ page }) => {
    const messages = [];
    const networkRequests = [];
    const networkResponses = [];
    
    page.on('console', msg => {
      messages.push(msg.text());
      console.log('Console:', msg.text());
    });
    
    page.on('request', request => {
      if (request.url().includes('puter')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
        console.log('Request:', request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('puter')) {
        networkResponses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
        console.log('Response:', response.url(), 'Status:', response.status());
      }
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(10000); // Extended wait
    
    console.log('\n=== NETWORK ANALYSIS ===');
    console.log('Requests:', networkRequests);
    console.log('Responses:', networkResponses);
    console.log('Console messages:', messages);
    
    // Test alternative loading method
    const puterResult = await page.evaluate(async () => {
      try {
        // Try direct fetch to Puter.js
        const response = await fetch('https://js.puter.com/v2/', { 
          mode: 'cors',
          credentials: 'omit'
        });
        console.log('Direct fetch response:', response.status, response.statusText);
        return { success: true, status: response.status };
      } catch (error) {
        console.log('Direct fetch error:', error.message);
        return { success: false, error: error.message };
      }
    });
    
    console.log('Direct fetch result:', puterResult);
  });
});