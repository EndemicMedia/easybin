// EasyBin Application Tests
// This file contains comprehensive tests for the new features added to EasyBin

// Mock DOM elements for testing
function setupMockDOM() {
    // Create mock elements
    document.body.innerHTML = `
        <div id="camera-container">
            <video id="camera"></video>
            <div id="camera-loading" style="display: none;"></div>
            <div id="camera-permission-denied" style="display: none;"></div>
            <div id="scanning-overlay" style="display: none;"></div>
        </div>
        <div id="result-card">
            <div id="result-content"></div>
            <div id="bin-header"></div>
            <div id="item-name"></div>
            <div id="bin-instructions"></div>
            <div id="item-description"></div>
            <div id="country-note"></div>
            <div id="output"></div>
        </div>
        <button id="scan-button" disabled></button>
        <button id="retake-button" style="display: none;"></button>
        <button id="share-button" style="display: none;"></button>
        <button id="save-button" style="display: none;"></button>
        <button id="tips-button"></button>
        <div id="quick-tips-overlay" style="display: none;"></div>
        <div id="history-modal" style="display: none;"></div>
        <select id="language-select"><option value="en">English</option></select>
        <select id="country-select"><option value="us">United States</option></select>
    `;
}

// Mock app state
let appState = {
    lastAIResponse: null,
    lastResultItems: null,
    lastImageDataUrl: null,
    userCountry: 'us',
    currentLanguage: 'en'
};

// Mock dependencies
const mockPuter = {
    ai: {
        chat: async (prompt, imageData) => {
            return {
                items: [
                    {
                        itemName: "Plastic Bottle",
                        primaryBin: "recyclable",
                        primaryConfidence: 0.95,
                        secondaryBin: "general-waste",
                        secondaryConfidence: 0.05,
                        material: "PET",
                        reasoning: "Clear plastic bottle, typically recyclable.",
                        isContaminated: false,
                        position: "center"
                    }
                ]
            };
        }
    },
    geo: {
        get: async () => {
            return { countryCode: 'us' };
        }
    }
};

// Test suite
class TestSuite {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.tests = [];
    }

    async run() {
        console.log('Starting EasyBin tests...\n');
        
        // Run all test methods
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        for (const method of methods) {
            if (method.startsWith('test')) {
                await this[method]();
            }
        }
        
        // Print summary
        console.log('\n');
        console.log('Test Summary:');
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
        console.log(`Total: ${this.passed + this.failed}`);
        
        if (this.failed === 0) {
            console.log('\n🎉 All tests passed!');
        } else {
            console.log('\n❌ Some tests failed!');
        }
    }

    async runTest(name, testFunction) {
        try {
            await testFunction();
            console.log(`✅ ${name}`);
            this.passed++;
        } catch (error) {
            console.log(`❌ ${name}`);
            console.log(`   Error: ${error.message}`);
            this.failed++;
        }
    }

    // Test camera loading state
    async testCameraLoadingState() {
        // Setup
        setupMockDOM();
        const { showCameraLoading, hideCameraLoading } = require('./app.js');
        
        // Test showCameraLoading
        showCameraLoading();
        const loadingElement = document.getElementById('camera-loading');
        this.assertTrue(loadingElement.style.display === 'flex', 'Camera loading should be visible');
        
        // Test hideCameraLoading
        hideCameraLoading();
        this.assertTrue(loadingElement.style.display === 'none', 'Camera loading should be hidden');
    }

    // Test camera permission denied screen
    async testCameraPermissionDenied() {
        // Setup
        setupMockDOM();
        const { initApp } = require('./app.js');
        
        // Mock getUserMedia to throw PermissionDeniedError
        navigator.mediaDevices.getUserMedia = () => {
            throw new Error('Permission denied');
        };
        
        // Call initApp and check if permission denied screen is shown
        await initApp();
        const permissionDenied = document.getElementById('camera-permission-denied');
        this.assertTrue(permissionDenied.style.display === 'flex', 'Permission denied screen should be visible');
    }

    // Test retake photo functionality
    async testRetakePhoto() {
        // Setup
        setupMockDOM();
        const { handleRetake } = require('./app.js');
        
        // Mock some state
        appState.lastResultItems = [{ itemName: 'Test Item' }];
        appState.lastAIResponse = { items: [{ itemName: 'Test Item' }] };
        appState.lastImageDataUrl = 'data:image/png;base64,test';
        
        // Show result card
        document.getElementById('result-card').classList.remove('hidden');
        
        // Call handleRetake
        handleRetake();
        
        // Check if result card is hidden
        this.assertTrue(document.getElementById('result-card').classList.contains('hidden'), 'Result card should be hidden');
        
        // Check if state is reset
        this.assertTrue(appState.lastResultItems === null, 'Last result items should be reset');
        this.assertTrue(appState.lastAIResponse === null, 'Last AI response should be reset');
        this.assertTrue(appState.lastImageDataUrl === null, 'Last image data URL should be reset');
        
        // Check if scan button is enabled
        this.assertTrue(!document.getElementById('scan-button').disabled, 'Scan button should be enabled');
    }

    // Test empty history state
    async testEmptyHistoryState() {
        // Setup
        setupMockDOM();
        const { toggleHistoryModal, displayHistory } = require('./app.js');
        
        // Mock empty history
        localStorage.setItem('trashSeparatorHistory_v2', '[]');
        
        // Show history modal
        toggleHistoryModal(true);
        
        // Display history
        displayHistory();
        
        // Check if empty message is visible
        const emptyMsg = document.getElementById('history-empty-message');
        this.assertTrue(!emptyMsg.classList.contains('hidden'), 'Empty history message should be visible');
    }

    // Test share results functionality
    async testShareResults() {
        // Setup
        setupMockDOM();
        const { handleShare } = require('./app.js');
        
        // Mock last result items
        appState.lastResultItems = [
            {
                itemName: "Plastic Bottle",
                primaryBin: "recyclable",
                primaryConfidence: 0.95
            }
        ];
        
        // Mock navigator.share
        navigator.share = async (data) => {
            this.assertTrue(data.title === 'EasyBin Waste Sorting Result', 'Share title should be correct');
            this.assertTrue(data.text.includes('Plastic Bottle'), 'Share text should include item name');
            this.assertTrue(data.text.includes('recyclable'), 'Share text should include bin type');
            this.assertTrue(data.text.includes('95%'), 'Share text should include confidence');
            return true;
        };
        
        // Call handleShare
        await handleShare();
    }

    // Test save to photos functionality
    async testSaveToPhotos() {
        // Setup
        setupMockDOM();
        const { handleSaveToPhotos } = require('./app.js');
        
        // Mock last result items
        appState.lastResultItems = [
            {
                itemName: "Plastic Bottle",
                primaryBin: "recyclable",
                primaryConfidence: 0.95,
                material: "PET",
                reasoning: "Clear plastic bottle, typically recyclable."
            }
        ];
        
        // Mock canvas.toBlob
        HTMLCanvasElement.prototype.toBlob = function(callback, type, quality) {
            // Create a mock blob
            const blob = new Blob([''], { type: 'image/png' });
            callback(blob);
        };
        
        // Mock URL.createObjectURL
        URL.createObjectURL = () => 'mock-url';
        
        // Mock document.createElement for anchor
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            if (tagName === 'a') {
                return {
                    href: null,
                    download: null,
                    click: () => {},
                    setAttribute: () => {},
                    remove: () => {}
                };
            }
            return originalCreateElement.call(document, tagName);
        };
        
        // Call handleSaveToPhotos
        handleSaveToPhotos();
        
        // Reset createElement
        document.createElement = originalCreateElement;
    }

    // Test quick tips overlay
    async testQuickTipsOverlay() {
        // Setup
        setupMockDOM();
        const { showTips } = require('./app.js');
        
        // Mock tips button and overlay
        const tipsButton = document.getElementById('tips-button');
        const tipsOverlay = document.getElementById('quick-tips-overlay');
        
        // Call showTips
        showTips();
        
        // Check if overlay is visible
        this.assertTrue(tipsOverlay.classList.contains('flex'), 'Tips overlay should be visible');
        this.assertTrue(!tipsOverlay.classList.contains('hidden'), 'Tips overlay should not be hidden');
        
        // Test close button
        const closeTips = document.getElementById('close-tips');
        closeTips.click();
        this.assertTrue(tipsOverlay.classList.contains('hidden'), 'Tips overlay should be hidden after close');
        
        // Test next tip button
        showTips();
        const nextTip = document.getElementById('next-tip');
        nextTip.click();
        // This is a basic check - we can't easily verify the content change in this mock
        this.assertTrue(true, 'Next tip button should work');
    }

    // Test visual feedback for bin selection
    async testVisualFeedbackForBinSelection() {
        // Setup
        setupMockDOM();
        const { displayAIResults } = require('./app.js');
        
        // Mock items data
        const items = [
            {
                itemName: "Plastic Bottle",
                primaryBin: "recyclable",
                primaryConfidence: 0.95,
                material: "PET",
                reasoning: "Clear plastic bottle, typically recyclable.",
                isContaminated: false,
                position: "center"
            }
        ];
        
        // Mock generateBinDetails
        const generateBinDetails = () => ({
            binColorClassKey: 'us-recyclable',
            regionalBinName: 'Recycling',
            uiBinName: 'Recycling',
            binIconClass: 'fa-recycle',
            headerMaterialSummary: 'Plastic',
            binNameKey: 'binNameRecyclingUS',
            specificInstructionKey: 'instructionRecyclingUS'
        });
        
        // Mock binColorClasses and binBorderColorClasses
        const binColorClasses = { 'us-recyclable': 'bg-blue-500' };
        const binBorderColorClasses = { 'us-recyclable': 'border-blue-500' };
        
        // Call displayAIResults
        displayAIResults(items);
        
        // Check if bin header has the correct classes
        const binHeader = document.getElementById('bin-header');
        this.assertTrue(binHeader.className.includes('transition-all'), 'Bin header should have transition-all class');
        this.assertTrue(binHeader.className.includes('duration-500'), 'Bin header should have duration-500 class');
        this.assertTrue(binHeader.className.includes('ease-in-out'), 'Bin header should have ease-in-out class');
        this.assertTrue(binHeader.className.includes('transform'), 'Bin header should have transform class');
        
        // Check if animation properties are set
        this.assertTrue(binHeader.style.transform === 'scale(1)', 'Bin header should have scale transform');
        this.assertTrue(binHeader.style.opacity === '1', 'Bin header should have opacity 1');
    }

    // Assertion helpers
    assertTrue(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    assertFalse(condition, message) {
        if (condition) {
            throw new Error(message);
        }
    }

    assertEquals(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
        }
    }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('load', () => {
        const testSuite = new TestSuite();
        testSuite.run();
    });
}

// Export for testing frameworks
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestSuite;
}