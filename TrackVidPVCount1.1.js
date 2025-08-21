//vidPVCount
setTimeout(async () => {
  const traceNow = false;

  function trc(message) {
    if (traceNow) {
      console.trace(message);
    }
  }

if (window.aidpSCookieListPromise) {
    trc('Promise exist. wait. vid pv change js ');
    window.aidpSCookieListPromise.then(useData).catch(console.error);
    return;
  }

  let resolveFn, rejectFn;
  trc('Promise init. vid pv change js');
  window.aidpSCookieListPromise = new Promise((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  if (window.aidpSCookieList) {
    trc('window global cookie exist. vid pv change js');
    resolveFn(window.aidpSCookieList);
  } else {
    window.adenty?.scookie?.get()
    .then(data => {
      trc('Promise resolve success. vid pv change js');
      resolveFn(data);
    })
    .catch(error => {
      trc('Promise resolve error. vid pv change js');
      resolveFn([]);
    });
  }
 
  trc('Promise wait. vid pv change js');
  window.aidpSCookieListPromise.then(useData).catch(console.error);

  function useData(data) {
    window.aidpSCookieList = data;
    processData();
  }

  function processData() {
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