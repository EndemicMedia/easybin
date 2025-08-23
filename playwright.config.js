// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5050',
    trace: 'on-first-retry',
  },

  projects: [
    // Desktop Browsers - Core Testing
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        permissions: ['camera']
      },
    },
    {
      name: 'firefox', 
      use: { 
        ...devices['Desktop Firefox']
        // Note: Firefox doesn't support camera permissions in Playwright testing
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari']
        // Note: Safari doesn't support camera permissions in Playwright testing
      },
    },

    // Mobile Browsers - PWA Testing
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5']
        // Note: Mobile Chrome doesn't support camera permissions in Playwright testing
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12']
        // Note: Mobile Safari doesn't support camera permissions in Playwright testing
      },
    },

    // Tablet - Responsive Testing  
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro']
        // Note: iPad doesn't support camera permissions in Playwright testing
      },
    },

    // Edge Cases - Different Screen Sizes
    {
      name: 'mobile-small',
      use: { 
        ...devices['iPhone SE']
        // Note: iPhone SE doesn't support camera permissions in Playwright testing
      },
    },
  ],

  webServer: {
    command: 'npx serve -s . -p 5050',
    port: 5050,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
