/**
 * AdBlocker detector
 */

class AdvancedAdBlockerDetector {
    constructor(options = {}) {
        this.options = {
            timeout: options.timeout || 3000,
            threshold: options.threshold || 1, // Minimum amount of positive tests
            debug: options.debug || false,
            ...options
        };
        
        this.results = {
            script: false
        };

        this.start = 0;
        this.finish = 0;
        
        this.adBlockerDetected = false;
        this.callbacks = {
            onDetected: options.onDetected || (() => {}),
            onNotDetected: options.onNotDetected || (() => {}),
            onComplete: options.onComplete || (() => {})
        };
    }

    /**
     * Launch all tests
     */
    async detect() {
        this.start = performance.now();
        if (this.options.debug) {
            console.log('🚀 Launch AdBlocker...');
        }

        const tests = [
            this.testScript()
        ];

        // Wait finishing all tests
        await Promise.allSettled(tests);
        
        //await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.evaluateResults();
        
        this.finish = performance.now();

        if (this.options.debug) {
            console.log('Time of detecting: ', this.finish - this.start);
        }
        return this.adBlockerDetected;
    }

    /**
     * Test 2: ad.js script
     */
    async testScript() {
        return new Promise((resolve) => {
            let startExecuting = 0;
            let finishExecuting = 0;

            startExecuting = performance.now();
            // Use real sources that are often blocked by uBlock
            const adScriptSources = [
                'https://www.googleadservices.com/pagead/conversion.js', //23.4kb
                'https://connect.facebook.net/en_US/fbevents.js', //84.6kb
                'https://mc.yandex.ru/metrika/watch.js', //75.7kb
            ];
            
            let blockedCount = 0;
            let totalScripts = adScriptSources.length;
            let completedScripts = 0;
            
            adScriptSources.forEach((source, index) => {
                const script = document.createElement('script');
                script.id = `adblocker-test-script-${index}`;
                script.src = source;
                
                let loaded = false;
                
                script.onload = () => {
                    loaded = true;
                    if (this.options.debug) {
                        console.log('✅ Script loaded:', source);
                    }
                    completedScripts++;
                    this.checkScriptCompletion();
                };
                
                script.onerror = () => {
                    if (this.options.debug) {
                        console.log('❌ Script blocked:', source);
                    }
                    blockedCount++;
                    completedScripts++;
                    this.checkScriptCompletion();
                };
                
                document.head.appendChild(script);
                
                // Timeout for each script
                setTimeout(() => {
                    if (!loaded) {
                        if (this.options.debug) {
                            console.log('⏰ Timeout for script:', source);
                        }
                        blockedCount++;
                    }
                    completedScripts++;
                    this.checkScriptCompletion();
                    
                    // Remove the script
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                }, this.options.timeout);
            });
            
            // Function to check completion of all tests
            this.checkScriptCompletion = () => {
                if (completedScripts === totalScripts) {
                    // If more than half of scripts are blocked, consider adblocker detected
                    this.results.script = blockedCount > 0;
                    
                    finishExecuting = performance.now();

                    if (this.options.debug) {
                        console.log(`📊 Scripts: ${blockedCount}/${totalScripts} blocked`);
                        console.log(`📊 Scripts executing time: ${finishExecuting - startExecuting}`);
                    }
                    
                    resolve();
                }
            };
        });
    }

    /**
     * Evaluate results
     */
    evaluateResults() {
        const positiveTests = Object.values(this.results).filter(result => result).length;
        
        this.adBlockerDetected = positiveTests >= this.options.threshold;
        
        if (this.options.debug) {
            console.log('📊 Test results:', this.results);
            console.log('🎯 Positive tests:', positiveTests);
            console.log('🚫 AdBlocker detected:', this.adBlockerDetected);
        }
        
        // Invoke callbacks
        if (this.adBlockerDetected) {
            this.callbacks.onDetected(this.results);
        } else {
            this.callbacks.onNotDetected(this.results);
        }
        
        this.callbacks.onComplete(this.results, this.adBlockerDetected);
    }

    /**
     * Get detailed results
     */
    getResults() {
        return {
            detected: this.adBlockerDetected,
            results: { ...this.results },
            positiveCount: Object.values(this.results).filter(result => result).length,
            totalTests: Object.keys(this.results).length
        };
    }
}

// Export for browser usage
if (typeof window !== 'undefined') {
    window.AdvancedAdBlockerDetector = AdvancedAdBlockerDetector;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAdBlockerDetector;
} 

const aidpDete = new AdvancedAdBlockerDetector();
if (await aidpDete.detect()) {
    window.adenty?.event?.fireevent({
        name: 'AdBlockerDetected'
    });
}