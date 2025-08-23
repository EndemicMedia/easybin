/**
 * EasyBin Security Module
 * Client-side security enhancements and validation
 */

class SecurityManager {
    constructor() {
        this.cspViolations = [];
        this.permissionStates = new Map();
        this.init();
    }

    init() {
        this.setupCSPReporting();
        this.setupPermissionMonitoring();
        this.sanitizeErrors();
        this.validateIntegrity();
        
        console.log('🔒 Security Manager initialized');
    }

    /**
     * Setup CSP violation reporting
     */
    setupCSPReporting() {
        document.addEventListener('securitypolicyviolation', (e) => {
            const violation = {
                timestamp: new Date().toISOString(),
                directive: e.violatedDirective,
                blockedURI: e.blockedURI,
                originalPolicy: e.originalPolicy,
                referrer: e.referrer,
                userAgent: navigator.userAgent
            };
            
            this.cspViolations.push(violation);
            console.warn('🚨 CSP Violation:', violation);
            
            // Report to analytics if available
            if (typeof window.trackEvent === 'function') {
                window.trackEvent('security', 'csp_violation', {
                    directive: e.violatedDirective,
                    blocked_uri: e.blockedURI
                });
            }
        });
    }

    /**
     * Monitor camera and other sensitive permissions
     */
    async setupPermissionMonitoring() {
        if ('permissions' in navigator) {
            try {
                const permissions = ['camera', 'microphone', 'geolocation'];
                
                for (const permission of permissions) {
                    try {
                        const result = await navigator.permissions.query({ name: permission });
                        this.permissionStates.set(permission, result.state);
                        
                        result.addEventListener('change', () => {
                            const oldState = this.permissionStates.get(permission);
                            const newState = result.state;
                            this.permissionStates.set(permission, newState);
                            
                            console.log(`🔐 Permission ${permission}: ${oldState} → ${newState}`);
                            
                            // Track permission changes
                            if (typeof window.trackEvent === 'function') {
                                window.trackEvent('security', 'permission_change', {
                                    permission: permission,
                                    from: oldState,
                                    to: newState
                                });
                            }
                        });
                    } catch (permError) {
                        console.log(`Permission ${permission} not supported`);
                    }
                }
            } catch (error) {
                console.log('Permissions API not supported');
            }
        }
    }

    /**
     * Sanitize error messages to prevent information disclosure
     */
    sanitizeErrors() {
        const originalConsoleError = console.error;
        console.error = (...args) => {
            // Log full error for debugging but sanitize for production
            if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
                const sanitized = args.map(arg => 
                    typeof arg === 'string' 
                        ? arg.replace(/\/[^\s]+/g, '[path]') // Remove file paths
                             .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[ip]') // Remove IPs
                        : arg
                );
                originalConsoleError.apply(console, sanitized);
            } else {
                originalConsoleError.apply(console, args);
            }
        };
    }

    /**
     * Validate resource integrity and security
     */
    validateIntegrity() {
        // Check if all external scripts loaded successfully
        const externalResources = [
            { name: 'Tailwind CSS', selector: 'script[src*="tailwindcss"]' },
            { name: 'Font Awesome', selector: 'link[href*="font-awesome"]' },
            { name: 'Puter.js', selector: 'script[src*="puter.com"]' }
        ];

        externalResources.forEach(resource => {
            const element = document.querySelector(resource.selector);
            if (!element) {
                console.warn(`⚠️ External resource not found: ${resource.name}`);
                
                if (typeof window.trackEvent === 'function') {
                    window.trackEvent('security', 'missing_resource', {
                        resource: resource.name
                    });
                }
            }
        });
    }

    /**
     * Secure camera access validation
     */
    async validateCameraAccess() {
        try {
            // Check permission state first
            if ('permissions' in navigator) {
                const permission = await navigator.permissions.query({ name: 'camera' });
                
                if (permission.state === 'denied') {
                    throw new Error('Camera permission denied');
                }
                
                if (permission.state === 'prompt') {
                    console.log('🔐 Camera permission required');
                }
            }

            // Validate camera access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            // Immediately release for validation
            stream.getTracks().forEach(track => track.stop());
            
            console.log('✅ Camera access validated');
            return true;
            
        } catch (error) {
            console.warn('⚠️ Camera access validation failed:', this.sanitizeErrorMessage(error.message));
            
            if (typeof window.trackEvent === 'function') {
                window.trackEvent('security', 'camera_validation_failed', {
                    error: this.sanitizeErrorMessage(error.message)
                });
            }
            
            return false;
        }
    }

    /**
     * Sanitize error messages for security
     */
    sanitizeErrorMessage(message) {
        return message
            .replace(/\/[^\s]+/g, '[path]') // Remove file paths
            .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[ip]') // Remove IPs
            .replace(/\b[A-Za-z0-9+/]{20,}\b/g, '[token]'); // Remove potential tokens
    }

    /**
     * Secure blob handling for images
     */
    createSecureBlob(data, type = 'image/jpeg') {
        try {
            const blob = new Blob([data], { type });
            
            // Validate blob size (prevent DoS)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (blob.size > maxSize) {
                throw new Error('File size exceeds security limit');
            }
            
            // Create secure object URL
            const url = URL.createObjectURL(blob);
            
            // Auto-cleanup after 5 minutes to prevent memory leaks
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 5 * 60 * 1000);
            
            return url;
            
        } catch (error) {
            console.error('Secure blob creation failed:', this.sanitizeErrorMessage(error.message));
            return null;
        }
    }

    /**
     * Get security status report
     */
    getSecurityStatus() {
        return {
            cspViolations: this.cspViolations.length,
            permissions: Object.fromEntries(this.permissionStates),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            secureContext: window.isSecureContext,
            protocol: window.location.protocol
        };
    }

    /**
     * Validate secure context (HTTPS)
     */
    validateSecureContext() {
        if (!window.isSecureContext) {
            console.warn('⚠️ Application not running in secure context (HTTPS required for production)');
            
            if (typeof window.trackEvent === 'function') {
                window.trackEvent('security', 'insecure_context', {
                    protocol: window.location.protocol,
                    hostname: window.location.hostname
                });
            }
            
            return false;
        }
        
        return true;
    }

    /**
     * Initialize security features when DOM is ready
     */
    static init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.SecurityManager = new SecurityManager();
            });
        } else {
            window.SecurityManager = new SecurityManager();
        }
    }
}

// Auto-initialize security manager
SecurityManager.init();

// Export for global access
window.SecurityManager = SecurityManager;