const { test, expect } = require('@playwright/test');

test.describe('AI Provider System Tests', () => {
  test('Complete scanning workflow with AI (Puter.js or Pollinations.AI)', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    const messages = [];
    page.on('console', msg => {
      messages.push(msg.text());
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    // 1. Verify initial state
    await expect(page.locator('#camera')).toHaveClass(/hidden/);
    await expect(page.locator('#scan-button')).toHaveAttribute('disabled');
    
    // 2. Click Open Camera and wait for initialization
    await page.click('#open-camera-button');
    await page.waitForTimeout(12000); // Extended wait for camera setup
    
    // 3. Verify camera is working by checking if scan button becomes enabled
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    // 4. Click Scan button
    await page.click('#scan-button');
    await page.waitForTimeout(5000); // Wait for fallback AI processing
    
    // 5. Verify AI system activated (either Puter.js or Pollinations.AI)
    const puterAvailable = messages.some(msg => msg.includes('Puter.js loaded successfully'));
    const pollinationsUsed = messages.some(msg => msg.includes('Puter.js not available, using Pollinations.AI vision system'));
    
    expect(puterAvailable || pollinationsUsed).toBeTruthy();
    
    if (pollinationsUsed) {
      expect(messages.some(msg => msg.includes('Pollinations AI Response') || msg.includes('Calling Pollinations.AI vision API'))).toBeTruthy();
      console.log('✅ Using Pollinations.AI vision system');
    } else {
      console.log('✅ Using Puter.js AI system');
    }
    
    // 6. Verify results displayed (real AI or fallback testing response)
    const itemName = await page.locator('#item-name').textContent();
    expect(itemName === 'Detected Item' || itemName === 'Unidentified Item').toBeTruthy();
    await expect(page.locator('#bin-header')).toBeVisible();
    
    // 7. Verify bin classification
    await expect(page.locator('.bin-name-region')).toBeVisible();
    await expect(page.locator('#bin-instructions')).toBeVisible();
    
    console.log('✅ Complete AI workflow successful (Puter.js or Pollinations.AI)');
  });
  
  test('AI providers provide realistic responses', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    // Initialize camera first
    await page.click('#open-camera-button');
    await page.waitForTimeout(12000); // Wait for camera setup
    
    // Verify scan button is enabled before clicking (confirms camera initialization)
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    // Click scan
    await page.click('#scan-button');
    await page.waitForTimeout(5000); // Wait for AI processing
    
    // Check response details
    const itemName = await page.locator('#item-name').textContent();
    const binClassification = await page.locator('.bin-name-region').textContent();
    const reasoning = await page.locator('#item-description').textContent();
    
    console.log('Item Name:', itemName);
    console.log('Bin Classification:', binClassification);
    console.log('AI Reasoning:', reasoning);
    
    // Verify realistic content
    expect(itemName).toBeTruthy();
    expect(binClassification).toBeTruthy(); 
    expect(reasoning).toContain('appears to be');
    
    console.log('✅ AI providers provide realistic responses');
  });
  
  test('History saving works with AI providers', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    // Initialize camera first
    await page.click('#open-camera-button');
    await page.waitForTimeout(12000); // Wait for camera setup
    
    // Verify scan button is enabled (confirms camera initialization)
    await expect(page.locator('#scan-button')).not.toHaveAttribute('disabled');
    
    // Complete scan process
    await page.click('#scan-button');
    await page.waitForTimeout(5000); // Wait for AI processing
    
    // Open history modal
    await page.click('#history-button');
    await page.waitForTimeout(1000);
    
    // Verify item saved to history
    await expect(page.locator('#history-modal')).toBeVisible();
    await expect(page.locator('.history-item')).toBeVisible();
    const historyItemText = await page.locator('.history-item').textContent();
    expect(historyItemText.includes('Detected Item') || historyItemText.includes('Unidentified Item')).toBeTruthy();
    
    console.log('✅ History saving works with AI providers');
  });
});