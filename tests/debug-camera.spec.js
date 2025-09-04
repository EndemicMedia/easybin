const { test, expect } = require('@playwright/test');

test.describe('Camera Debug Tests', () => {
  test('Debug camera initialization with detailed logging', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    const messages = [];
    page.on('console', msg => {
      console.log('CONSOLE:', msg.text());
      messages.push(msg.text());
    });
    
    // Listen for errors
    page.on('pageerror', err => {
      console.log('PAGE ERROR:', err.message);
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    console.log('=== Initial State ===');
    
    // Check if elements exist
    const openCameraBtn = await page.locator('#open-camera-button').isVisible();
    const camera = await page.locator('#camera').isVisible();
    const scanButton = await page.locator('#scan-button').isDisabled();
    
    console.log('Open Camera Button visible:', openCameraBtn);
    console.log('Camera visible:', camera);
    console.log('Scan Button disabled:', scanButton);
    
    console.log('=== Clicking Open Camera ===');
    await page.click('#open-camera-button');
    
    console.log('=== Waiting and checking after click ===');
    await page.waitForTimeout(10000); // Wait 10 seconds
    
    // Check state after click
    const cameraAfter = await page.locator('#camera').isVisible();
    const scanButtonAfter = await page.locator('#scan-button').isDisabled();
    const cameraClasses = await page.locator('#camera').getAttribute('class');
    
    console.log('Camera visible after click:', cameraAfter);
    console.log('Scan Button disabled after click:', scanButtonAfter);
    console.log('Camera classes:', cameraClasses);
    
    console.log('=== Recent Console Messages ===');
    messages.slice(-10).forEach(msg => console.log('>', msg));
  });
});