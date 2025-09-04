const { test, expect } = require('@playwright/test');

test.describe('Automatic Error Detection Tests', () => {
  test('Capture console errors and verify AI functionality', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    const errors = [];
    const warnings = [];
    const messages = [];
    
    // Capture all console output
    page.on('console', msg => {
      const text = msg.text();
      messages.push(text);
      
      if (msg.type() === 'error') {
        console.log('❌ ERROR:', text);
        errors.push(text);
      } else if (msg.type() === 'warning') {
        console.log('⚠️ WARNING:', text);
        warnings.push(text);
      }
    });
    
    // Capture page errors
    page.on('pageerror', err => {
      console.log('🔥 PAGE ERROR:', err.message);
      errors.push(`PAGE ERROR: ${err.message}`);
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    console.log('=== Testing complete camera to AI workflow ===');
    
    // Initialize camera
    await page.click('#open-camera-button');
    await page.waitForTimeout(10000);
    
    // Verify camera is working
    const scanButton = page.locator('#scan-button');
    await expect(scanButton).not.toHaveAttribute('disabled');
    console.log('✅ Camera initialized successfully');
    
    // Capture initial error count
    const initialErrorCount = errors.length;
    console.log(`Initial error count: ${initialErrorCount}`);
    
    // Click scan to test AI functionality
    await page.click('#scan-button');
    console.log('🔄 Scanning initiated...');
    
    // Wait for AI processing
    await page.waitForTimeout(8000);
    
    // Check for specific errors
    const typeErrors = errors.filter(err => 
      err.includes('Failed to execute') || 
      err.includes('not of type') ||
      err.includes('TypeError')
    );
    
    const pollinationsErrors = errors.filter(err => 
      err.includes('Pollinations AI error')
    );
    
    console.log('=== Error Analysis ===');
    console.log(`Total errors: ${errors.length}`);
    console.log(`Type errors: ${typeErrors.length}`);
    console.log(`Pollinations errors: ${pollinationsErrors.length}`);
    
    if (typeErrors.length > 0) {
      console.log('❌ Type Errors Found:');
      typeErrors.forEach(err => console.log(`  - ${err}`));
    }
    
    if (pollinationsErrors.length > 0) {
      console.log('❌ Pollinations Errors Found:');
      pollinationsErrors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Check if AI system is working
    const pollinationsUsed = messages.some(msg => 
      msg.includes('Using Pollinations.AI vision system')
    );
    const aiResponseReceived = messages.some(msg => 
      msg.includes('Pollinations AI Response')
    );
    
    console.log('=== AI System Status ===');
    console.log(`Pollinations AI activated: ${pollinationsUsed}`);
    console.log(`AI response received: ${aiResponseReceived}`);
    
    // Verify results are displayed
    const resultVisible = await page.locator('#item-name').isVisible();
    console.log(`Results displayed: ${resultVisible}`);
    
    // Test should pass if no critical type errors and results are shown
    expect(typeErrors.length).toBe(0); // No type errors
    expect(resultVisible).toBe(true); // Results displayed
    
    console.log('✅ Error detection test completed');
    
    // Log summary of all console messages for debugging
    console.log('=== Recent Console Messages (last 10) ===');
    messages.slice(-10).forEach(msg => console.log(`> ${msg}`));
  });
});