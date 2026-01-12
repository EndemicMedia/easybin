/**
 * Error monitoring and reporting for EasyBin
 */

class ErrorMonitor {
    constructor() {
        this.errors = [];
        this.maxErrors = 20;
        this.init();
    }

    init() {
        // Catch unhandled JavaScript errors
        window.addEventListener('error', (event) => {
            this.captureError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError({
                type: 'unhandled_promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack
            });
        });

        // Monitor network errors
        this.monitorNetworkErrors();
    }

    captureError(errorInfo) {
        const error = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            ...errorInfo,
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.getUserId(), // Anonymous user identifier
        };

        this.errors.push(error);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        console.error('Error captured:', error);
        
        // Track with analytics
        if (window.easyBinAnalytics) {
            window.easyBinAnalytics.trackError(error.type, error.message, {
                filename: error.filename,
                line: error.line
            });
        }

        // Send to error reporting service (in production)
        // this.sendToErrorService(error);
    }

    generateErrorId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getUserId() {
        // Generate or retrieve anonymous user ID
        let userId = localStorage.getItem('easybin_user_id');
        if (!userId) {
            userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            localStorage.setItem('easybin_user_id', userId);
        }
        return userId;
    }

    monitorNetworkErrors() {
        // Monitor fetch failures
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    this.captureError({
                        type: 'network_error',
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        url: args[0],
                        status: response.status
                    });
                }
                return response;
            } catch (error) {
                this.captureError({
                    type: 'network_error',
                    message: error.message,
                    url: args[0]
                });
                throw error;
            }
        };
    }

    // Method to manually report errors
    reportError(error, context = {}) {
        this.captureError({
            type: 'manual_error',
            message: error.message || error,
            stack: error.stack,
            context
        });
    }

    // Get error summary for debugging
    getErrorSummary() {
        const errorTypes = {};
        this.errors.forEach(error => {
            errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
        });

        return {
            totalErrors: this.errors.length,
            errorTypes,
            recentErrors: this.errors.slice(-5).map(error => ({
                type: error.type,
                message: error.message,
                timestamp: error.timestamp
            }))
        };
    }

    // Clear errors (for debugging)
    clearErrors() {
        this.errors = [];
    }

    async sendToErrorService(error) {
        try {
            // Example: Send to your error reporting service
            // await fetch('/api/errors', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(error)
            // });
        } catch (sendError) {
            console.warn('Failed to send error report:', sendError);
        }
    }
}

// Initialize error monitoring
const errorMonitor = new ErrorMonitor();

// Export for manual error reporting
window.easyBinErrorMonitor = errorMonitor;
