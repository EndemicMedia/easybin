# EasyBin Production Deployment Guide

## Overview

This guide covers production deployment considerations for EasyBin, with focus on API integration, error handling, performance, and security. EasyBin uses the Pollinations.AI Vision API for waste image analysis.

## API Rate Limits and Quotas

### Pollinations.AI Tier System

EasyBin must operate within Pollinations.AI rate limit tiers:

| Tier | Rate Limit | Concurrent | Use Case | Upgrade Path |
|------|-----------|-----------|----------|--------------|
| **Anonymous** | 15 sec | 1 | Testing, development | None (public) |
| **Seed** | 5 sec | 1 | Registered referrer | Register at auth.pollinations.ai |
| **Flower** | 3 sec | 1 | High-volume apps | Contact sales |
| **Nectar** | Unlimited | 5+ | Enterprise | Contact sales |

### Recommended Production Tier

**Minimum: Seed Tier** (5 sec rate limit)

For production deployment:
1. Register your app's referrer domain at [auth.pollinations.ai](https://auth.pollinations.ai)
2. Add referrer parameter to API calls:
   ```javascript
   // Optional - automatic via Referer header in browsers
   // Or explicit: ?referrer=yourdomain.com
   ```

### Request Queuing Strategy

Implement request queuing to respect rate limits:

```javascript
class RequestQueue {
    constructor(delayMs = 5000) {
        this.queue = [];
        this.processing = false;
        this.delayMs = delayMs;
    }

    async add(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        const { fn, resolve, reject } = this.queue.shift();

        try {
            const result = await fn();
            resolve(result);
        } catch (error) {
            reject(error);
        }

        await new Promise(r => setTimeout(r, this.delayMs));
        this.processing = false;
        this.process();
    }
}

// Usage in app.js
const pollRequestQueue = new RequestQueue(5000);

// Queue analysis requests
async function queueWasteAnalysis(imageData) {
    return pollRequestQueue.add(() =>
        callPollinationsAI(analyzeWastePrompt, imageData)
    );
}
```

## Error Handling Expectations

### Common API Error Scenarios

#### 429 - Rate Limited
**Cause:** Exceeded tier rate limits
**Response:** Retry with exponential backoff (already implemented)
**Prevention:**
- Register for Seed tier
- Implement request queuing
- Monitor error logs for patterns

#### 500/502/503 - Server Errors
**Cause:** Pollinations API infrastructure issue
**Response:** Automatic retry (built-in, max 2 retries)
**Fallback:** Show user error message after retries

#### 400 - Bad Request
**Cause:** Invalid request format or corrupted image
**Response:** Don't retry, show detailed error
**Prevention:**
- Validate base64 encoding
- Test image compression
- Check prompt format

#### Network Timeout
**Cause:** Slow network or server response time
**Response:** Retry with delay (built-in)
**Timeout threshold:** 30 seconds (fetch default)

### Error Recovery Strategy

```javascript
// In app.js - callPollinationsAI function
async function analyzeWasteWithFallback(imageData) {
    try {
        return await queueWasteAnalysis(imageData);
    } catch (error) {
        // Log error for monitoring
        if (errorMonitor) {
            errorMonitor.captureError({
                type: 'waste_analysis_failed',
                message: error.message,
                statusCode: error.statusCode
            });
        }

        // Show user-friendly error
        if (error.statusCode === 429) {
            showError("Too many requests. Please wait before trying again.");
        } else if (error.statusCode >= 500) {
            showError("Service unavailable. Please try again in a moment.");
        } else if (error.statusCode === 400) {
            showError("Image format invalid. Please try another image.");
        } else {
            showError("Analysis failed. Please check your connection.");
        }

        return null;
    }
}
```

## Performance Benchmarks

### Expected Performance Metrics

| Metric | Target | Acceptable | Degraded |
|--------|--------|----------|----------|
| API response time | 2-3 sec | 2-5 sec | 5-10 sec |
| P95 response time | < 5 sec | < 8 sec | > 8 sec |
| P99 response time | < 8 sec | < 15 sec | > 15 sec |
| Image upload time | < 2 sec | < 3 sec | > 3 sec |
| Request size | 50-100 KB | < 200 KB | > 200 KB |
| Success rate | > 95% | > 90% | < 90% |

### Performance Optimization

#### 1. Image Compression
```javascript
// Current implementation (app.js)
function resizeAndCompressImage(canvas, maxWidth = 800, maxHeight = 600) {
    const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width * scale;
    newCanvas.height = canvas.height * scale;

    const ctx = newCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);

    return newCanvas.toDataURL('image/jpeg', 0.7); // 70% quality
}
```
**Result:** Reduces payload from ~500 KB to ~50-100 KB

#### 2. Caching Strategies
```javascript
// Cache analysis results by image hash
const analysisCache = new Map();
const MAX_CACHE_SIZE = 100;

async function getAnalysisWithCache(imageData) {
    const hash = hashImageData(imageData);

    if (analysisCache.has(hash)) {
        return analysisCache.get(hash);
    }

    const result = await analyzeWasteWithFallback(imageData);

    if (analysisCache.size >= MAX_CACHE_SIZE) {
        // Remove oldest entry
        const oldestKey = analysisCache.keys().next().value;
        analysisCache.delete(oldestKey);
    }

    analysisCache.set(hash, result);
    return result;
}
```

#### 3. Batch Processing
```javascript
// Group multiple images for analysis
async function batchAnalyzeImages(images) {
    const results = [];
    const delay = 5100; // Respect rate limit

    for (let i = 0; i < images.length; i++) {
        if (i > 0) {
            await new Promise(r => setTimeout(r, delay));
        }
        try {
            const result = await analyzeWasteWithFallback(images[i]);
            results.push(result);
        } catch (error) {
            console.error(`Image ${i} analysis failed:`, error);
            results.push(null);
        }
    }

    return results;
}
```

## Monitoring and Alerting

### Key Metrics to Monitor

#### 1. API Success Rate
```javascript
// Track in error-monitor.js
class AnalyticsMonitor {
    recordSuccess(responseTime) {
        this.successCount++;
        this.responseTimes.push(responseTime);
    }

    recordFailure(errorType) {
        this.failureCount++;
        this.failuresByType[errorType] =
            (this.failuresByType[errorType] || 0) + 1;
    }

    getMetrics() {
        const total = this.successCount + this.failureCount;
        return {
            successRate: (this.successCount / total * 100).toFixed(2) + '%',
            averageResponseTime: (this.responseTimes.reduce((a,b) => a+b, 0) /
                                 this.responseTimes.length).toFixed(0) + 'ms',
            failureTypes: this.failuresByType
        };
    }
}
```

#### 2. Error Rate by Type
Monitor in application:
- Network errors (retryable)
- API errors (4xx, 5xx)
- Timeout errors
- Image format errors
- JSON parse errors

#### 3. Response Time Distribution
```javascript
// Collect response time metrics
function trackMetrics(responseTime, success, errorType) {
    if (typeof window.metrics === 'undefined') {
        window.metrics = {
            responseTimes: [],
            errors: [],
            successCount: 0,
            failureCount: 0
        };
    }

    window.metrics.responseTimes.push(responseTime);

    if (success) {
        window.metrics.successCount++;
    } else {
        window.metrics.failureCount++;
        window.metrics.errors.push(errorType);
    }

    // Keep last 1000 metrics
    if (window.metrics.responseTimes.length > 1000) {
        window.metrics.responseTimes.shift();
    }
}
```

### Alerting Thresholds

| Alert | Threshold | Action |
|-------|-----------|--------|
| High error rate | > 10% failures | Check API status, review logs |
| Slow response | P95 > 8 sec | Check network, consider caching |
| Rate limit hits | > 5 per hour | Increase request delays |
| API unavailable | Consecutive errors | Use offline fallback |

## Fallback Strategies

### Offline Functionality

EasyBin includes Service Worker for offline operation:

```javascript
// sw.js - Already implemented
// Caches static assets, provides offline fallback

// For API calls - implement graceful degradation
async function analyzeWithOfflineFallback(imageData) {
    try {
        // Try API
        return await analyzeWasteWithFallback(imageData);
    } catch (error) {
        // Fallback: Show cached results or generic message
        if (!navigator.onLine) {
            showMessage("Offline: Analysis saved for later sync");
            savePendingAnalysis(imageData);
            return null;
        }
        throw error;
    }
}
```

### Cached Results Display

```javascript
// Show previously analyzed items when API fails
function showAnalysisWithFallback(analysis) {
    if (!analysis && lastSuccessfulAnalysis) {
        showNotification("Showing previous result (network issue)");
        displayAnalysis(lastSuccessfulAnalysis);
    } else if (analysis) {
        displayAnalysis(analysis);
    } else {
        showError("Unable to analyze. Try again.");
    }
}
```

## Security Considerations for Pollinations API

### 1. Request/Response Security

**HTTPS Enforcement:**
```javascript
// Force HTTPS for API calls
const API_ENDPOINT = 'https://text.pollinations.ai/openai';

// Verify in fetch
if (!API_ENDPOINT.startsWith('https://')) {
    throw new Error('API endpoint must use HTTPS');
}
```

**Content Security Policy:**
```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self';
    connect-src 'self' https://text.pollinations.ai;
    img-src 'self' data: blob: https:;
    style-src 'self' 'unsafe-inline';
    media-src 'self' blob:;
">
```

### 2. Data Privacy

**Image Handling:**
```javascript
// Ensure images are not logged or persisted
async function analyzeImage(imageData) {
    // Process in memory only
    const result = await callPollinationsAI(prompt, imageData);

    // Clear image from memory after use
    imageData = null;

    return result;
}
```

**No PII in Prompts:**
```javascript
// Don't include user info in prompts
// BAD:
const badPrompt = `Analyze waste for user ${userId}...`;

// GOOD:
const goodPrompt = `Analyze this waste item...`;
```

### 3. Authentication Best Practices

**For Production:**
1. Use Referrer-based auth (browser) - automatic
2. Register domain at auth.pollinations.ai
3. Never expose API tokens in frontend code

**If Backend Calls Needed:**
```javascript
// Backend-only implementation
const token = process.env.POLLINATIONS_API_TOKEN;

fetch('https://text.pollinations.ai/openai', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
});
```

## Recommended Scaling Approach

### Phase 1: Initial Deployment (< 100 daily users)
- Use Anonymous or Seed tier
- Single instance deployment
- Basic monitoring with console logs
- Error reporting via error-monitor.js

### Phase 2: Growth (100-1000 daily users)
- **Upgrade to Seed Tier** (5 sec rate limit)
- Implement request queuing
- Add basic analytics dashboard
- Set up error alert notifications
- Cache successful analyses locally

### Phase 3: Scale (1000+ daily users)
- **Consider Flower/Nectar Tier** (3 sec or unlimited)
- Load balancing for multiple instances
- Distributed caching (Redis)
- Advanced monitoring (Datadog/New Relic)
- A/B testing different image compression
- Consider backend proxy for API calls

### Phase 4: Enterprise (10000+ daily users)
- **Negotiate Nectar Tier**
- Multi-region deployment
- Content delivery network (CDN) for static assets
- Database for historical analyses
- Custom SLA with Pollinations
- Dedicated support

## Deployment Checklist

### Pre-Deployment
- [ ] Register referrer at auth.pollinations.ai
- [ ] Test with Seed tier rate limits
- [ ] Verify image compression (50-100 KB)
- [ ] Test error scenarios (429, 500, timeout)
- [ ] Verify CSP headers
- [ ] Check Service Worker caching
- [ ] Test offline functionality

### Deployment
- [ ] Enable production error monitoring
- [ ] Configure alerting thresholds
- [ ] Deploy with environment variables
- [ ] Test API endpoint connectivity
- [ ] Verify HTTPS everywhere
- [ ] Monitor error logs first 24 hours

### Post-Deployment
- [ ] Monitor API success rate (target > 95%)
- [ ] Track average response times (target 2-3 sec)
- [ ] Review error logs daily for first week
- [ ] Verify cache hit rates
- [ ] Adjust rate limit delays if needed
- [ ] Gather user feedback

## Troubleshooting Production Issues

### High Error Rate (> 10%)
1. Check Pollinations API status page
2. Verify request format in logs
3. Review error types:
   - 429: Reduce request rate
   - 4xx: Fix request format
   - 5xx: Wait for API recovery

### Slow Response Times (P95 > 8 sec)
1. Check network latency
2. Verify image compression working
3. Review cache hit rates
4. Consider upgrading tier

### Rate Limit Errors (429)
1. Increase delay between requests
2. Implement request queue (already available)
3. Register referrer for higher tier
4. Consider batch processing

### Image Analysis Failures
1. Verify base64 encoding in logs
2. Check image compression settings
3. Test with sample images
4. Review prompt format

## Support and Resources

- **Pollinations Status:** https://status.pollinations.ai
- **Pollinations API Docs:** https://github.com/pollinations/pollinations
- **EasyBin GitHub Issues:** Project repository
- **Error Monitoring:** Check error-monitor.js logs

---

**Last Updated:** December 2025
**Version:** 1.0
**Maintainer:** EasyBin Development Team
