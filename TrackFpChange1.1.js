//FpChanged + fpPVCountChanged
setTimeout(async () => {
  const traceNow = true;

  function trc(message) {
    if (traceNow) {
      console.trace(message);
    }
  }

  const fpName = 'aidp_tt_fp';
  const fpPVCountName = 'aidp_tt_fpPVCount';

  const date = new Date();
  date.setMonth(date.getMonth() + 1);




  let fp;
  let fpPVCount;
  let sCookiefpPVCountVal;

  if (window.aidpSCookieListPromise) {
    trc('Promise exist. wait. fp change js');
    window.aidpSCookieListPromise.then(useData).catch(console.error);
  }

  let resolveFn, rejectFn;
  trc('Promise init. fp change js');
  window.aidpSCookieListPromise = new Promise((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  if (window.aidpSCookieList) {
    trc('window global cookie exist. fp change js');
    resolveFn(window.aidpSCookieList);
  } else {
    window.adenty?.scookie?.get()
    .then(data => {
      trc('Promise resolve success. fp change js');
      resolveFn(data);
    })
    .catch(error => {
      trc('Promise resolve error. fp change js');
      resolveFn([]);
    });
  }
 
  trc('Promise wait. fp change js');
  window.aidpSCookieListPromise.then(useData).catch(console.error);

  function useData(data) {
    window.aidpSCookieList = data;
    processData();
  }

  function processData() {
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
      return;
    }

    
    
    
    if (fp !== fpData) {
      newfpPVCount = 1;
    sCookiefpPVCountVal = (sCookiefpPVCountVal ? sCookiefpPVCountVal: 0) //TODO check when SQL querying whether we have 0 in events, this is not expected
      // window.adenty.event.fireevent({
        // name: 'VisitorFPChanged', 
        // eventarguments: JSON.stringify({[fpName]: fpData})
      // });
      window.adenty.event.fireevent({ 
        name: 'VisitorFPCountChanged',
        eventarguments: JSON.stringify({[fpPVCountName]: sCookiefpPVCountVal, [fpName]: fpData})
      });

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
  }
  
}, 0);