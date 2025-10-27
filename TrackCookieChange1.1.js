//CookieIdChanged + CookieePVCountChanged
setTimeout(async () => {
  const traceNow = false;

  function trc(message) {
    if (traceNow) {
      console.trace(message);
    }
  }

  const cGUID = 'aidp_tt_cookieId';
  const ckCountName = 'aidp_tt_ckPVCount'; 

  
  const date = new Date();
  date.setMonth(date.getMonth() + 1);


  let ckPVCount;
  let sCookieCkPVCountVal;

  if (window.aidpSCookieListPromise) {
    trc('Promise exist. wait. cookie change js ');
    window.aidpSCookieListPromise.then(useData).catch(console.error);
    return;
  }

  let resolveFn, rejectFn;
  trc('Promise init. cookie change js');
  window.aidpSCookieListPromise = new Promise((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  if (window.aidpSCookieList) {
    trc('window global cookie exist. cookie change js');
    resolveFn(window.aidpSCookieList);
  } else {
    window.adenty?.scookie?.get()
    .then(data => {
      trc('Promise resolve success. cookie change js');
      resolveFn(data);
    })
    .catch(error => {
      trc('Promise resolve error. cookie change js');
      resolveFn([]);
    });
  }
 
  trc('Promise wait. cookie change js');
  window.aidpSCookieListPromise.then(useData).catch(console.error);

  function useData(data) {
    window.aidpSCookieList = data;
    processData();
  }

  function processData() {
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
    
    return;
    }	




    
    if (!ck) {
      newCkPVCount = 1;
    sCookieCkPVCountVal = (sCookieCkPVCountVal ? sCookieCkPVCountVal : 0)  //TODO check when SQL querying whether we have 0 in events, this is not expected
      // window.adenty.event.fireevent({
        // name: 'VisitorCookieChanged', 
        // eventarguments: JSON.stringify({[ckName]: shortToken})
      // });
      window.adenty.event.fireevent({
        name: 'VisitorCookiePVCountChanged', 
        eventarguments: JSON.stringify({[ckCountName]: sCookieCkPVCountVal, [cGUID]: shortToken})
      });

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
    window.aidp_oldCkPvCountUpdatedWithOldScript = newCkPVCount;
  }

}, 0)