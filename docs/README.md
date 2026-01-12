# EasyBin Documentation

Complete documentation for the EasyBin smart waste sorting application.

---

## 📚 Quick Links

### Core Documentation
- **[API Integration Guide](./API-INTEGRATION.md)** - Multi-provider vision API setup and browser APIs
- **[Testing Guide](./TESTING.md)** - Complete testing reference (unit, E2E, cross-browser, API)
- **[Production Deployment](./PRODUCTION-DEPLOYMENT.md)** - Deployment guide and best practices
- **[Contributing Guidelines](./contributing.md)** - How to contribute to the project
- **[Style Guide](./style-guide.md)** - Code style and conventions

### API References
- **[Pollinations API](./POLLINATIONS-APIDOCS.md)** - Complete Pollinations API reference
- **[Vision API Tester](./VISION-API-TESTER.md)** - Testing utility documentation

### Future Planning
- **[Roadmap](./roadmap.md)** - Future features and enhancements
- **[Redesign Guide](./REDESIGN-GUIDE.md)** - Future UI redesign reference (MagicUI)

---

## 🚀 Getting Started

### For Users
1. Open the app in your browser
2. Click 🔑 to configure API keys (optional)
3. Start scanning items for waste sorting

### For Developers

#### Setup
```bash
# Clone and install
git clone <repository-url>
cd easybin
npm install
```

#### Create `.env` (Optional)
```bash
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_GEMINI_API_KEY=AIzaSy...
```

#### Run Development Server
```bash
npm run serve
# Open http://localhost:5050
```

#### Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

---

## 🏗️ Architecture

### Vision API System
- **2 free providers** (Pollinations)
- **4 Google Gemini models** (with API key)
- **6 OpenRouter free models** (with API key)
- Automatic fallback rotation
- User-configurable API keys

### Key Files
- `src/js/api-key-manager.js` - Browser localStorage key management
- `src/js/ai-provider-adapters.js` - Provider adapters
- `src/js/ai-vision-client.js` - Multi-provider orchestration
- `tools/vision-api-tester.js` - Testing utility

### Project Structure
```
easybin/
├── index.html              # Main entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── src/
│   ├── js/                 # Application JavaScript
│   └── css/                # Application styles
├── tools/                  # Development utilities
├── docs/                   # Documentation
└── tests/                  # Test files
```

---

## 🧪 Testing

### Quick Commands
```bash
# Unit tests
npm test

# E2E tests (requires dev server)
npm run test:e2e

# AI integration tests
npm run test:ai

# Vision API testing
npm run vision:list:gemini
npm run vision:speed:gemini
```

See [TESTING.md](./TESTING.md) for complete testing guide.

---

## 📖 Documentation Structure

### Current Documentation (8 files)
- `README.md` - This file
- `API-INTEGRATION.md` - Complete API reference
- `TESTING.md` - Testing guide
- `PRODUCTION-DEPLOYMENT.md` - Deployment guide
- `POLLINATIONS-APIDOCS.md` - Pollinations API reference
- `VISION-API-TESTER.md` - Tool documentation
- `contributing.md` - Contribution guidelines
- `style-guide.md` - Code style guide

### Future Reference (2 files)
- `roadmap.md` - Future features roadmap
- `REDESIGN-GUIDE.md` - Future UI redesign plans

### Archive
- `archive/` - Historical documentation

---

## 🤝 Contributing

1. Follow existing code style (see [style-guide.md](./style-guide.md))
2. Add tests for new features
3. Update documentation
4. Test with multiple providers
5. Check browser console for errors

See [contributing.md](./contributing.md) for detailed guidelines.

---

## 📄 License

See LICENSE file for details.

---

**Last Updated:** January 12, 2026  
**Status:** Production Ready
