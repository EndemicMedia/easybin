# API Documentation

## Puter.ai Integration API
- **Endpoint**: `puter.ai.chat()`
- **Purpose**: Analyzes images and returns waste sorting recommendations
- **Request Format**: 
  - Prompt with structured JSON response requirements
  - Image data as base64-encoded string
- **Response Format**: JSON object containing:
  - `items` array with identification results
  - Item properties: `itemName`, `primaryBin`, `primaryConfidence`, `secondaryBin`, `secondaryConfidence`, `material`, `reasoning`, `isContaminated`, `position`
- **Error Handling**: Returns error object when identification fails

## Web Share API
- **Implementation**: Used for sharing results with others
- **Functionality**: 
  - Checks for `navigator.share` support
  - Creates share data object with title, text, and URL
  - Provides clipboard fallback when Web Share API is not supported
- **Fallback**: Uses Clipboard API or document.execCommand for copying text

## Web Storage API
- **Usage**: 
  - `localStorage` for persistent scan history storage
  - Key: `trashSeparatorHistory_v2`
  - Stores scan results with item data, images, timestamps, language, and region
- **Image Handling**: Images are resized and compressed before storage
- **Storage Management**: Implements progressive cleanup when quota is exceeded

## getUserMedia API
- **Purpose**: Camera access for capturing images
- **Configuration**:
  - Uses environment-facing camera
  - Ideal resolution: 1280x720
  - Facing mode: environment
- **Error Handling**:
  - Permission denied: Shows help screen with retry option
  - Camera not found: Displays appropriate error message
  - Not supported: Shows fallback message

## Service Worker API
- **Implementation**: `sw.js` handles PWA functionality
- **Features**:
  - Caching strategy with static, dynamic, and image caches
  - Offline support with fallback to `offline.html`
  - Background sync for failed AI requests
  - Push notification support
- **Cache Management**: 
  - Static assets cached during installation
  - Dynamic content cached on demand
  - Old caches cleaned during activation

## Navigator API
- **Geolocation**: 
  - Uses Puter Geo API as primary source
  - Falls back to ipapi.co service
  - Uses browser locale as final fallback
  - Detects country code for region-specific sorting rules
- **Network Status**: 
  - Monitors online/offline events
  - Updates UI status indicator
  - Tracks offline usage in analytics

## Clipboard API
- **Purpose**: Fallback for sharing functionality
- **Implementation**:
  - Uses `navigator.clipboard.writeText()` when available
  - Falls back to `document.execCommand('copy')` for older browsers
  - Creates temporary textarea for copying when needed
- **User Feedback**: Shows temporary "Shared!" message after successful copy