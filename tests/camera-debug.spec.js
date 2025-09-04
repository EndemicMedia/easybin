const { test, expect } = require('@playwright/test');

test.describe('Camera Debug Tests', () => {
  test('Debug camera initialization process', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:5050' });
    
    const messages = [];
    const errors = [];
    
    page.on('console', msg => {
      messages.push(msg.text());
      console.log('Console:', msg.text());
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log('Page Error:', error.message);
    });
    
    await page.goto('http://localhost:5050');
    await page.waitForTimeout(3000);
    
    console.log('\n=== INITIAL STATE ===');
    const initialCameraClass = await page.locator('#camera').getAttribute('class');
    const initialScanDisabled = await page.locator('#scan-button').getAttribute('disabled');
    console.log('Camera classes:', initialCameraClass);
    console.log('Scan button disabled:', initialScanDisabled);
    
    // Check if Open Camera button exists and is clickable
    const openCameraExists = await page.locator('#open-camera-button').isVisible();
    console.log('Open Camera button visible:', openCameraExists);
    
    if (openCameraExists) {
      console.log('\n=== CLICKING OPEN CAMERA ===');
      await page.click('#open-camera-button');
      await page.waitForTimeout(6000); // Extended wait
      
      console.log('\n=== POST-CLICK STATE ===');
      const postCameraClass = await page.locator('#camera').getAttribute('class');
      const postScanDisabled = await page.locator('#scan-button').getAttribute('disabled');
      console.log('Camera classes:', postCameraClass);
      console.log('Scan button disabled:', postScanDisabled);
      
      // Check for getUserMedia availability
      const mediaDevicesSupported = await page.evaluate(() => {
        return {
          mediaDevices: typeof navigator.mediaDevices !== 'undefined',
          getUserMedia: typeof navigator.mediaDevices?.getUserMedia !== 'undefined',
          permissions: typeof navigator.permissions !== 'undefined'
        };
      });
      console.log('Media support:', mediaDevicesSupported);
    }
    
    console.log('\n=== CONSOLE MESSAGES ===');
    messages.forEach(msg => console.log(' -', msg));
    
    console.log('\n=== ERRORS ===');
    errors.forEach(err => console.log(' -', err));
    
    // Check DOM elements exist
    const elementsExist = await page.evaluate(() => {
      return {
        video: !!document.getElementById('camera'),
        scanButton: !!document.getElementById('scan-button'),
        openCameraButton: !!document.getElementById('open-camera-button'),
        openCameraContainer: !!document.getElementById('open-camera-container')
      };
    });
    console.log('Elements exist:', elementsExist);
  });
});