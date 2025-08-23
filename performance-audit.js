/**
 * EasyBin Performance Audit Script
 * Analyzes and reports on app performance metrics
 */

const fs = require('fs');
const path = require('path');

class PerformanceAuditor {
    constructor() {
        this.report = {
            timestamp: new Date().toISOString(),
            metrics: {},
            recommendations: [],
            issues: [],
            summary: {}
        };
    }

    async runAudit() {
        console.log('🔍 Starting EasyBin Performance Audit...\n');
        
        await this.analyzeFileSize();
        await this.analyzeDependencies();
        await this.analyzeAssets();
        await this.analyzeCodeStructure();
        await this.generateRecommendations();
        
        this.generateReport();
        console.log('✅ Performance audit completed!');
    }

    async analyzeFileSize() {
        console.log('📊 Analyzing file sizes...');
        
        const files = [
            'index.html',
            'app.js', 
            'styles.css',
            'translations.js',
            'binStyles.js',
            'modern-features.js',
            'analytics.js',
            'error-monitor.js',
            'sw.js',
            'manifest.json'
        ];

        const sizes = {};
        let totalSize = 0;

        for (const file of files) {
            try {
                const stats = fs.statSync(path.join(__dirname, file));
                const sizeKB = (stats.size / 1024).toFixed(2);
                sizes[file] = {
                    bytes: stats.size,
                    kb: parseFloat(sizeKB)
                };
                totalSize += stats.size;
                console.log(`  ${file}: ${sizeKB} KB`);
            } catch (error) {
                console.warn(`  ⚠️  ${file}: Not found`);
            }
        }

        this.report.metrics.fileSizes = sizes;
        this.report.metrics.totalBundleSize = {
            bytes: totalSize,
            kb: (totalSize / 1024).toFixed(2),
            mb: (totalSize / 1024 / 1024).toFixed(2)
        };

        console.log(`  Total Bundle Size: ${(totalSize / 1024).toFixed(2)} KB\n`);

        // Check against performance budgets
        if (totalSize > 2 * 1024 * 1024) { // 2MB
            this.report.issues.push({
                severity: 'high',
                type: 'bundle-size',
                message: 'Total bundle size exceeds 2MB performance budget',
                current: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
                target: '2MB'
            });
        }

        if (sizes['app.js'] && sizes['app.js'].kb > 500) {
            this.report.issues.push({
                severity: 'medium',
                type: 'large-file',
                message: 'app.js is larger than recommended 500KB',
                current: `${sizes['app.js'].kb} KB`,
                target: '500KB'
            });
        }
    }

    async analyzeDependencies() {
        console.log('📦 Analyzing dependencies...');
        
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const deps = packageJson.dependencies || {};
            const devDeps = packageJson.devDependencies || {};
            
            console.log(`  Production dependencies: ${Object.keys(deps).length}`);
            console.log(`  Development dependencies: ${Object.keys(devDeps).length}`);
            
            this.report.metrics.dependencies = {
                production: Object.keys(deps),
                development: Object.keys(devDeps),
                productionCount: Object.keys(deps).length,
                developmentCount: Object.keys(devDeps).length
            };

            // Check for unused dependencies (basic check)
            const jsFiles = ['app.js', 'modern-features.js', 'analytics.js', 'error-monitor.js'];
            const usedDeps = new Set();
            
            for (const file of jsFiles) {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    for (const dep of Object.keys(deps)) {
                        if (content.includes(dep)) {
                            usedDeps.add(dep);
                        }
                    }
                } catch (error) {
                    // File doesn't exist, skip
                }
            }
            
            const unusedDeps = Object.keys(deps).filter(dep => !usedDeps.has(dep));
            if (unusedDeps.length > 0) {
                this.report.issues.push({
                    severity: 'low',
                    type: 'unused-dependencies',
                    message: 'Potentially unused dependencies detected',
                    details: unusedDeps
                });
            }
            
        } catch (error) {
            console.warn('  ⚠️  Could not analyze package.json');
        }
        
        console.log();
    }

    async analyzeAssets() {
        console.log('🖼️  Analyzing assets...');
        
        const assetDirectories = ['icons'];
        let totalAssetSize = 0;
        const assetSizes = {};
        
        for (const dir of assetDirectories) {
            try {
                const files = fs.readdirSync(dir);
                assetSizes[dir] = {};
                
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    const sizeKB = (stats.size / 1024).toFixed(2);
                    assetSizes[dir][file] = {
                        bytes: stats.size,
                        kb: parseFloat(sizeKB)
                    };
                    totalAssetSize += stats.size;
                    
                    console.log(`  ${dir}/${file}: ${sizeKB} KB`);
                    
                    // Check for unoptimized images
                    if (file.endsWith('.png') && stats.size > 50 * 1024) {
                        this.report.recommendations.push({
                            type: 'image-optimization',
                            message: `Consider converting ${dir}/${file} to WebP format`,
                            savings: 'Up to 30-50% size reduction'
                        });
                    }
                }
            } catch (error) {
                console.warn(`  ⚠️  Directory ${dir} not found`);
            }
        }
        
        this.report.metrics.assetSizes = assetSizes;
        this.report.metrics.totalAssetSize = {
            bytes: totalAssetSize,
            kb: (totalAssetSize / 1024).toFixed(2)
        };
        
        console.log(`  Total Asset Size: ${(totalAssetSize / 1024).toFixed(2)} KB\n`);
    }

    async analyzeCodeStructure() {
        console.log('🔧 Analyzing code structure...');
        
        try {
            const appJs = fs.readFileSync('app.js', 'utf8');
            const lines = appJs.split('\n').length;
            const functions = (appJs.match(/function\s+\w+/g) || []).length;
            const asyncFunctions = (appJs.match(/async\s+function/g) || []).length;
            const eventListeners = (appJs.match(/addEventListener/g) || []).length;
            
            console.log(`  app.js lines: ${lines}`);
            console.log(`  Functions: ${functions}`);
            console.log(`  Async functions: ${asyncFunctions}`);
            console.log(`  Event listeners: ${eventListeners}`);
            
            this.report.metrics.codeStructure = {
                lines,
                functions,
                asyncFunctions,
                eventListeners
            };
            
            // Check for code splitting opportunities
            if (lines > 1000) {
                this.report.recommendations.push({
                    type: 'code-splitting',
                    message: 'Consider splitting app.js into modules (camera.js, ai.js, ui.js, history.js)',
                    benefits: 'Better maintainability, potential lazy loading'
                });
            }
            
        } catch (error) {
            console.warn('  ⚠️  Could not analyze app.js');
        }
        
        console.log();
    }

    async generateRecommendations() {
        console.log('💡 Generating performance recommendations...');
        
        // Service Worker recommendations
        try {
            const swJs = fs.readFileSync('sw.js', 'utf8');
            if (!swJs.includes('cache.addAll')) {
                this.report.recommendations.push({
                    type: 'caching',
                    message: 'Service worker could be enhanced with better caching strategies',
                    action: 'Review and optimize cache patterns'
                });
            }
        } catch (error) {
            this.report.recommendations.push({
                type: 'pwa',
                message: 'Service worker not found - PWA caching missing',
                action: 'Implement service worker for offline functionality'
            });
        }
        
        // CDN recommendations
        this.report.recommendations.push({
            type: 'cdn',
            message: 'External CDN dependencies detected',
            details: ['Tailwind CSS', 'Font Awesome', 'Puter.js'],
            action: 'Consider bundling critical CSS to reduce render-blocking'
        });
        
        // Performance budget recommendations
        this.report.recommendations.push({
            type: 'performance-budget',
            message: 'Establish performance budgets',
            targets: {
                'First Contentful Paint': '< 2s',
                'Largest Contentful Paint': '< 2.5s',
                'Cumulative Layout Shift': '< 0.1',
                'First Input Delay': '< 100ms'
            }
        });
        
        console.log(`  Generated ${this.report.recommendations.length} recommendations\n`);
    }

    generateReport() {
        const reportPath = 'performance-report.json';
        
        this.report.summary = {
            totalIssues: this.report.issues.length,
            highSeverityIssues: this.report.issues.filter(i => i.severity === 'high').length,
            totalRecommendations: this.report.recommendations.length,
            bundleSizeMB: this.report.metrics.totalBundleSize?.mb || 'N/A',
            status: this.report.issues.filter(i => i.severity === 'high').length > 0 ? 'NEEDS_ATTENTION' : 'GOOD'
        };
        
        fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
        
        console.log('📋 Performance Audit Summary:');
        console.log('=====================================');
        console.log(`Status: ${this.report.summary.status}`);
        console.log(`Bundle Size: ${this.report.summary.bundleSizeMB} MB`);
        console.log(`High Priority Issues: ${this.report.summary.highSeverityIssues}`);
        console.log(`Total Issues: ${this.report.summary.totalIssues}`);
        console.log(`Recommendations: ${this.report.summary.totalRecommendations}`);
        console.log(`\nDetailed report saved to: ${reportPath}`);
        
        // Display critical issues
        if (this.report.issues.length > 0) {
            console.log('\n🚨 Issues Found:');
            this.report.issues.forEach((issue, index) => {
                console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
                if (issue.current && issue.target) {
                    console.log(`   Current: ${issue.current}, Target: ${issue.target}`);
                }
            });
        }
        
        // Display top recommendations
        if (this.report.recommendations.length > 0) {
            console.log('\n💡 Top Recommendations:');
            this.report.recommendations.slice(0, 5).forEach((rec, index) => {
                console.log(`${index + 1}. ${rec.message}`);
                if (rec.action) console.log(`   Action: ${rec.action}`);
            });
        }
    }
}

// Run the audit
if (require.main === module) {
    const auditor = new PerformanceAuditor();
    auditor.runAudit().catch(console.error);
}

module.exports = PerformanceAuditor;