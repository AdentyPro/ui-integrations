//CookieIdChanged + CookieePVCountChanged
setTimeout(async () => {
    const traceNow = false;

    function trc(message) {
        if (traceNow) {
        console.trace(message);
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

    function processData() {
        processVidPvChange();
        const cookieChange = processCookieChange();
        let argumentsAdentyMetrics = {};
        if(cookieChange.isNeedFireAdentyMetrics) {
            argumentsAdentyMetrics = {...cookieChange.arguments, ...argumentsAdentyMetrics};
        }
        const fpChange = processFpChange();
        if(fpChange.isNeedFireAdentyMetrics) {
            argumentsAdentyMetrics = {...fpChange.arguments, ...argumentsAdentyMetrics};
        }
        const ipUaChange = processIpUaChange();
        if(ipUaChange.isNeedFireAdentyMetrics) {
            argumentsAdentyMetrics = {...ipUaChange.arguments, ...argumentsAdentyMetrics};
        }
        if(cookieChange.isNeedFireAdentyMetrics ||
            fpChange.isNeedFireAdentyMetrics ||
            ipUaChange.isNeedFireAdentyMetrics
        ) {
            window.adenty.event.fireevent({
                name: 'AdentyMetrics',
                eventarguments: JSON.stringify(argumentsAdentyMetrics)
            });
        }
    }

    function processCookieChange() {
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

    function processFpChange() {
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

    
    function processIpUaChange() {
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

    function processVidPvChange() {
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

}, 0)