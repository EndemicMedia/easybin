/**
 * Simple privacy-focused analytics for EasyBin
 * Tracks usage patterns without collecting personal data
 */

class EasyBinAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.maxEvents = 50; // Limit stored events
    }

    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            eventName,
            properties: {
                ...properties,
                userAgent: navigator.userAgent,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                screenResolution: `${screen.width}x${screen.height}`
            }
        };

        this.events.push(event);
        
        // Keep only recent events
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }

        // Log locally for development
        console.log('Analytics Event:', event);

        // In production, you'd send to your analytics endpoint
        // this.sendToAnalytics(event);
    }

    async sendToAnalytics(event) {
        try {
            // Example: Send to your own analytics endpoint
            // await fetch('/api/analytics', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(event)
            // });
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
    }

    // Track app initialization
    trackAppStart() {
        this.trackEvent('app_start', {
            timestamp: Date.now()
        });
    }

    // Track scan attempts
    trackScanAttempt(country, language) {
        this.trackEvent('scan_attempt', {
            country,
            language
        });
    }

    // Track successful identifications
    trackScanSuccess(itemType, confidence, binType, country, language) {
        this.trackEvent('scan_success', {
            itemType,
            confidence,
            binType,
            country,
            language
        });
    }

    // Track failed identifications
    trackScanFailure(reason, country, language) {
        this.trackEvent('scan_failure', {
            reason,
            country,
            language
        });
    }

    // Track user feedback
    trackFeedback(isCorrect, itemType, binType) {
        this.trackEvent('user_feedback', {
            isCorrect,
            itemType,
            binType
        });
    }

    // Track language/country changes
    trackSettingChange(setting, oldValue, newValue) {
        this.trackEvent('setting_change', {
            setting,
            oldValue,
            newValue
        });
    }

    // Track error occurrences
    trackError(errorType, errorMessage, context = {}) {
        this.trackEvent('error_occurred', {
            errorType,
            errorMessage: errorMessage.substring(0, 100), // Limit message length
            context
        });
    }

    // Track PWA installation
    trackPWAInstall() {
        this.trackEvent('pwa_install');
    }

    // Track offline usage
    trackOfflineUsage() {
        this.trackEvent('offline_usage');
    }

    // Get summary statistics
    getSessionSummary() {
        const events = this.events;
        const scanAttempts = events.filter(e => e.eventName === 'scan_attempt').length;
        const scanSuccesses = events.filter(e => e.eventName === 'scan_success').length;
        const scanFailures = events.filter(e => e.eventName === 'scan_failure').length;
        
        return {
            sessionId: this.sessionId,
            totalEvents: events.length,
            scanAttempts,
            scanSuccesses,
            scanFailures,
            successRate: scanAttempts > 0 ? (scanSuccesses / scanAttempts * 100).toFixed(1) : 0
        };
    }
}

// Initialize analytics
const analytics = new EasyBinAnalytics();

// Export for use in app.js
window.easyBinAnalytics = analytics;
