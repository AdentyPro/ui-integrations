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
            image: false,
            script: false,
            html: false
        };
        
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
        if (this.options.debug) {
            console.log('🚀 Launch AdBlocker...');
        }

        const tests = [
            this.testImage(),
            this.testScript(),
            this.testHtml()
        ];

        // Wait finishing all tests
        await Promise.allSettled(tests);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.evaluateResults();
        return this.adBlockerDetected;
    }

    /**
     * Test 1: suspicious image
     */
    async testImage() {
        return new Promise((resolve) => {
            // use real domains that ofter are blocked
            const suspiciousDomains = [
                //'https://dc740.4shared.com/img/zYnDpTnt/s23/11bf951e698/Ad_online', // 188kb 
                'https://img.freepik.com/free-photo/sassy-goodlooking-redhead-female-yellow-sweater-listen-music-white-headphones-touch-earphones_1258-126219.jpg', //5.2kb
                'https://mitup.ru/assets/img/partners/ya_metrika.png' //27kb
            ];
            
            let blockedCount = 0;
            let totalImages = suspiciousDomains.length;
            let completedImages = 0;
            
            suspiciousDomains.forEach((testUrl, index) => {
                const img = new Image();
                const startTime = Date.now();
                
                let loaded = false;
                
                img.onload = () => {
                    const loadTime = Date.now() - startTime;
                    loaded = true;
                    if (this.options.debug) {
                        console.log('✅ Image was downloaded for', loadTime, 'ms:', testUrl);
                    }
                    completedImages++;
                    this.checkImageCompletion();
                };
                
                img.onerror = () => {
                    if (this.options.debug) {
                        console.log('❌ Image was blocked:', testUrl);
                    }
                    blockedCount++;
                    completedImages++;
                    this.checkImageCompletion();
                };
                
                img.src = testUrl;
                
                // Timeout for every image
                setTimeout(() => {
                    if (!loaded) {
                        if (this.options.debug) {
                            console.log('⏰ Timeout for image:', testUrl);
                        }
                        blockedCount++;
                    }
                    completedImages++;
                    this.checkImageCompletion();
                }, this.options.timeout);
            });
            
            // Function for checking finish of all tests
            this.checkImageCompletion = () => {
                if (completedImages === totalImages) {
                    // If at least one image was blocked it is positive case
                    this.results.image = blockedCount > 0;
                    
                    if (this.options.debug) {
                        console.log(`📊 Images: ${blockedCount}/${totalImages} blocked`);
                    }
                    
                    resolve();
                }
            };
        });
    }

    /**
     * Test 2: ad.js script
     */
    async testScript() {
        return new Promise((resolve) => {
            // Use real sources that are often blocked by uBlock
            const adScriptSources = [
                'https://www.googleadservices.com/pagead/conversion.js', //23.4kb
                'https://connect.facebook.net/en_US/fbevents.js', //84.6kb
                'https://mc.yandex.ru/metrika/watch.js' //75.7kb
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
                    
                    if (this.options.debug) {
                        console.log(`📊 Scripts: ${blockedCount}/${totalScripts} blocked`);
                    }
                    
                    resolve();
                }
            };
        });
    }

    /**
     * Test 3: HTML elements with signs of advertising
     */
    testHtml() {
        // Create temporary elements for testing with explicit signs of advertising
        const testElements = [
            { tag: 'div', className: 'ad-banner', text: '🔥 HOT DEALS! 🔥 CLICK HERE NOW! 🔥 LIMITED TIME OFFER! 🔥' },
            { tag: 'div', className: 'sponsored-content', text: '⭐ SPONSORED CONTENT ⭐ BUY NOW! ⭐ SPECIAL PRICE! ⭐' },
            { tag: 'div', id: 'google_ads_iframe', text: 'ADVERTISEMENT - CLICK TO LEARN MORE' },
            { tag: 'ins', className: 'adsbygoogle', text: 'AD - CLICK HERE' },
            { tag: 'div', className: 'advertisement', text: '🎯 TARGETED AD - CLICK FOR MORE INFO' },
            { tag: 'div', className: 'banner-ad', text: '📢 BANNER ADVERTISEMENT - SPECIAL OFFER INSIDE' },
            { tag: 'div', id: 'advertisement', text: '💎 PREMIUM OFFER - LIMITED TIME ONLY' },
            { tag: 'div', className: 'ads', text: '🚀 BOOST YOUR BUSINESS - CLICK HERE' },
            { tag: 'iframe', id: 'google_ads_iframe', src: 'https://ads.example.com' },
            { tag: 'div', className: 'google-ads', text: '🔍 GOOGLE ADS - FIND WHAT YOU NEED' },
            { tag: 'div', className: 'facebook-ads', text: '📘 FACEBOOK ADS - CONNECT WITH US' },
            { tag: 'div', className: 'popup-ad', text: '💥 POPUP AD - EXCLUSIVE DEAL!' },
            { tag: 'div', className: 'footer-ad', text: '👣 FOOTER AD - BOTTOM OFFERS' }
        ];
        
        let hiddenCount = 0;
        
        testElements.forEach(({ tag, className, id, text, src }) => {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (id) element.id = id;
            if (src) element.src = src;
            if (text) element.textContent = text;
            
            // Add styles that make the element more "ad-like"
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            element.style.top = '-9999px';
            element.style.width = '300px';
            element.style.height = '250px';
            element.style.backgroundColor = '#ff6b6b';
            element.style.color = 'white';
            element.style.fontWeight = 'bold';
            element.style.fontSize = '16px';
            element.style.textAlign = 'center';
            element.style.padding = '20px';
            element.style.borderRadius = '10px';
            element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            element.style.zIndex = '9999';
            
            // Add attributes that are often blocked
            element.setAttribute('data-ad', 'true');
            element.setAttribute('data-advertisement', 'true');
            element.setAttribute('data-sponsored', 'true');
            
            document.body.appendChild(element);
            
            // Check if the element is hidden
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || 
                style.visibility === 'hidden' || 
                style.opacity === '0' ||
                style.width === '0px' ||
                style.height === '0px' ||
                style.transform === 'scale(0)' ||
                style.clip === 'rect(0px, 0px, 0px, 0px)') {
                hiddenCount++;
            }
            
            // Remove the element
            document.body.removeChild(element);
        });
        
        this.results.html = hiddenCount > 0;
        
        if (this.options.debug) {
            console.log(this.results.html ? '❌ HTML elements blocked' : '✅ HTML elements visible');
        }
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

const dete = new AdvancedAdBlockerDetector({debug: true});
dete.detect();