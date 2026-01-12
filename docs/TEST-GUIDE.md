# EasyBin Testing Guide

## Overview

This guide covers all testing approaches for the EasyBin project, including manual API tests, E2E tests, and unit tests.

---

## Manual API Tests

### Test Files

Two manual test files verify the Pollinations API integration:

#### 1. `test-pollinations-manual.js`
**Purpose:** Verify core multimodal API functionality

**What it tests:**
- Canvas image creation and base64 encoding
- Proper multimodal request format (text + image)
- Pollinations API connectivity
- OpenAI-compatible response structure validation
- Content extraction from API response

**How to run:**
```bash
node test-pollinations-manual.js
```

**Expected Results:**
- ✅ Canvas creation: OK
- ✅ Base64 encoding: OK (444 characters)
- ✅ API connectivity: OK (HTTP 200)
- ✅ Response structure: OK

---

#### 2. `test-pollinations-waste-analysis.js`
**Purpose:** Verify end-to-end waste analysis workflow

**What it tests:**
- Full waste analysis prompt (1854 characters)
- Multimodal request with waste sorting instructions
- JSON response parsing
- Expected waste analysis fields validation (9 fields):
  - itemName, primaryBin, primaryConfidence
  - secondaryBin, secondaryConfidence
  - material, reasoning, isContaminated, position

**How to run:**
```bash
node test-pollinations-waste-analysis.js
```

**Expected Results:**
- ✅ Image preparation: OK
- ✅ Prompt formatting: OK (1854 chars)
- ✅ API connectivity: OK (HTTP 200)
- ✅ JSON parsing: OK
- ✅ Field validation: OK (9/9 fields)

---

## Quick Test Commands

### Run Both Manual Tests
```bash
node test-pollinations-manual.js && node test-pollinations-waste-analysis.js
```

### Run All Tests
```bash
# Unit tests
npm test

# E2E tests (requires dev server)
npm run test:e2e

# All tests
npm run test:all
```

### Start Dev Server for Testing
```bash
npm run serve
# Navigate to http://localhost:5050
```

---

## API Integration Details

### Multimodal Request Format

The Pollinations API uses OpenAI-compatible format:

```javascript
{
  model: 'openai',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: '[prompt]' },
      {
        type: 'image_url',
        image_url: { url: 'data:image/jpeg;base64,[base64_image]' }
      }
    ]
  }],
  max_tokens: 1000
}
```

**Endpoint:** `https://text.pollinations.ai/openai`  
**Method:** `POST`  
**Content-Type:** `application/json`

### Response Format

```javascript
{
  choices: [{
    message: {
      content: '[text or JSON content]'
    }
  }]
}
```

**Extraction:** `data.choices[0].message.content`

---

## Test Coverage Summary

| Aspect | Manual Test 1 | Manual Test 2 | Status |
|--------|---------------|---------------|--------|
| Canvas creation | ✅ | ✅ | Verified |
| Base64 encoding | ✅ | ✅ | Verified |
| Image formatting | ✅ | ✅ | Verified |
| Request structure | ✅ | ✅ | Verified |
| API connectivity | ✅ | ✅ | Verified (HTTP 200) |
| Response validation | ✅ | ✅ | Verified |
| JSON parsing | ✅ | ✅ | Verified |
| Waste prompt | ❌ | ✅ | Verified (1854 chars) |
| Field validation | ❌ | ✅ | Verified (9 fields) |

---

## E2E Tests

### Running E2E Tests

```bash
# Start server in one terminal
npm run serve

# Run E2E tests in another terminal
npm run test:e2e
```

### Test Files

- `tests/e2e.spec.js` - Main E2E test suite
- `tests/bento-redesign.spec.js` - Bento Grid UI tests

---

## Unit Tests

### Running Unit Tests

```bash
npm test
```

### Coverage

- **Test Suites:** 2 passed, 2 total
- **Tests:** 15 passed, 15 total
- **Coverage:** Core functionality

---

## Troubleshooting

### Issue: API Tests Failing

**Check:**
1. Internet connection is active
2. Pollinations API is accessible
3. Request format matches OpenAI compatibility
4. API rate limits or quota

### Issue: E2E Tests Connection Refused

**Solution:**
- Ensure dev server is running on port 5050
- Start server: `npm run serve`
- Verify with: `curl http://localhost:5050`

### Issue: Camera Tests Failing

**Expected:**
- Camera tests may fail in headless environments
- Permission denied is expected in test environments
- Tests are designed to handle graceful degradation

---

## Continuous Integration

For CI/CD pipelines:

```bash
# Start server in background
npm run serve &
SERVER_PID=$!

# Wait for server
sleep 5

# Run all tests
npm run test:all

# Cleanup
kill $SERVER_PID
```

---

## Additional Resources

- **API Documentation:** `docs/POLLINATIONS-APIDOCS.md`
- **Production Deployment:** `docs/PRODUCTION-DEPLOYMENT.md`
- **Implementation Details:** `docs/implementation.md`

---

**Last Updated:** January 11, 2026  
**Status:** ✅ All tests passing
