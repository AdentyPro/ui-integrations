//Common
setTimeout(async () => {
    const traceNow = false;

    function trc(message) {
        if (traceNow) {
        console.trace(message);
        }
    }

    const performanceNow = false;
    let start = performance.now();
    let finish = 0;
    let startProceedData = 0;
    let finishProceedData = 0;

    function performanceLog(msg, start, finish) {
        if(performanceNow) {
            console.log(msg, finish - start);
        }
    }

    if (window.aidpSCookieListPromise) {
        trc('Promise exist. wait. common track js ');
        window.aidpSCookieListPromise.then(useData).catch(console.error);
        return;
    }

    let resolveFn, rejectFn;
    trc('Promise init. common track js');
    window.aidpSCookieListPromise = new Promise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
    });

    if (window.aidpSCookieList) {
        trc('window global cookie exist. common track js');
        resolveFn(window.aidpSCookieList);
    } else {
        window.adenty?.scookie?.get()
        .then(data => {
        trc('Promise resolve success. common track js');
        resolveFn(data);
        })
        .catch(error => {
        trc('Promise resolve error. common track js');
        resolveFn([]);
        });
    }
    
    trc('Promise wait. common track js');
    window.aidpSCookieListPromise.then(useData).catch(console.error);

    function useData(data) {
        window.aidpSCookieList = data;
        processData();
    }

    async function processData() {
        if (performanceNow){
            trc('start' + performance.now());
            startProceedData =  performance.now();
        }
        const detector = new AdvancedAdBlockerDetector();
        const result = await Promise.all([
            processVidPvChange(),
            processCookieChange(),
            processFpChange(),
            processIpUaChange(),
            detector.detect()
        ]);
        trc('promise result: ' + JSON.stringify(result));

        const cookieChange = result[1];
        let argumentsAdentyMetrics = {};
        if(cookieChange.isNeedFireAdentyMetrics) {
            argumentsAdentyMetrics = {...cookieChange.arguments, ...argumentsAdentyMetrics};
        }
        const fpChange = result[2];
        if(fpChange.isNeedFireAdentyMetrics) {
            argumentsAdentyMetrics = {...fpChange.arguments, ...argumentsAdentyMetrics};
        }
        const ipUaChange = result[3];
        if(ipUaChange.isNeedFireAdentyMetrics) {
            argumentsAdentyMetrics = {...ipUaChange.arguments, ...argumentsAdentyMetrics};
        }
        const adBlocker = result[4];
        if (adBlocker) {
            argumentsAdentyMetrics = {...{'adBlockerDetected': adBlocker}, ...argumentsAdentyMetrics};
        }
        if (performanceNow) {
            trc('finish' + performance.now());
            finishProceedData =  performance.now();
        }
        performanceLog('Time of proceed data: ', startProceedData, finishProceedData);
        if(cookieChange.isNeedFireAdentyMetrics ||
            fpChange.isNeedFireAdentyMetrics ||
            ipUaChange.isNeedFireAdentyMetrics ||
            adBlocker
        ) {
            window.adenty.event.fireevent({
                name: 'AdentyMetrics',
                eventarguments: JSON.stringify(argumentsAdentyMetrics)
            });
        }
        finish = performance.now();
        performanceLog('Time all script:', start, finish);
    }

    async function processCookieChange() {
        let result = {
            isNeedFireAdentyMetrics: false,
            arguments: {}
        };

        const cGUID = 'aidp_tt_cookieId';
        const ckCountName = 'aidp_tt_ckPVCount'; 

        const date = new Date();
        date.setMonth(date.getMonth() + 1);

        let ckPVCount;
        let sCookieCkPVCountVal;

        try {
            ckPVCount = window.aidpSCookieList?.find(i => i.name === ckCountName);
            sCookieCkPVCountVal = Number(ckPVCount.value);
        } catch (e) {
            ckPVCount = null;
            sCookieCkPVCountVal = null;
        }

        const cGUIDKey = `${cGUID}=`;
        const cookie = document.cookie.split(';');
        const cookieVal = cookie.find(item => {
            return item.indexOf(cGUIDKey) > -1
        });
        const ck = cookieVal ? (cookieVal.trim().substring(cGUIDKey.length) || '') : '';

        let shortToken;
        const array = new Uint8Array(8);
        crypto.getRandomValues(array); 
        shortToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

        let newCkPVCount;
        if (!sCookieCkPVCountVal) {
            newCkPVCount = 1;
            window.adenty.scookie.set({
                name: ckCountName,
                value: JSON.stringify(newCkPVCount),
                expires: date.toISOString(),
            });
            
            document.cookie = `${cGUID}=${shortToken}; expires=${date.toUTCString()};`;
            
            return result;
        }	

        if (!ck) {
            newCkPVCount = 1;
            sCookieCkPVCountVal = (sCookieCkPVCountVal ? sCookieCkPVCountVal : 0)  //TODO check when SQL querying whether we have 0 in events, this is not expected
            // window.adenty.event.fireevent({
                // name: 'VisitorCookieChanged', 
                // eventarguments: JSON.stringify({[ckName]: shortToken})
            // });
            //   window.adenty.event.fireevent({
            //     name: 'VisitorCookiePVCountChanged', 
            //     eventarguments: JSON.stringify({[ckCountName]: sCookieCkPVCountVal, [cGUID]: shortToken})
            //   });

            result.isNeedFireAdentyMetrics = true;
            result.arguments = {[ckCountName]: sCookieCkPVCountVal, [cGUID]: shortToken};

            document.cookie = `${cGUID}=${shortToken}; expires=${date.toUTCString()};`;
        }
        else {
            newCkPVCount = (sCookieCkPVCountVal ? sCookieCkPVCountVal + 1 : 1);
        }
        
            window.adenty.scookie.set({
                name: ckCountName,
                value: JSON.stringify(newCkPVCount),
                //expires: date.toISOString(), // TODO: make sure that here we do not set to NULL expiredate 
            });

        return result;
    }

    async function processFpChange() {
        let result = {
            isNeedFireAdentyMetrics: false,
            arguments: {}
        };

        const fpName = 'aidp_tt_fp';
        const fpPVCountName = 'aidp_tt_fpPVCount';

        const date = new Date();
        date.setMonth(date.getMonth() + 1);

        let fp;
        let fpPVCount;
        let sCookiefpPVCountVal;

        try {
            fp = window.aidpSCookieList?.find(i => i.name === fpName)?.value; 
        } catch (e) {
            fp = null;
        }

        try {
            fpPVCount = window.aidpSCookieList?.find(i => i.name === fpPVCountName);
            sCookiefpPVCountVal = Number(fpPVCount.value);
        } catch (e) {
            fpPVCount = null;
            sCookiefpPVCountVal = null;
        }

        const fpData = window.adenty?.dl?.adenty?.visit?.rid

        let newfpPVCount
        if (!sCookiefpPVCountVal || !fp) {
            window.adenty.scookie.set({
                name: fpName,
                value: fpData,
                expires: date.toISOString(),
            });
            window.adenty.scookie.set({
                name: fpPVCountName,
                value: JSON.stringify(1),
                expires: date.toISOString(),
            });
            return result;
        }

        if (fp !== fpData) {
            newfpPVCount = 1;
            sCookiefpPVCountVal = (sCookiefpPVCountVal ? sCookiefpPVCountVal: 0) //TODO check when SQL querying whether we have 0 in events, this is not expected
            // window.adenty.event.fireevent({
                // name: 'VisitorFPChanged', 
                // eventarguments: JSON.stringify({[fpName]: fpData})
            // });
            // window.adenty.event.fireevent({ 
            //     name: 'VisitorFPCountChanged',
            //     eventarguments: JSON.stringify({[fpPVCountName]: sCookiefpPVCountVal, [fpName]: fpData})
            // });

            result.isNeedFireAdentyMetrics = true;
            result.arguments = {[fpPVCountName]: sCookiefpPVCountVal, [fpName]: fpData};

            window.adenty.scookie.set({
                name: fpName,
                value: fpData,
                //expires: date.toISOString(), // TODO: make sure that here we do not set to NULL expiredate
            });
        }
        else {
            newfpPVCount = (sCookiefpPVCountVal ? sCookiefpPVCountVal + 1 : 1);
        }

        window.adenty.scookie.set({
            name: fpPVCountName,
            value: JSON.stringify(newfpPVCount),
            //expires: date.toISOString(), // TODO: make sure that here we do not set to NULL expiredate
        });

        return result;
    }

    
    async function processIpUaChange() {
        let result = {
            isNeedFireAdentyMetrics: false,
            arguments: {}
        };

        const ipUaName = 'aidp_tt_ip_ua';
        const ipUaCountName = 'aidp_tt_ip_uaPVCount';

        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        
        let ipUa;
        let ipuaPVCount;
        let sCookieIpuaPVCountVal;

        try {
            ipUa = JSON.parse(window.aidpSCookieList?.find(i => i.name === ipUaName)?.value); 
        } catch (e) {
            ipUa = null;
        }
        
        try {
            ipuaPVCount = window.aidpSCookieList?.find(i => i.name === ipUaCountName);
            sCookieIpuaPVCountVal = Number(ipuaPVCount.value);
        } catch (e) {
            ipuaPVCount = null;
            sCookieIpuaPVCountVal = null;
        }

        trc("scookieipUa="+ipUa)
        trc("sCookieIpuaPVCountVal="+sCookieIpuaPVCountVal)

        let browserData
        let ipData
        try {
            browserData = btoa(navigator?.userAgent);
        } catch (error) {
            browserData = null;
        }
        ipData = window.adenty?.dl?.adenty?.visit?.ipsha
        const ipUaData = JSON.stringify({
            ip: ipData,
            ua: browserData
        })
        
        trc("Curent ipUaData="+ipUaData)
        
        let newIpuaPVCount
        if (!sCookieIpuaPVCountVal || !ipUa) {
            window.adenty.scookie.set({
                name: ipUaName,
                value: ipUaData,
                expires: date.toISOString(),
            });
            window.adenty.scookie.set({
                name: ipUaCountName,
                value: JSON.stringify(1),
                expires: date.toISOString(),
            });
            trc("Initing scookie")
            return result;
        }	
        
        trc("ipChanged="+(ipUa.ip !== ipData))
        trc("uaChanged="+(ipUa.ua !== browserData))
        if (ipUa.ip !== ipData || ipUa.ua !== browserData) {
            newIpuaPVCount = 1;
            sCookieIpuaPVCountVal = (sCookieIpuaPVCountVal ? sCookieIpuaPVCountVal: 0) //TODO check when SQL querying whether we have 0 in events, this is not expected
            // window.adenty.event.fireevent({
                // name: 'VisitorIpUaChanged', 
                // eventarguments: JSON.stringify({[ipUaName]: ipUaData})
            // });
            // window.adenty.event.fireevent({
            //     name: 'VisitorIpUaCountChanged',
            //     eventarguments: JSON.stringify({[ipUaCountName]: sCookieIpuaPVCountVal, [ipUaName]: ipUaData})
            // });

            result.isNeedFireAdentyMetrics = true;
            result.arguments = {[ipUaCountName]: sCookieIpuaPVCountVal, [ipUaName]: ipUaData};

            window.adenty.scookie.set({
                name: ipUaName,
                value: ipUaData,
                //expires: date.toISOString(), // TODO: make sure that here we do not set to NULL expiredate
            });
            trc("VisitorIpUaCountChanged! "+ipUaName+"->"+ipUaData+"; "+sCookieIpuaPVCountVal+"->"+newIpuaPVCount)
        }
        else {
            newIpuaPVCount = (sCookieIpuaPVCountVal ? sCookieIpuaPVCountVal + 1 : 1);
        }

        window.adenty.scookie.set({
            name: ipUaCountName,
            value: JSON.stringify(newIpuaPVCount),
            //expires: date.toISOString(), // TODO: make sure that here we do not set to NULL expiredate
        }); 

        trc("PVCount++ "+sCookieIpuaPVCountVal+"->"+newIpuaPVCount);

        return result;
    }

    async function processVidPvChange() {
        const vidPVCountName = 'aidp_tt_vidPVCount'; 

        const date = new Date();
        date.setMonth(date.getMonth() + 1);

        let vidPVCount;
        let sCookieVidPVCountVal;

        try {
            vidPVCount = window.aidpSCookieList?.find(i => i.name === vidPVCountName);
            sCookieVidPVCountVal = Number(vidPVCount.value);
        } catch (e) {
            vidPVCount = null;
            sCookieVidPVCountVal = null;
        }

        let newVidPVCount
        if (!sCookieVidPVCountVal) {
            newVidPVCount = 1;
            window.adenty.scookie.set({
                name: vidPVCountName,
                value: JSON.stringify(newVidPVCount),
                expires: date.toISOString(),
            });
            return;
        }



        newVidPVCount = (sCookieVidPVCountVal ? sCookieVidPVCountVal + 1 : 1);
            window.adenty.scookie.set({
            name: vidPVCountName,
            value: JSON.stringify(newVidPVCount),
            //expires: date.toISOString(),  // TODO: make sure that here we do not set to NULL expiredate
        });
    }

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
                //this.testImage(),
                this.testScript(),
                this.testHtml()
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
                    //'https://connect.facebook.net/en_US/fbevents.js', //84.6kb
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
         * Test 3: HTML elements with signs of advertising
         */
        testHtml() {
            let startExecuting = 0;
            let finishExecuting = 0;
            
            startExecuting = performance.now();

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
            
            finishExecuting = performance.now();

            if (this.options.debug) {
                console.log(this.results.html ? '❌ HTML elements blocked' : '✅ HTML elements visible');
                console.log(`📊 HTML elements  executing time: ${finishExecuting - startExecuting}`);
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

}, 0)