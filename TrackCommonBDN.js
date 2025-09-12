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
    listenSubscriptionCreate();

    //let paywallEventFired = false;
    //listenPaywall();

    // function firePaywallEvent() {
    //     if(!paywallEventFired){
    //         trc('PaywallHappened');
    //         window.adenty.event.fireevent({
    //             name: 'PaywallHappened'
    //         });
    //         paywallEventFired = true;
    //     }
    // }

    function fireConversionEvent() {
        window.adenty.event.fireevent({
            name: 'ConversionHappened'
        });
    }

    async function getPaywallArgs() {
        const modalElement = document.querySelector('#pelcro-view-meter-modal');
        if (modalElement) {
            //firePaywallEvent();
            return {'paywallHit': true};
        }
        if(!window.Pelcro?.paywall?.displayMeterPaywall() && !window.Pelcro?.paywall?.displayNewsletterPaywall()) {
            if(window.Pelcro?.paywall?.displayPaywall(false)){ //we pass false in order not to dispatch event
                //firePaywallEvent();
                return {'paywallHit': true};
            }
        }
        const isAlwaysWalledContent = window.xxx?.metadata?.isAlwaysWalledContent;
        const isFreeContent = window.xxx?.metadata?.isFreeContent;
        if (!+isAlwaysWalledContent && !+isFreeContent){
            const decision = await demeter("getDecision", { args: { visitor: window.userState?.userType }, onSuccess: (decision) => { return decision; }});
            if(decision?.outcome?.wallVisibility === "always") {
                //firePaywallEvent();
                return {'paywallHit': true};
            }
        }
        return {};
    }

    function listenSubscriptionCreate() {
        document.addEventListener('PelcroSubscriptionCreate', fireConversionEvent);
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
        startProceedData = performance.now();
        //I use promise because paywall args func is async
        //I have made performance testing, there is no visible diff in step by step calling and Promise, that's why let's leave promise
        const result = await Promise.all([
            processVidPvChange(),
            processCookieChange(),
            processFpChange(),
            processIpUaChange(),
            getPaywallArgs(),
        ])
        //processVidPvChange();
        const cookieChangeArgs = result[1];//processCookieChange();
        let argumentsAdentyMetrics = {};
        argumentsAdentyMetrics = {...cookieChangeArgs, ...argumentsAdentyMetrics};
        const fpChangeArgs = result[2];// processFpChange();
        argumentsAdentyMetrics = {...fpChangeArgs, ...argumentsAdentyMetrics};
        const ipUaChangeArgs = result[3];//processIpUaChange();
        argumentsAdentyMetrics = {...ipUaChangeArgs, ...argumentsAdentyMetrics};
        argumentsAdentyMetrics = {...{'auth': !!Pelcro?.user?.read()?.id}, ...argumentsAdentyMetrics};
        //argumentsAdentyMetrics = {...await getPaywallArgs(), ...argumentsAdentyMetrics};
        argumentsAdentyMetrics = {...result[4], ...argumentsAdentyMetrics};
        finishProceedData = performance.now();
        performanceLog('proceed data ', startProceedData, finishProceedData);
        if(Object.keys(argumentsAdentyMetrics).length > 0)
        {
            window.adenty.event.fireevent({
                name: 'AdentyMetrics',
                eventarguments: JSON.stringify(argumentsAdentyMetrics)
            });
        }
        finish = performance.now();
        performanceLog('all script ', start, finish);
    }

    async function processCookieChange() {
        let result = {};

        let cGUID = 'aidp_tt_cookieId';
        const cGUIDNew = 'aidp_tt_cookieIdNew';
        let ckCountName = 'aidp_tt_ckPVCount';
        const ckCountNameNew = 'aidp_tt_ckPVCountNew';

        const date = new Date();
        date.setMonth(date.getMonth() + 1);

        let ckPVCount;
        let sCookieCkPVCountVal;

        try {
            ckPVCount = window.aidpSCookieList?.find(i => i.name === ckCountNameNew);
            sCookieCkPVCountVal = Number(ckPVCount.value);
        } catch (e) {
            ckPVCount = null;
            sCookieCkPVCountVal = null;
            try {
                ckPVCount = window.aidpSCookieList?.find(i => i.name === ckCountName);
                sCookieCkPVCountVal = Number(ckPVCount.value);
            } catch(e) {
                ckPVCount = null;
                sCookieCkPVCountVal = null;
            }
        }

        ckCountName = ckCountNameNew;

        let cGUIDKey = `${cGUIDNew}=`;
        const cookie = document.cookie.split(';');
        let cookieVal = cookie.find(item => {
            return item.indexOf(cGUIDKey) > -1
        });
        if(!cookieVal) {
            cGUIDKey = `${cGUID}=`;
            cookieVal = cookie.find(item => {
                return item.indexOf(cGUIDKey) > -1
            });
        }
        const ck = cookieVal ? (cookieVal.trim().substring(cGUIDKey.length) || '') : '';
        cGUID = cGUIDNew;

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

            result = {[ckCountName]: sCookieCkPVCountVal, [cGUID]: shortToken};

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
        let result = {};

        let fpName = 'aidp_tt_fp';
        let fpPVCountName = 'aidp_tt_fpPVCount';
        let fpNameNew = 'aidp_tt_fpNew';
        let fpPVCountNameNew = 'aidp_tt_fpPVCountNew';

        const date = new Date();
        date.setMonth(date.getMonth() + 1);

        let fp;
        let fpPVCount;
        let sCookiefpPVCountVal;

        try {
            fp = window.aidpSCookieList?.find(i => i.name === fpNameNew).value; 
        } catch (e) {
            fp = null;
            try {
                fp = window.aidpSCookieList?.find(i => i.name === fpName).value; 
            } catch (e) {
                fp = null;
            }
        }
        fpName = fpNameNew;

        try {
            fpPVCount = window.aidpSCookieList?.find(i => i.name === fpPVCountNameNew);
            sCookiefpPVCountVal = Number(fpPVCount.value);
        } catch (e) {
            fpPVCount = null;
            sCookiefpPVCountVal = null;
            try {
                fpPVCount = window.aidpSCookieList?.find(i => i.name === fpPVCountName);
                sCookiefpPVCountVal = Number(fpPVCount.value);
            } catch (e) {
                fpPVCount = null;
                sCookiefpPVCountVal = null;
            }
        }
        fpPVCountName = fpPVCountNameNew;

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

            result = {[fpPVCountName]: sCookiefpPVCountVal, [fpName]: fpData};

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
        let result = {};

        let ipUaName = 'aidp_tt_ip_ua';
        let ipUaCountName = 'aidp_tt_ip_uaPVCount';
        let ipUaNameNew = 'aidp_tt_ip_uaNew';
        let ipUaCountNameNew = 'aidp_tt_ip_uaPVCountNew';

        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        
        let ipUa;
        let ipuaPVCount;
        let sCookieIpuaPVCountVal;

        try {
            ipUa = JSON.parse(window.aidpSCookieList?.find(i => i.name === ipUaNameNew).value); 
        } catch (e) {
            ipUa = null;
            try {
                ipUa = JSON.parse(window.aidpSCookieList?.find(i => i.name === ipUaName).value); 
            } catch (e) {
                ipUa = null;
            }
        }
        ipUaName = ipUaNameNew;
        
        try {
            ipuaPVCount = window.aidpSCookieList?.find(i => i.name === ipUaCountNameNew);
            sCookieIpuaPVCountVal = Number(ipuaPVCount.value);
        } catch (e) {
            ipuaPVCount = null;
            sCookieIpuaPVCountVal = null;
            try {
                ipuaPVCount = window.aidpSCookieList?.find(i => i.name === ipUaCountName);
                sCookieIpuaPVCountVal = Number(ipuaPVCount.value);
            } catch (e) {
                ipuaPVCount = null;
                sCookieIpuaPVCountVal = null;
            }
        }
        ipUaCountName = ipUaCountNameNew;

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

            result = {[ipUaCountName]: sCookieIpuaPVCountVal, [ipUaName]: ipUaData};

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
        let vidPVCountName = 'aidp_tt_vidPVCount';
        let vidPVCountNameNew = 'aidp_tt_vidPVCountNew';

        const date = new Date();
        date.setMonth(date.getMonth() + 1);

        let vidPVCount;
        let sCookieVidPVCountVal;

        try {
            vidPVCount = window.aidpSCookieList?.find(i => i.name === vidPVCountNameNew);
            sCookieVidPVCountVal = Number(vidPVCount.value);
        } catch (e) {
            vidPVCount = null;
            sCookieVidPVCountVal = null;
            try {
                vidPVCount = window.aidpSCookieList?.find(i => i.name === vidPVCountName);
                sCookieVidPVCountVal = Number(vidPVCount.value);
            } catch (e) {
                vidPVCount = null;
                sCookieVidPVCountVal = null;
            }
        }
        vidPVCountName = vidPVCountNameNew;

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

}, 0)