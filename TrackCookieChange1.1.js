//CookieIdChanged + CookieePVCountChanged
setTimeout(async () => {

  const cGUID = 'aidp_tt_cookieId';
  const ckCountName = 'aidp_tt_ckPVCount'; 

  
  const date = new Date();
  date.setMonth(date.getMonth() + 1);


  let ckPVCount;
  let sCookieCkPVCountVal;

  if (!window.aidpSCookieList) {
    window.aidpSCookieList = await window.adenty?.scookie?.get();
  }

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
  
}, 0)