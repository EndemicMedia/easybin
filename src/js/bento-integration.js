// Integration script for Bento Grid layout with existing EasyBin functionality

class BentoIntegration {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🎨 Initializing Bento Grid integration');
        
        // Wait for DOM and other scripts to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
        } else {
            this.setupIntegration();
        }
    }

    setupIntegration() {
        this.setupResponsiveLayout();
        this.enhanceAnimations();
        this.setupCardInteractions();
        this.updateExistingFunctionality();
        this.isInitialized = true;
        
        console.log('✨ Bento Grid integration complete');
    }

    setupResponsiveLayout() {
        // Add responsive classes based on screen size
        const updateLayout = () => {
            const width = window.innerWidth;
            const body = document.body;
            
            // Remove existing layout classes
            body.classList.remove('layout-mobile', 'layout-tablet', 'layout-desktop');
            
            if (width < 768) {
                body.classList.add('layout-mobile');
                this.optimizeForMobile();
            } else if (width <= 1024) {
                body.classList.add('layout-tablet');
                this.optimizeForTablet();
            } else {
                body.classList.add('layout-desktop');
                this.optimizeForDesktop();
            }
        };

        updateLayout();
        window.addEventListener('resize', updateLayout);
    }

    optimizeForMobile() {
        // Optimize animations for mobile
        document.documentElement.style.setProperty('--animation-duration', '0.3s');
        
        // Reduce particle count for performance
        const particleContainers = document.querySelectorAll('.particles-container');
        particleContainers.forEach(container => {
            const particles = container.querySelectorAll('.particle');
            particles.forEach((particle, index) => {
                if (index > 15) { // Keep only first 15 particles
                    particle.style.display = 'none';
                }
            });
        });
    }

    optimizeForTablet() {
        // Restore normal animation speeds
        document.documentElement.style.setProperty('--animation-duration', '0.5s');
        
        // Show more particles
        const particleContainers = document.querySelectorAll('.particles-container');
        particleContainers.forEach(container => {
            const particles = container.querySelectorAll('.particle');
            particles.forEach((particle, index) => {
                if (index <= 20) {
                    particle.style.display = 'block';
                }
            });
        });
    }

    optimizeForDesktop() {
        // Full animation speeds and effects
        document.documentElement.style.setProperty('--animation-duration', '0.6s');
        
        // Show all particles
        const particleContainers = document.querySelectorAll('.particles-container');
        particleContainers.forEach(container => {
            const particles = container.querySelectorAll('.particle');
            particles.forEach(particle => {
                particle.style.display = 'block';
            });
        });
    }

    enhanceAnimations() {
        // Add scanning animation to camera card
        const cameraCard = document.querySelector('.camera-card');
        if (cameraCard) {
            cameraCard.addEventListener('scanningStart', () => {
                cameraCard.classList.add('scanning-animation');
            });
            
            cameraCard.addEventListener('scanningEnd', () => {
                cameraCard.classList.remove('scanning-animation');
            });
        }

        // Enhance result card animations
        const resultsCard = document.querySelector('.results-card');
        if (resultsCard) {
            resultsCard.addEventListener('resultsShown', () => {
                this.animateResultsIn();
            });
        }
    }

    animateResultsIn() {
        const resultContent = document.getElementById('result-content');
        if (resultContent) {
            resultContent.style.opacity = '0';
            resultContent.style.transform = 'translateY(20px)';
            resultContent.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                resultContent.style.opacity = '1';
                resultContent.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    setupCardInteractions() {
        // Add hover effects for desktop
        if (window.innerWidth >= 1025) {
            this.setupDesktopHovers();
        }

        // Setup card focus states for accessibility
        const cards = document.querySelectorAll('.bento-card');
        cards.forEach(card => {
            card.setAttribute('tabindex', '0');
            
            card.addEventListener('focus', () => {
                card.style.outline = '2px solid var(--magic-ui-primary)';
                card.style.outlineOffset = '2px';
            });
            
            card.addEventListener('blur', () => {
                card.style.outline = 'none';
            });
        });
    }

    setupDesktopHovers() {
        const cards = document.querySelectorAll('.bento-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                // Add glow effect
                card.style.boxShadow = '0 25px 50px rgba(16, 185, 129, 0.15)';
                card.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                
                // Scale effect
                card.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = 'none';
                card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    updateExistingFunctionality() {
        // Override existing functions to work with new layout
        this.patchDisplayFunctions();
        this.patchCameraFunctions();
        this.patchResultFunctions();
    }

    patchDisplayFunctions() {
        // Patch the showSpinner function to work with new layout
        const originalShowSpinner = window.showSpinner;
        if (originalShowSpinner) {
            window.showSpinner = () => {
                // Call original function
                originalShowSpinner();
                
                // Add Bento-specific enhancements
                const cameraCard = document.querySelector('.camera-card');
                if (cameraCard) {
                    cameraCard.dispatchEvent(new CustomEvent('scanningStart'));
                }
            };
        }

        // Patch hideSpinner function
        const originalHideSpinner = window.hideSpinner;
        if (originalHideSpinner) {
            window.hideSpinner = () => {
                originalHideSpinner();
                
                const cameraCard = document.querySelector('.camera-card');
                if (cameraCard) {
                    cameraCard.dispatchEvent(new CustomEvent('scanningEnd'));
                }
            };
        }
    }

    patchCameraFunctions() {
        // Enhance camera loading states with new animations
        const originalShowCameraLoading = window.showCameraLoading;
        if (originalShowCameraLoading) {
            window.showCameraLoading = () => {
                originalShowCameraLoading();
                
                // Add border beam effect
                const cameraCard = document.querySelector('.camera-card');
                if (cameraCard) {
                    cameraCard.classList.add('border-beam');
                }
            };
        }

        const originalHideCameraLoading = window.hideCameraLoading;
        if (originalHideCameraLoading) {
            window.hideCameraLoading = () => {
                originalHideCameraLoading();
                
                const cameraCard = document.querySelector('.camera-card');
                if (cameraCard) {
                    cameraCard.classList.remove('border-beam');
                }
            };
        }
    }

    patchResultFunctions() {
        // Enhance result display with new animations
        const originalDisplayAIResults = window.displayAIResults;
        if (originalDisplayAIResults) {
            window.displayAIResults = (items) => {
                originalDisplayAIResults(items);
                
                // Trigger result animation
                const resultsCard = document.querySelector('.results-card');
                if (resultsCard) {
                    resultsCard.dispatchEvent(new CustomEvent('resultsShown'));
                }
                
                // Animate list items
                const historyList = document.getElementById('recent-history-list');
                if (historyList) {
                    historyList.classList.add('animated-list');
                }
            };
        }
    }

    // Utility method to update status with enhanced styling
    static updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('app-status');
        if (!statusElement) return;

        let icon = 'fas fa-leaf text-green-500';
        let bgClass = 'glass-card';
        
        if (type === 'loading') {
            icon = 'fas fa-spinner fa-spin text-blue-500';
            bgClass = 'glass-card bg-blue-500/10';
        } else if (type === 'error') {
            icon = 'fas fa-exclamation-triangle text-red-500';
            bgClass = 'glass-card bg-red-500/10';
        } else if (type === 'success') {
            icon = 'fas fa-check-circle text-green-500';
            bgClass = 'glass-card bg-green-500/10';
        }
        
        statusElement.className = `text-center text-sm py-2 px-4 rounded-full transition-all duration-300 ${bgClass}`;
        statusElement.innerHTML = `<i class="${icon} mr-1" aria-hidden="true"></i>${message}`;
    }

    // Enhanced notification system
    static showNotification(title, message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 max-w-sm`;
        
        let bgColor = 'bg-blue-500';
        let icon = 'fas fa-info-circle';
        
        if (type === 'success') {
            bgColor = 'bg-green-500';
            icon = 'fas fa-check-circle';
        } else if (type === 'error') {
            bgColor = 'bg-red-500';
            icon = 'fas fa-exclamation-circle';
        } else if (type === 'warning') {
            bgColor = 'bg-yellow-500';
            icon = 'fas fa-exclamation-triangle';
        }

        notification.innerHTML = `
            <div class="glass-card ${bgColor}/90 text-white p-4 rounded-lg shadow-lg animate-bounce">
                <div class="flex items-start">
                    <i class="${icon} mt-0.5 mr-3" aria-hidden="true"></i>
                    <div class="flex-1">
                        <h4 class="font-medium">${title}</h4>
                        <p class="text-sm opacity-90 mt-1">${message}</p>
                    </div>
                    <button class="ml-2 text-white hover:text-gray-200 transition-colors" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);

        return notification;
    }
}

// Initialize Bento integration
const bentoIntegration = new BentoIntegration();

// Export for use in other scripts
window.BentoIntegration = BentoIntegration;