//FpChanged + fpPVCountChanged
setTimeout(async () => {


  const fpName = 'aidp_tt_fp';
  const fpPVCountName = 'aidp_tt_fpPVCount';

  const date = new Date();
  date.setMonth(date.getMonth() + 1);




  let fp;
  let fpPVCount;
  let sCookiefpPVCountVal;

  if (!window.aidpSCookieList) {
    window.aidpSCookieList = await window.adenty?.scookie?.get();
  }

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
      // eventArguments: JSON.stringify({[fpName]: fpData})
    // });
    window.adenty.event.fireevent({ 
      name: 'VisitorFPCountChanged',
      eventArguments: JSON.stringify({[fpPVCountName]: sCookiefpPVCountVal, [fpName]: fpData})
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




}, 0);