const traceNow = false

function trc(message) {
  if (traceNow) {
	  console.trace(message);
  }
}


//ipuaChanged + ipuaPVCountChanged
setTimeout(async () => {


  const ipUaName = 'aidp_tt_ip_ua';
  const ipUaCountName = 'aidp_tt_ip_uaPVCount';

  const date = new Date();
  date.setMonth(date.getMonth() + 1);
 



  let ipUa;
  let ipuaPVCount;
  let sCookieIpuaPVCountVal;

  if (!window.aidpSCookieList) {
    window.aidpSCookieList = await window.adenty?.scookie?.get();
  }

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
    return;
  }	
  
  
  
  
trc("ipChanged="+(ipUa.ip !== ipData))
trc("uaChanged="+(ipUa.ua !== browserData))
  if (ipUa.ip !== ipData || ipUa.ua !== browserData) {
    newIpuaPVCount = 1;
	sCookieIpuaPVCountVal = (sCookieIpuaPVCountVal ? sCookieIpuaPVCountVal: 0) //TODO check when SQL querying whether we have 0 in events, this is not expected
    // window.adenty.event.fireevent({
      // name: 'VisitorIpUaChanged', 
      // eventArguments: JSON.stringify({[ipUaName]: ipUaData})
    // });
    window.adenty.event.fireevent({
      name: 'VisitorIpUaCountChanged',
      eventArguments: JSON.stringify({[ipUaCountName]: sCookieIpuaPVCountVal, [ipUaName]: ipUaData})
    });

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

trc("PVCount++ "+sCookieIpuaPVCountVal+"->"+newIpuaPVCount)


}, 0);