# EasyBin Documentation

Complete documentation for the EasyBin smart waste sorting application.

## Quick Links

- [API Integration Guide](./API-INTEGRATION.md) - Multi-provider vision API setup
- [Vision API Tester](./VISION-API-TESTER.md) - Testing utility documentation
- [Test Guide](./TEST-GUIDE.md) - Testing strategy and commands
- [Production Deployment](./PRODUCTION-DEPLOYMENT.md) - Deployment guide
- [Pollinations API](./POLLINATIONS-APIDOCS.md) - Free vision API details

## Getting Started

### For Users
1. Open the app in your browser
2. Click 🔑 to configure API keys (optional)
3. Start scanning items for waste sorting

### For Developers
1. Clone the repository
2. Run `npm install`
3. Create `.env` with API keys (optional)
4. Run `npm run serve`
5. Open http://localhost:5050

## Architecture

**Vision API System:**
- 2 free providers (Pollinations)
- 4 Google Gemini models (with API key)
- 6 OpenRouter free models (with API key)
- Automatic fallback rotation
- User-configurable API keys

**Key Files:**
- `api-key-manager.js` - Browser localStorage key management
- `ai-provider-adapters.js` - Provider adapters
- `ai-vision-client.js` - Multi-provider orchestration
- `vision-api-tester.js` - Testing utility

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# AI integration tests
npm run test:ai

# All tests
npm run test:all

# Vision API testing
npm run vision:list:gemini
npm run vision:speed:gemini
```

## Contributing

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Test with multiple providers
5. Check browser console for errors

## License

See LICENSE file for details.
