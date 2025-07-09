//vidPVCount
setTimeout(async () => {

  if (!window.aidpSCookieList) {
    window.aidpSCookieList = await window.adenty?.scookie?.get();
  }

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
  



  
}, 0)