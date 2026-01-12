# API Integration Guide

Complete guide for EasyBin's multi-provider vision API architecture with user API key configuration.

## Overview

EasyBin uses a multi-provider vision API system with intelligent fallback rotation. Users can optionally configure their own API keys for premium providers.

**Without API Keys:** 2 free providers  
**With API Keys:** Up to 12 providers total

---

## Provider Architecture

### Free Providers (Always Available)

1. **Puter.ai** - Primary provider (when available)
   - Endpoint: `puter.ai.chat()`
   - Geolocation: `puter.geo.get()`
   - Loaded from: `https://js.puter.com/v2/`
   - Fallback: Automatically falls back to Pollinations if unavailable

2. **Pollinations (Gemini)** - Free fallback provider
3. **Pollinations (Bidara)** - Secondary free provider

### Premium Providers (Require API Keys)

#### Google Gemini (4 models)
- `gemini-flash-lite-latest` - 1.6s ⚡⚡⚡ (Fastest)
- `gemini-2.5-flash-lite` - 2.3s ⚡⚡
- `gemini-flash-latest` - 3.2s ⚡⚡
- `gemini-2.5-flash` - 4.8s ⚡

#### OpenRouter (6 free models)
- `allenai/molmo-2-8b:free` - 3.0s (Best quality)
- `google/gemma-3-12b-it:free` - 4.1s (Detailed)
- `google/gemma-3-4b-it:free` - 3.1s
- `qwen/qwen-2.5-vl-7b-instruct:free` - 3.8s
- `nvidia/nemotron-nano-12b-v2-vl:free` - 3.4s
- `google/gemma-3-27b-it:free` - 3.4s (Largest context)

---

## Getting API Keys

### Google Gemini
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Format: `AIzaSy...`
4. Free tier available

### OpenRouter
1. Visit [OpenRouter Keys](https://openrouter.ai/keys)
2. Create a new API key
3. Format: `sk-or-v1-...`
4. Free tier: 50 requests/day

---

## Configuration

### For Users (Browser)

1. Click the 🔑 button in the navbar
2. Enter your API key(s)
3. Click "Save Keys"
4. Keys are stored securely in browser localStorage
5. Providers activate automatically

### For Developers (Testing)

Create `.env` file in project root:
```bash
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_GEMINI_API_KEY=AIzaSy...
```

**Note:** `.env` is already in `.gitignore` - never commit API keys!

---

## Testing Vision APIs

Use the consolidated testing utility:

```bash
# List available models
npm run vision:list:openrouter
npm run vision:list:gemini

# Test specific model
npm run vision:test:gemini models/gemini-flash-lite-latest
npm run vision:test:openrouter allenai/molmo-2-8b:free

# Speed comparison
npm run vision:speed:gemini
```

See [VISION-API-TESTER.md](./VISION-API-TESTER.md) for detailed documentation.

---

## Architecture

### Core Components

**`api-key-manager.js`**
- Manages API keys in browser localStorage
- Methods: `getKey()`, `setKey()`, `removeKey()`, `clearAll()`
- No server transmission

**`ai-provider-adapters.js`**
- `PollinationsAdapter` - Free provider
- `OpenRouterAdapter` - OpenAI-compatible format
- `GeminiAdapter` - Google Gemini format
- All extend `BaseAdapter`

**`ai-vision-client.js`**
- `MultiProviderVisionClient` - Main orchestrator
- Dynamic provider configuration based on API keys
- Automatic fallback rotation
- Health tracking and rate limit detection

**`app.js`**
- API keys modal UI integration
- Event handlers for save/clear
- Client reinitialization on key changes

---

## Provider Priority

Providers are tried in this order:

1. **Pollinations (Gemini)** - Free, fast
2. **Pollinations (Bidara)** - Free, fallback
3. **Google Gemini Flash-Lite** - 1.6s (if key configured)
4. **Google Gemini 2.5 Flash-Lite** - 2.3s (if key configured)
5. **Google Gemini Flash** - 3.2s (if key configured)
6. **Google Gemini 2.5 Flash** - 4.8s (if key configured)
7. **OpenRouter Molmo** - 3.0s (if key configured)
8. **OpenRouter Gemma 3-12B** - 4.1s (if key configured)
9. **OpenRouter Gemma 3-4B** - 3.1s (if key configured)
10. **OpenRouter Qwen VL** - 3.8s (if key configured)
11. **OpenRouter Nemotron** - 3.4s (if key configured)
12. **OpenRouter Gemma 3-27B** - 3.4s (if key configured)

---

## Security

- ✅ API keys stored in browser localStorage only
- ✅ Never transmitted to any server except target API
- ✅ Password-masked input fields
- ✅ User can clear keys anytime
- ✅ `.env` file in `.gitignore`

**Note:** Keys are visible in browser DevTools but only accessible to same origin.

---

## Troubleshooting

### "No providers configured"
- Check that API keys are entered correctly
- Verify keys are saved (check browser localStorage)
- Refresh the page

### "Rate limit exceeded"
- Free tier limits reached
- System will automatically try next provider
- Consider upgrading API plan or using multiple keys

### "API key required but not configured"
- Provider requires authentication
- Add API key in settings modal
- Or disable that provider

### Slow responses
- Check network connection
- Some models are slower than others
- Use Gemini Flash-Lite for fastest results (1.6s)

---

## Performance Tips

1. **Use Gemini Flash-Lite** for fastest responses (1.6s)
2. **Configure both keys** for maximum resilience
3. **Monitor rate limits** in provider dashboards
4. **Test models** before production use

---

## Related Documentation

- [VISION-API-TESTER.md](./VISION-API-TESTER.md) - Testing utility guide
- [POLLINATIONS-APIDOCS.md](./POLLINATIONS-APIDOCS.md) - Pollinations API details
- [TEST-GUIDE.md](./TEST-GUIDE.md) - Testing strategy

---

## Vision API Integration

### Puter.ai API
- **Endpoint**: `puter.ai.chat()`
- **Purpose**: Primary AI vision API for waste image analysis
- **Loading**: Dynamically loaded from `https://js.puter.com/v2/`
- **Request Format**:
  - Prompt with structured JSON response requirements
  - Image data as base64-encoded string
- **Response Format**: JSON object containing:
  - `items` array with identification results
  - Item properties: `itemName`, `primaryBin`, `primaryConfidence`, `secondaryBin`, `secondaryConfidence`, `material`, `reasoning`, `isContaminated`, `position`
- **Error Handling**: Returns error object when identification fails
- **Fallback**: Automatically falls back to Pollinations.AI if Puter.js is not available

### Puter Geo API
- **Endpoint**: `puter.geo.get()`
- **Purpose**: Primary geolocation service for country detection
- **Usage**: Detects user's country for region-specific waste sorting rules
- **Fallback Chain**:
  1. Puter Geo API (primary)
  2. ipapi.co service (secondary)
  3. Browser locale (final fallback)

---

## Browser APIs Used

### Web Share API
- **Implementation:** Used for sharing results with others
- **Functionality:**
  - Checks for `navigator.share` support
  - Creates share data object with title, text, and URL
  - Provides clipboard fallback when Web Share API is not supported
- **Fallback:** Uses Clipboard API or document.execCommand for copying text

### Web Storage API
- **Usage:**
  - `localStorage` for persistent scan history storage
  - Key: `easybin_api_keys` for API key storage
  - Stores scan results with item data, images, timestamps, language, and region
- **Image Handling:** Images are resized and compressed before storage
- **Storage Management:** Implements progressive cleanup when quota is exceeded

### getUserMedia API
- **Purpose:** Camera access for capturing images
- **Configuration:**
  - Uses environment-facing camera
  - Ideal resolution: 1280x720
  - Facing mode: environment
- **Error Handling:**
  - Permission denied: Shows help screen with retry option
  - Camera not found: Displays appropriate error message
  - Not supported: Shows fallback message

### Service Worker API
- **Implementation:** `sw.js` handles PWA functionality
- **Features:**
  - Caching strategy with static, dynamic, and image caches
  - Offline support with fallback to `offline.html`
  - Background sync for failed AI requests
  - Push notification support
- **Cache Management:**
  - Static assets cached during installation
  - Dynamic content cached on demand
  - Old caches cleaned during activation

### Navigator API
- **Geolocation:**
  - Primary: Puter Geo API (`puter.geo.get()`)
  - Secondary: ipapi.co service
  - Final fallback: Browser locale
  - Detects country code for region-specific sorting rules
- **Network Status:**
  - Monitors online/offline events
  - Updates UI status indicator
  - Tracks offline usage in analytics

### Clipboard API
- **Purpose:** Fallback for sharing functionality
- **Implementation:**
  - Uses `navigator.clipboard.writeText()` when available
  - Falls back to `document.execCommand('copy')` for older browsers
  - Creates temporary textarea for copying when needed
- **User Feedback:** Shows temporary "Shared!" message after successful copy

---

## Support

For issues or questions:
1. Check browser console for errors
2. Test with `vision-api-tester.js`
3. Verify API keys are valid
4. Check provider status pages
