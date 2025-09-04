const { test, expect } = require('@playwright/test');

test.describe('PWA Installation Tests', () => {
  test.beforeEach(async ({ page, browserName }) => {
    // Grant camera permissions for Chromium
    if (browserName === 'chromium') {
      await page.context().grantPermissions(['camera']);
    }
    await page.goto('/');
    
    // Wait for page to load and JavaScript to initialize
    await expect(page.locator('#app-title-text')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('PWA manifest is available', async ({ page }) => {
    // Check if manifest link exists
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', 'manifest.json');
    
    // Verify manifest loads successfully
    const response = await page.request.get('http://localhost:5050/manifest.json');
    expect(response.status()).toBe(200);
    
    const manifest = await response.json();
    expect(manifest.name).toBe('EasyBin');
    expect(manifest.short_name).toBe('EasyBin');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
  });

  test('service worker registers successfully', async ({ page }) => {
    // Wait for service worker registration
    await page.waitForFunction(() => {
      return navigator.serviceWorker && navigator.serviceWorker.ready;
    }, { timeout: 10000 });
    
    // Check if service worker is registered
    const swRegistration = await page.evaluate(() => {
      return navigator.serviceWorker.ready.then(registration => {
        return registration.active !== null;
      });
    });
    
    expect(swRegistration).toBe(true);
  });

  test('PWA install button is visible', async ({ page }) => {
    // First trigger the beforeinstallprompt event to make button visible
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      event.prompt = () => Promise.resolve({ outcome: 'accepted' });
      event.preventDefault = () => {};
      window.dispatchEvent(event);
    });
    
    // Wait a moment for the event to be processed
    await page.waitForTimeout(100);
    
    // Check if install button exists in left panel and is now visible
    const installButton = page.locator('#pwa-install-button');
    await expect(installButton).toBeVisible();
    
    // Verify button text and icon
    await expect(installButton).toContainText('Install App');
    const icon = page.locator('#pwa-install-button i.fa-download');
    await expect(icon).toBeVisible();
  });

  test('PWA icons are accessible', async ({ page }) => {
    // Test 192x192 icon
    const icon192Response = await page.request.get('http://localhost:5050/icons/icon-192x192.png');
    expect(icon192Response.status()).toBe(200);
    
    // Test 512x512 icon
    const icon512Response = await page.request.get('http://localhost:5050/icons/icon-512x512.png');
    expect(icon512Response.status()).toBe(200);
    
    // Test SVG icon
    const iconSvgResponse = await page.request.get('http://localhost:5050/icons/icon.svg');
    expect(iconSvgResponse.status()).toBe(200);
  });

  test('offline page is available', async ({ page }) => {
    // Test offline page loads
    const offlineResponse = await page.request.get('http://localhost:5050/offline.html');
    expect(offlineResponse.status()).toBe(200);
  });

  test('service worker caches resources', async ({ page }) => {
    // Wait for service worker to be ready
    await page.waitForFunction(() => navigator.serviceWorker.ready, { timeout: 10000 });
    
    // Force a cache update by reloading
    await page.reload();
    
    // Check if main resources are in cache
    const cacheStatus = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      return cacheNames.length > 0;
    });
    
    expect(cacheStatus).toBe(true);
  });

  test.describe('Chromium-specific PWA tests', () => {
    test.skip(({ browserName }) => browserName !== 'chromium');
    
    test('beforeinstallprompt event handling', async ({ page }) => {
      // Test the beforeinstallprompt event simulation
      const installPromptReady = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Simulate the beforeinstallprompt event
          const event = new Event('beforeinstallprompt');
          event.prompt = () => Promise.resolve({ outcome: 'accepted' });
          event.preventDefault = () => {};
          
          window.dispatchEvent(event);
          
          // Check if install button becomes visible (was hidden by default)
          setTimeout(() => {
            const installBtn = document.getElementById('pwa-install-button');
            const isVisible = installBtn && !installBtn.classList.contains('hidden');
            resolve(isVisible);
          }, 100);
        });
      });
      
      expect(installPromptReady).toBe(true);
    });
  });

  test('PWA theme colors are applied', async ({ page }) => {
    // Check theme-color meta tag
    const themeColor = await page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#10b981');
    
    // Check if manifest theme colors match
    const response = await page.request.get('http://localhost:5050/manifest.json');
    const manifest = await response.json();
    expect(manifest.theme_color).toBe('#10b981');
    expect(manifest.background_color).toBe('#f0fdf4');
  });

  test('PWA display mode is standalone', async ({ page }) => {
    // Verify manifest display mode
    const response = await page.request.get('http://localhost:5050/manifest.json');
    const manifest = await response.json();
    expect(manifest.display).toBe('standalone');
  });
});
