// =============================================================================
// MODERN DYNAMIC FEATURES FOR EASYBIN
// =============================================================================

class EasyBinModernFeatures {
    constructor() {
        this.batchItems = [];
        this.confidenceThreshold = 0.7;
        this.statsData = {
            totalScans: 0,
            correctDisposals: 0,
            carbonSaved: 0,
            recyclingStreak: 0
        };
        this.init();
    }

    init() {
        this.addModernUI();
        this.initBatchScanning();
        this.initSmartSuggestions();
        this.initGamification();
        this.loadStats();
        this.initAdvancedCamera();
        this.initNotificationSystem();
    }

    // =======================================================================
    // MODERN UI ENHANCEMENTS
    // =======================================================================
    addModernUI() {
        // Only add UI if elements don't already exist
        if (document.getElementById('fab-container')) {
            return; // Already initialized
        }
        
        // Add floating action buttons
        const fabContainer = document.createElement('div');
        fabContainer.id = 'fab-container';
        fabContainer.className = 'fixed bottom-20 right-4 z-50 flex flex-col gap-3';
        fabContainer.innerHTML = `
            <button id="batch-fab" class="modern-btn glass-card w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg">
                <i class="fas fa-layer-group"></i>
            </button>
            <button id="stats-fab" class="modern-btn glass-card w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-lg">
                <i class="fas fa-chart-bar"></i>
            </button>
        `;
        document.body.appendChild(fabContainer);

        // Add stats modal
        this.createStatsModal();
        
        // Add batch scanning modal
        this.createBatchModal();

        // Add toast notification container
        this.createToastContainer();

        // Add progress indicators
        this.addProgressIndicators();

        // Event listeners
        const batchFab = document.getElementById('batch-fab');
        const statsFab = document.getElementById('stats-fab');
        
        if (batchFab) {
            batchFab.addEventListener('click', () => this.toggleBatchMode());
        } else {
            console.warn('Modern features: batch-fab element not found');
        }
        
        if (statsFab) {
            statsFab.addEventListener('click', () => this.showStats());
        } else {
            console.warn('Modern features: stats-fab element not found');
        }
    }

    createStatsModal() {
        const statsModal = document.createElement('div');
        statsModal.id = 'stats-modal';
        statsModal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50 p-4';
        statsModal.innerHTML = `
            <div class="glass-card p-6 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="gradient-text text-2xl font-bold">Your Impact</h2>
                    <button onclick="modernFeatures.closeModal('stats-modal')" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="space-y-4" id="stats-content">
                    <!-- Stats will be populated here -->
                </div>
            </div>
        `;
        document.body.appendChild(statsModal);
    }

    createBatchModal() {
        const batchModal = document.createElement('div');
        batchModal.id = 'batch-modal';
        batchModal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50 p-4';
        batchModal.innerHTML = `
            <div class="glass-card p-6 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="gradient-text text-xl font-bold">Batch Scanning</h2>
                    <button onclick="modernFeatures.closeModal('batch-modal')" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="text-center mb-4">
                    <p class="text-gray-600 mb-4">Scan multiple items at once for faster sorting!</p>
                    <button id="add-batch-item" class="modern-btn bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        <i class="fas fa-plus mr-2"></i>Add Item
                    </button>
                </div>
                <div id="batch-items" class="batch-grid">
                    <!-- Batch items will be populated here -->
                </div>
                <div class="mt-6 flex gap-2">
                    <button id="process-batch" class="modern-btn flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50">
                        <i class="fas fa-magic mr-2"></i>Process All
                    </button>
                    <button id="clear-batch" class="modern-btn px-4 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600">
                        <i class="fas fa-trash mr-2"></i>Clear
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(batchModal);

        // Event listeners
        document.getElementById('add-batch-item').addEventListener('click', () => this.addBatchItem());
        document.getElementById('process-batch').addEventListener('click', () => this.processBatch());
        document.getElementById('clear-batch').addEventListener('click', () => this.clearBatch());
    }

    createToastContainer() {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(toastContainer);
    }

    addProgressIndicators() {
        // Add circular progress to scan button
        const scanButton = document.getElementById('scan-button');
        const scanText = scanButton.querySelector('#scan-button-text');
        
        // Add pulse ring for scanning state
        const pulseRing = document.createElement('div');
        pulseRing.className = 'pulse-ring hidden';
        scanButton.style.position = 'relative';
        scanButton.appendChild(pulseRing);

        // Override showSpinner to use modern spinner
        const originalShowSpinner = window.showSpinner;
        window.showSpinner = () => {
            const outputDiv = document.getElementById('output');
            outputDiv.innerHTML = '<div class="modern-spinner"></div>';
            document.getElementById('result-card').classList.add('hidden');
            scanButton.disabled = true;
            pulseRing.classList.remove('hidden');
        };

        const originalHideSpinner = window.hideSpinner;
        window.hideSpinner = () => {
            document.getElementById('output').innerHTML = '';
            scanButton.disabled = false;
            pulseRing.classList.add('hidden');
        };
    }

    // =======================================================================
    // BATCH SCANNING FEATURE
    // =======================================================================
    toggleBatchMode() {
        document.getElementById('batch-modal').classList.remove('hidden');
        document.getElementById('batch-modal').classList.add('flex');
    }

    async addBatchItem() {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const video = document.getElementById('camera');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);
            
            const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            const batchItem = {
                id: Date.now(),
                image: imageDataUrl,
                timestamp: new Date().toISOString(),
                processed: false
            };
            
            this.batchItems.push(batchItem);
            this.renderBatchItems();
            this.showToast('Item added to batch!', 'success');
            
        } catch (error) {
            console.error('Error adding batch item:', error);
            this.showToast('Failed to add item', 'error');
        }
    }

    renderBatchItems() {
        const container = document.getElementById('batch-items');
        container.innerHTML = '';
        
        this.batchItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'batch-item hover-lift';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="Batch item" />
                <div class="item-info">
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-600">${new Date(item.timestamp).toLocaleTimeString()}</span>
                        <button onclick="modernFeatures.removeBatchItem('${item.id}')" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    ${item.processed ? '<div class="text-green-600 text-xs mt-1"><i class="fas fa-check mr-1"></i>Processed</div>' : ''}
                </div>
            `;
            container.appendChild(itemEl);
        });

        // Update process button state
        const processBtn = document.getElementById('process-batch');
        processBtn.disabled = this.batchItems.filter(item => !item.processed).length === 0;
    }

    removeBatchItem(itemId) {
        this.batchItems = this.batchItems.filter(item => item.id !== parseInt(itemId));
        this.renderBatchItems();
        this.showToast('Item removed', 'info');
    }

    async processBatch() {
        const unprocessedItems = this.batchItems.filter(item => !item.processed);
        if (unprocessedItems.length === 0) return;

        const processBtn = document.getElementById('process-batch');
        processBtn.disabled = true;
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';

        try {
            for (const item of unprocessedItems) {
                await this.processIndividualBatchItem(item);
                item.processed = true;
                this.renderBatchItems();
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between processing
            }
            
            this.showToast(`Processed ${unprocessedItems.length} items!`, 'success');
            this.generateBatchReport();
            
        } catch (error) {
            console.error('Batch processing error:', error);
            this.showToast('Error processing batch', 'error');
        } finally {
            processBtn.disabled = false;
            processBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Process All';
        }
    }

    async processIndividualBatchItem(item) {
        // Simulate AI processing (replace with actual AI call)
        return new Promise(resolve => {
            setTimeout(() => {
                item.result = {
                    itemName: 'Sample Item',
                    primaryBin: 'recyclable',
                    confidence: Math.random() * 0.3 + 0.7
                };
                resolve();
            }, 500);
        });
    }

    generateBatchReport() {
        const results = this.batchItems.filter(item => item.result);
        const binCounts = {};
        
        results.forEach(item => {
            const bin = item.result.primaryBin;
            binCounts[bin] = (binCounts[bin] || 0) + 1;
        });

        // Create report modal
        const reportModal = document.createElement('div');
        reportModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        reportModal.innerHTML = `
            <div class="glass-card p-6 rounded-2xl max-w-md w-full">
                <h3 class="gradient-text text-xl font-bold mb-4">Batch Report</h3>
                <div class="space-y-3">
                    ${Object.entries(binCounts).map(([bin, count]) => `
                        <div class="flex justify-between items-center">
                            <span class="capitalize">${bin.replace('-', ' ')}</span>
                            <span class="font-bold">${count} items</span>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="w-full mt-6 modern-btn bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                    Close Report
                </button>
            </div>
        `;
        document.body.appendChild(reportModal);
    }

    clearBatch() {
        this.batchItems = [];
        this.renderBatchItems();
        this.showToast('Batch cleared', 'info');
    }

    // =======================================================================
    // BATCH SCANNING SYSTEM
    // =======================================================================
    initBatchScanning() {
        // Add batch scanning UI elements
        const batchContainer = document.createElement('div');
        batchContainer.id = 'batch-scanning';
        batchContainer.className = 'hidden mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200';
        batchContainer.innerHTML = `
            <h3 class="text-lg font-semibold text-purple-800 mb-2">
                <i class="fas fa-layer-group mr-2"></i>Batch Scanning
            </h3>
            <div id="batch-items" class="space-y-2 mb-3"></div>
            <div class="flex space-x-2">
                <button id="clear-batch" class="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
                    Clear Batch
                </button>
                <button id="analyze-batch" class="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600">
                    Analyze All
                </button>
            </div>
        `;
        
        const resultCard = document.getElementById('result-card');
        if (resultCard) {
            resultCard.appendChild(batchContainer);
        }

        // Add event listeners
        const clearBtn = document.getElementById('clear-batch');
        const analyzeBtn = document.getElementById('analyze-batch');
        
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearBatch());
        if (analyzeBtn) analyzeBtn.addEventListener('click', () => this.analyzeBatch());
    }

    // =======================================================================
    // SMART SUGGESTIONS SYSTEM
    // =======================================================================
    initSmartSuggestions() {
        // Add suggestion container to UI
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'smart-suggestions';
        suggestionsContainer.className = 'hidden mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200';
        
        const resultCard = document.getElementById('result-card');
        resultCard.appendChild(suggestionsContainer);
    }

    showSmartSuggestions(item) {
        const container = document.getElementById('smart-suggestions');
        const suggestions = this.generateSuggestions(item);
        
        if (suggestions.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.innerHTML = `
            <div class="flex items-center mb-2">
                <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                <span class="font-semibold text-blue-800">Smart Suggestions</span>
            </div>
            <div class="space-y-2">
                ${suggestions.map(suggestion => `
                    <div class="flex items-start space-x-2">
                        <i class="fas fa-chevron-right text-blue-500 mt-1 text-xs"></i>
                        <span class="text-sm text-blue-700">${suggestion}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.classList.remove('hidden');
    }

    generateSuggestions(item) {
        const suggestions = [];
        
        // Material-specific suggestions
        if (item.material === 'plastic') {
            suggestions.push('Remove caps and rinse before recycling');
            suggestions.push('Check for recycling number - not all plastics are recyclable');
        } else if (item.material === 'paper') {
            suggestions.push('Remove any plastic windows or tape');
            suggestions.push('Ensure paper is clean and dry');
        } else if (item.material === 'glass') {
            suggestions.push('Remove metal lids and separate by color if required');
        }

        // Contamination warnings
        if (item.contaminated) {
            suggestions.push('Item appears contaminated - clean thoroughly or dispose as general waste');
        }

        // Alternative uses
        if (item.primaryBin === 'general-waste') {
            suggestions.push('Consider if this item could be repaired or repurposed');
            suggestions.push('Look for special disposal programs in your area');
        }

        return suggestions;
    }

    // =======================================================================
    // GAMIFICATION SYSTEM
    // =======================================================================
    initGamification() {
        this.loadAchievements();
        this.checkDailyStreak();
    }

    loadAchievements() {
        const achievements = JSON.parse(localStorage.getItem('easybin_achievements') || '{}');
        this.achievements = {
            firstScan: false,
            tenScans: false,
            hundredScans: false,
            perfectWeek: false,
            recyclingChampion: false,
            ...achievements
        };
    }

    saveAchievements() {
        localStorage.setItem('easybin_achievements', JSON.stringify(this.achievements));
    }

    checkAchievements() {
        const newAchievements = [];

        if (!this.achievements.firstScan && this.statsData.totalScans >= 1) {
            this.achievements.firstScan = true;
            newAchievements.push({
                title: 'First Steps',
                description: 'Completed your first scan!',
                icon: 'fa-baby',
                color: 'green'
            });
        }

        if (!this.achievements.tenScans && this.statsData.totalScans >= 10) {
            this.achievements.tenScans = true;
            newAchievements.push({
                title: 'Getting Started',
                description: 'Completed 10 scans!',
                icon: 'fa-award',
                color: 'blue'
            });
        }

        if (!this.achievements.hundredScans && this.statsData.totalScans >= 100) {
            this.achievements.hundredScans = true;
            newAchievements.push({
                title: 'Eco Warrior',
                description: 'Completed 100 scans!',
                icon: 'fa-trophy',
                color: 'gold'
            });
        }

        if (!this.achievements.recyclingChampion && this.statsData.recyclingStreak >= 7) {
            this.achievements.recyclingChampion = true;
            newAchievements.push({
                title: 'Recycling Champion',
                description: '7 days of consistent recycling!',
                icon: 'fa-crown',
                color: 'purple'
            });
        }

        if (newAchievements.length > 0) {
            this.saveAchievements();
            this.showAchievements(newAchievements);
        }
    }

    showAchievements(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.showToast(
                    `🎉 ${achievement.title}: ${achievement.description}`,
                    'success',
                    5000
                );
            }, index * 1000);
        });
    }

    checkDailyStreak() {
        const lastScanDate = localStorage.getItem('easybin_lastScanDate');
        const today = new Date().toDateString();
        
        if (lastScanDate === today) {
            // Already scanned today
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastScanDate === yesterday.toDateString()) {
            // Continue streak
            this.statsData.recyclingStreak += 1;
        } else if (lastScanDate) {
            // Streak broken
            this.statsData.recyclingStreak = 1;
        } else {
            // First time
            this.statsData.recyclingStreak = 1;
        }
        
        localStorage.setItem('easybin_lastScanDate', today);
        this.saveStats();
    }

    // =======================================================================
    // ADVANCED CAMERA FEATURES
    // =======================================================================
    initAdvancedCamera() {
        this.addCameraControls();
        this.initAutoFocus();
    }

    addCameraControls() {
        const cameraContainer = document.getElementById('camera').parentElement;
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'absolute top-2 right-2 flex gap-2 z-10';
        controlsDiv.innerHTML = `
            <button id="flash-toggle" class="w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70">
                <i class="fas fa-bolt"></i>
            </button>
            <button id="camera-flip" class="w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70">
                <i class="fas fa-sync-alt"></i>
            </button>
            <button id="zoom-toggle" class="w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70">
                <i class="fas fa-search-plus"></i>
            </button>
        `;
        
        cameraContainer.style.position = 'relative';
        cameraContainer.appendChild(controlsDiv);

        // Add event listeners
        document.getElementById('flash-toggle').addEventListener('click', () => this.toggleFlash());
        document.getElementById('camera-flip').addEventListener('click', () => this.flipCamera());
        document.getElementById('zoom-toggle').addEventListener('click', () => this.toggleZoom());
    }

    async toggleFlash() {
        const video = document.getElementById('camera');
        const track = video.srcObject.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        
        if (capabilities.torch) {
            const settings = track.getSettings();
            await track.applyConstraints({
                advanced: [{ torch: !settings.torch }]
            });
            
            const flashBtn = document.getElementById('flash-toggle');
            flashBtn.classList.toggle('text-yellow-400');
        }
    }

    async flipCamera() {
        const video = document.getElementById('camera');
        const currentStream = video.srcObject;
        
        try {
            currentStream.getTracks().forEach(track => track.stop());
            
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this.currentFacingMode === 'environment' ? 'user' : 'environment'
                }
            });
            
            video.srcObject = newStream;
            this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
            
        } catch (error) {
            console.error('Error flipping camera:', error);
            this.showToast('Failed to flip camera', 'error');
        }
    }

    toggleZoom() {
        const video = document.getElementById('camera');
        const track = video.srcObject.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        
        if (capabilities.zoom) {
            const currentZoom = track.getSettings().zoom || 1;
            const newZoom = currentZoom === 1 ? Math.min(capabilities.zoom.max, 2) : 1;
            
            track.applyConstraints({
                advanced: [{ zoom: newZoom }]
            });
            
            const zoomBtn = document.getElementById('zoom-toggle');
            zoomBtn.innerHTML = newZoom > 1 ? '<i class="fas fa-search-minus"></i>' : '<i class="fas fa-search-plus"></i>';
        }
    }

    initAutoFocus() {
        const video = document.getElementById('camera');
        video.addEventListener('click', (e) => {
            const track = video.srcObject.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            
            if (capabilities.focusMode && capabilities.focusMode.includes('manual')) {
                // Calculate focus point based on click position
                const rect = video.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                track.applyConstraints({
                    advanced: [{
                        focusMode: 'manual',
                        pointsOfInterest: [{ x, y }]
                    }]
                });
                
                // Show focus indicator
                this.showFocusIndicator(e.clientX, e.clientY);
            }
        });
    }

    showFocusIndicator(x, y) {
        const indicator = document.createElement('div');
        indicator.className = 'fixed w-16 h-16 border-2 border-white rounded-full pointer-events-none z-50';
        indicator.style.left = (x - 32) + 'px';
        indicator.style.top = (y - 32) + 'px';
        indicator.style.animation = 'focus-pulse 1s ease-out forwards';
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 1000);
    }

    // =======================================================================
    // STATS AND ANALYTICS
    // =======================================================================
    loadStats() {
        const saved = localStorage.getItem('easybin_stats');
        if (saved) {
            this.statsData = { ...this.statsData, ...JSON.parse(saved) };
        }
    }

    saveStats() {
        localStorage.setItem('easybin_stats', JSON.stringify(this.statsData));
    }

    updateStats(scanResult) {
        this.statsData.totalScans += 1;
        
        if (scanResult.primaryBin === 'recyclable') {
            this.statsData.correctDisposals += 1;
            // Estimate carbon saved (rough calculation)
            this.statsData.carbonSaved += Math.random() * 0.5 + 0.1; // 0.1-0.6 kg CO2
        }
        
        this.saveStats();
        this.checkAchievements();
    }

    showStats() {
        const modal = document.getElementById('stats-modal');
        const content = document.getElementById('stats-content');
        
        const accuracy = this.statsData.totalScans > 0 
            ? Math.round((this.statsData.correctDisposals / this.statsData.totalScans) * 100)
            : 0;
        
        content.innerHTML = `
            <div class="stats-card">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold gradient-text">${this.statsData.totalScans}</div>
                        <div class="text-sm text-gray-600">Total Scans</div>
                    </div>
                    <i class="fas fa-camera text-3xl text-blue-500"></i>
                </div>
            </div>
            
            <div class="stats-card">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold gradient-text">${this.statsData.carbonSaved.toFixed(1)} kg</div>
                        <div class="text-sm text-gray-600">CO2 Saved</div>
                    </div>
                    <i class="fas fa-leaf text-3xl text-green-500"></i>
                </div>
            </div>
            
            <div class="stats-card">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold gradient-text">${this.statsData.recyclingStreak}</div>
                        <div class="text-sm text-gray-600">Day Streak</div>
                    </div>
                    <i class="fas fa-fire text-3xl text-orange-500"></i>
                </div>
            </div>
            
            <div class="stats-card">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-2xl font-bold gradient-text">${accuracy}%</div>
                        <div class="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <i class="fas fa-bullseye text-3xl text-purple-500"></i>
                </div>
            </div>
            
            <div class="mt-6">
                <h3 class="font-semibold mb-3">Achievements</h3>
                <div class="grid grid-cols-2 gap-2">
                    ${this.renderAchievements()}
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    renderAchievements() {
        const achievementList = [
            { key: 'firstScan', title: 'First Steps', icon: 'fa-baby' },
            { key: 'tenScans', title: 'Getting Started', icon: 'fa-award' },
            { key: 'hundredScans', title: 'Eco Warrior', icon: 'fa-trophy' },
            { key: 'recyclingChampion', title: 'Recycling Champion', icon: 'fa-crown' }
        ];
        
        return achievementList.map(achievement => {
            const earned = this.achievements[achievement.key];
            return `
                <div class="p-2 rounded-lg text-center ${earned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}">
                    <i class="fas ${achievement.icon} text-lg mb-1"></i>
                    <div class="text-xs font-medium">${achievement.title}</div>
                </div>
            `;
        }).join('');
    }

    // =======================================================================
    // NOTIFICATION SYSTEM
    // =======================================================================
    initNotificationSystem() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${icons[type]} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    sendNotification(title, message, icon = 'icon-192x192.png') {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: icon,
                badge: icon
            });
        }
    }

    // =======================================================================
    // UTILITY FUNCTIONS
    // =======================================================================
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    // Enhanced scan function that integrates with existing app
    enhancedScan(originalScanFunction) {
        return async (...args) => {
            const result = await originalScanFunction.apply(this, args);
            
            if (result && result.itemName && result.primaryBin !== 'error') {
                // Update stats
                this.updateStats(result);
                
                // Show smart suggestions
                this.showSmartSuggestions(result);
                
                // Send encouraging notification
                if (result.primaryBin === 'recyclable') {
                    this.showToast('Great choice! This item can be recycled! 🌱', 'success');
                }
            }
            
            return result;
        };
    }
}

// Add focus animation CSS
const focusAnimationCSS = `
@keyframes focus-pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(0.8);
        opacity: 0.8;
    }
    100% {
        transform: scale(1.2);
        opacity: 0;
    }
}
`;

const style = document.createElement('style');
style.textContent = focusAnimationCSS;
document.head.appendChild(style);

// Initialize modern features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Modern features: DOM loaded, initializing...');
    
    try {
        window.modernFeatures = new EasyBinModernFeatures();
        console.log('Modern features: Initialized successfully');
        
        // Enhance existing scan function
        if (window.scanImage) {
            const originalScan = window.scanImage;
            window.scanImage = window.modernFeatures.enhancedScan(originalScan);
            console.log('Modern features: Enhanced scan function');
        } else {
            console.log('Modern features: scanImage function not found, will enhance later');
            
            // Try to enhance scan function after a delay
            setTimeout(() => {
                if (window.scanImage && window.modernFeatures) {
                    const originalScan = window.scanImage;
                    window.scanImage = window.modernFeatures.enhancedScan(originalScan);
                    console.log('Modern features: Enhanced scan function (delayed)');
                }
            }, 2000);
        }
    } catch (error) {
        console.error('Modern features: Initialization failed', error);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EasyBinModernFeatures;
}
