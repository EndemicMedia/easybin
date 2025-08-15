# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EasyBin is a Progressive Web Application (PWA) that uses AI to help users properly sort waste for recycling. The app uses camera capture and AI image analysis to identify items and provide region-specific sorting instructions.

## Development Commands

### Local Development
```bash
# Start development server with live reload
npm run dev

# Alternative: Start simple HTTP server
npm run serve
```

### Testing
```bash
# Run unit tests (Jest)
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests (Playwright)
npm run test:e2e

# Run all tests
npm run test:all

# Generate test coverage report
npm run test:coverage
```

### Single Test Examples
```bash
# Run specific unit test file
npx jest tests/core.test.js

# Run specific E2E test
npx playwright test tests/e2e.spec.js

# Run tests for specific browser
npx playwright test --project=chromium
```

## Architecture Overview

### Core Technologies
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Tailwind CSS (loaded via CDN)
- **Icons**: Font Awesome 6.5.1
- **AI Integration**: Puter.ai API for image analysis
- **Camera**: MediaDevices API for camera access
- **Storage**: localStorage for history and preferences
- **PWA**: Service Worker for offline functionality

### Application Structure

#### Main Application Files
- `index.html` - Main HTML structure with totem-style layout
- `app.js` - Core application logic (~1500 lines)
- `styles.css` - Custom CSS styles and animations
- `modern-features.js` - Advanced features (batch scanning, gamification)

#### Configuration and Localization
- `translations.js` - Multi-language support (English, German, Italian, Portuguese)
- `binStyles.js` - Regional bin color/styling mappings
- `manifest.json` - PWA configuration
- `sw.js` - Service Worker for offline functionality

#### Utility Modules
- `analytics.js` - Privacy-first usage tracking
- `error-monitor.js` - Error monitoring and reporting

### Key Architectural Patterns

#### Multi-Region Waste Sorting System
The app supports region-specific sorting rules:
- **US**: Blue (Recycling), Green (Organics), Gray/Black (General), Red (Hazardous)
- **Germany**: Blue (Paper), Yellow (Packaging), Brown (Organics), Gray (General)
- **Italy**: Blue (Paper), Green (Glass), Yellow (Plastic/Metal), Brown (Organics)
- **Brazil**: Blue (Paper), Red (Plastic), Green (Glass), Yellow (Metal), Brown (Organics)

#### AI Integration Architecture
1. **Image Capture**: Canvas-based image capture from video stream
2. **Image Processing**: JPEG compression and resizing for efficient transmission
3. **Structured Prompting**: Detailed JSON-structured prompts to Puter.ai
4. **Response Parsing**: Robust JSON parsing with error handling
5. **Result Display**: Dynamic UI updates based on AI response

#### State Management
- **Global State**: Stored in global variables (`userCountry`, `currentLanguage`, `lastResultItems`)
- **Persistent State**: localStorage for history, settings, and achievements
- **Session State**: Camera stream, current scan results, UI state

## Development Guidelines

### Working with Core Functions

#### Key Functions in app.js
- `generateBinDetails(binType, material, country)` - Determines bin classification and styling
- `generateInstructionText(item, details)` - Creates localized disposal instructions
- `displayAIResults(items)` - Renders AI analysis results in UI
- `saveResultToHistory(itemData, imageDataUrl)` - Saves scan results with compression
- `detectUserCountry()` - Auto-detects user's region via IP/locale

#### Testing Considerations
- Unit tests are in `tests/core.test.js` (Jest)
- E2E tests are in `tests/e2e.spec.js` (Playwright)
- Tests require camera permission mocking for E2E scenarios
- Mock AI responses for predictable testing

#### Camera Integration
```javascript
// Camera initialization pattern
const stream = await navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 }
    }
});
```

#### AI Response Format
Expected JSON structure from Puter.ai:
```json
{
  "items": [{
    "itemName": "Plastic Bottle",
    "primaryBin": "recyclable",
    "primaryConfidence": 0.95,
    "secondaryBin": "general-waste",
    "secondaryConfidence": 0.05,
    "material": "plastic",
    "reasoning": "Clean PET plastic bottle",
    "isContaminated": false,
    "position": "center"
  }]
}
```

### PWA Development

#### Service Worker (sw.js)
- Caches static assets for offline functionality
- Implements cache-first strategy for app shell
- Provides offline fallback pages

#### Manifest Configuration
- Standalone display mode for app-like experience
- Portrait orientation optimized for mobile
- Green theme color (#10b981) matching brand

### Adding New Features

#### Localization
1. Add translations to `translations.js` for each supported language (`en`, `de`, `it`, `pt`)
2. Add region-specific translations if needed (`br` for Brazil-specific Portuguese)
3. Update `updateUIText()` function for new UI elements

#### New Regions
1. Add country option to HTML select element
2. Add bin mappings in `generateBinDetails()`
3. Add color classes in `binStyles.js`
4. Add translations for region-specific bin names and instructions

#### Modern Features Extension
The `modern-features.js` module provides:
- Batch scanning capabilities
- Gamification system with achievements
- Advanced camera controls (flash, flip, zoom)
- Smart suggestions based on scan results
- Toast notifications and enhanced UI

## Common Development Tasks

### Adding a New Waste Type
1. Update AI prompt in `app.js` to recognize the new type
2. Add bin classification logic in `generateBinDetails()`
3. Add appropriate color classes in `binStyles.js`
4. Add translations for the new type in `translations.js`

### Debugging AI Responses
- Check browser console for `Raw AI Response Received` logs
- Verify JSON structure matches expected format
- Use `lastAIResponse` global variable for debugging
- Test with mock responses in E2E tests

### Performance Optimization
- Image compression is handled in `resizeAndCompressImage()`
- History storage uses progressive cleanup to prevent quota exceeded errors
- Modern features are lazy-loaded and can be disabled

### Offline Functionality
- Critical app functionality works offline via Service Worker
- History is stored locally and survives offline periods
- AI analysis requires internet connection
- Graceful degradation when offline

## Error Handling Patterns

The application implements comprehensive error handling:
- Camera permission errors with user guidance
- AI API failures with retry mechanisms
- Storage quota exceeded with progressive cleanup
- Network connectivity monitoring with status indicators
- Parse errors with detailed logging for debugging

## Security Considerations

- No API keys or sensitive data in client-side code
- Image data is processed locally before transmission
- localStorage is used only for non-sensitive user preferences
- Camera access requires explicit user permission
- AI processing happens on Puter.ai servers (external dependency)