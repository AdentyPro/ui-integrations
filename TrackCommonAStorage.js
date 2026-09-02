//Common
setTimeout(async () => {
  const traceNow = false;

  function trc(message) {
    if (traceNow) {
      console.trace(message);
    }
  }

  const AIDP_ASTORAGE_KEYS = [
    'aidp_tt_ckPVCount',
    'aidp_tt_ip_ua',
    'aidp_tt_ip_uaPVCount',
    'aidp_tt_vidPVCount',
  ];

  async function getAStorageList() {
    const entries = await Promise.all(AIDP_ASTORAGE_KEYS.map(async (name) => {
      try {
        const item = await window.adenty?.astorage?.get(name);
        return item ? {name, value: item.value} : null;
      } catch (error) {
        return null;
      }
    }));
    return entries.filter(Boolean);
  }

  if (window.aidpAStorageListPromise) {
    trc('Promise exist. wait. common track js ');
    window.aidpAStorageListPromise.then(useData).catch(console.error);
    return;
  }

  let resolveFn, rejectFn;
  trc('Promise init. common track js');
  window.aidpAStorageListPromise = new Promise((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  if (window.aidpAStorageList) {
    trc('window global astorage exist. common track js');
    resolveFn(window.aidpAStorageList);
  } else {
    getAStorageList()
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
  window.aidpAStorageListPromise.then(useData).catch(console.error);

  function useData(data) {
    window.aidpAStorageList = data;
    processData();
  }

  function processData() {
    processVidPvChange();
    const cookieChangeArgs = processCookieChange();
    let argumentsAdentyMetrics = {};
    argumentsAdentyMetrics = {...cookieChangeArgs, ...argumentsAdentyMetrics};
    const ipUaChangeArgs = processIpUaChange();
    argumentsAdentyMetrics = {...ipUaChangeArgs, ...argumentsAdentyMetrics};
    if (Object.keys(argumentsAdentyMetrics).length > 0) {
      window.adenty.event.fireevent({
        name: 'AMetrics',
        eventarguments: JSON.stringify(argumentsAdentyMetrics),
        type: 'AMetrics'
      });
    }
  }

  function processCookieChange() {
    let result = {};

    const cGUID = 'aidp_tt_cookieId';
    const ckCountName = 'aidp_tt_ckPVCount';

    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    const expiresInMinutes = Math.round((date.getTime() - Date.now()) / 60000);

    let ckPVCount;
    let sCookieCkPVCountVal;

    try {
      ckPVCount = window.aidpAStorageList?.find(i => i.name === ckCountName);
      sCookieCkPVCountVal = Number(ckPVCount.value);
    } catch (e) {
      ckPVCount = null;
      sCookieCkPVCountVal = null;
    }

    const cGUIDKey = `${cGUID}=`;
    const cookie = document.cookie.split(';');
    const cookieVal = cookie.find(item => {
      return item.indexOf(cGUIDKey) > -1;
    });
    const ck = cookieVal ? (cookieVal.trim().substring(cGUIDKey.length) || '') : '';

    let shortToken;
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    shortToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    let newCkPVCount;
    if (!sCookieCkPVCountVal) {
      newCkPVCount = 1;
      window.adenty.astorage.set(ckCountName, JSON.stringify(newCkPVCount), expiresInMinutes, true, false);

      document.cookie = `${cGUID}=${shortToken}; expires=${date.toUTCString()};`;

      return result;
    }

    if (!ck) {
      newCkPVCount = 1;
      sCookieCkPVCountVal = (sCookieCkPVCountVal ? sCookieCkPVCountVal : 0);  //TODO check when SQL querying whether we have 0 in events, this is not expected
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
    } else {
      newCkPVCount = (sCookieCkPVCountVal ? sCookieCkPVCountVal + 1 : 1);
    }

    window.adenty.astorage.set(
      ckCountName,
      JSON.stringify(newCkPVCount),
      null,
      true,
      false,
      //expiresInMinutes, // TODO: make sure that here we do not set to NULL expiredate
    );

    return result;
  }

  function processIpUaChange() {
    let result = {};

    const ipUaName = 'aidp_tt_ip_ua';
    const ipUaCountName = 'aidp_tt_ip_uaPVCount';

    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    const expiresInMinutes = Math.round((date.getTime() - Date.now()) / 60000);

    let ipUa;
    let ipuaPVCount;
    let sCookieIpuaPVCountVal;

    try {
      ipUa = JSON.parse(window.aidpAStorageList?.find(i => i.name === ipUaName).value);
    } catch (e) {
      ipUa = null;
    }

    try {
      ipuaPVCount = window.aidpAStorageList?.find(i => i.name === ipUaCountName);
      sCookieIpuaPVCountVal = Number(ipuaPVCount.value);
    } catch (e) {
      ipuaPVCount = null;
      sCookieIpuaPVCountVal = null;
    }

    trc('scookieipUa=' + ipUa);
    trc('sCookieIpuaPVCountVal=' + sCookieIpuaPVCountVal);

    let browserData;
    let ipData;
    try {
      browserData = btoa(navigator?.userAgent);
    } catch (error) {
      browserData = null;
    }
    ipData = window.adenty?.dl?.adenty?.visit?.ipsha;
    const ipUaData = JSON.stringify({
      ip: ipData,
      ua: browserData
    });

    trc('Curent ipUaData=' + ipUaData);

    let newIpuaPVCount;
    if (!sCookieIpuaPVCountVal || !ipUa) {
      window.adenty.astorage.set(ipUaName, ipUaData, expiresInMinutes, true, false);
      window.adenty.astorage.set(ipUaCountName, JSON.stringify(1), expiresInMinutes, true, false);
      trc('Initing scookie');
      return result;
    }

    trc('ipChanged=' + (ipUa.ip !== ipData));
    trc('uaChanged=' + (ipUa.ua !== browserData));
    if (ipUa.ip !== ipData || ipUa.ua !== browserData) {
      newIpuaPVCount = 1;
      sCookieIpuaPVCountVal = (sCookieIpuaPVCountVal ? sCookieIpuaPVCountVal : 0); //TODO check when SQL querying whether we have 0 in events, this is not expected
      // window.adenty.event.fireevent({
      // name: 'VisitorIpUaChanged',
      // eventarguments: JSON.stringify({[ipUaName]: ipUaData})
      // });
      // window.adenty.event.fireevent({
      //     name: 'VisitorIpUaCountChanged',
      //     eventarguments: JSON.stringify({[ipUaCountName]: sCookieIpuaPVCountVal, [ipUaName]: ipUaData})
      // });

      result = {[ipUaCountName]: sCookieIpuaPVCountVal, [ipUaName]: ipUaData};

      window.adenty.astorage.set(
        ipUaName,
        ipUaData,
        null,
        true,
        false,
        //expiresInMinutes, // TODO: make sure that here we do not set to NULL expiredate
      );
      trc('VisitorIpUaCountChanged! ' + ipUaName + '->' + ipUaData + '; ' + sCookieIpuaPVCountVal + '->' + newIpuaPVCount);
    } else {
      newIpuaPVCount = (sCookieIpuaPVCountVal ? sCookieIpuaPVCountVal + 1 : 1);
    }

    window.adenty.astorage.set(
      ipUaCountName,
      JSON.stringify(newIpuaPVCount),
      null,
      true,
      false,
      //expiresInMinutes, // TODO: make sure that here we do not set to NULL expiredate
    );

    trc('PVCount++ ' + sCookieIpuaPVCountVal + '->' + newIpuaPVCount);

    return result;
  }

  function processVidPvChange() {
    const vidPVCountName = 'aidp_tt_vidPVCount';

    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    const expiresInMinutes = Math.round((date.getTime() - Date.now()) / 60000);

    let vidPVCount;
    let sCookieVidPVCountVal;

    try {
      vidPVCount = window.aidpAStorageList?.find(i => i.name === vidPVCountName);
      sCookieVidPVCountVal = Number(vidPVCount.value);
    } catch (e) {
      vidPVCount = null;
      sCookieVidPVCountVal = null;
    }

    let newVidPVCount;
    if (!sCookieVidPVCountVal) {
      newVidPVCount = 1;
      window.adenty.astorage.set(vidPVCountName, JSON.stringify(newVidPVCount), expiresInMinutes, true, false);
      return;
    }


    newVidPVCount = (sCookieVidPVCountVal ? sCookieVidPVCountVal + 1 : 1);
    window.adenty.astorage.set(
      vidPVCountName,
      JSON.stringify(newVidPVCount),
      null,
      true,
      false,
      //expiresInMinutes, // TODO: make sure that here we do not set to NULL expiredate
    );
  }
}, 0);
