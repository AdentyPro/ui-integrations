(function() {
	async function sha256Hash(value) {
		const encoder = new TextEncoder();
		const data = encoder.encode(value);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
	}
  
	var qsp = new URLSearchParams(window.location.search);
	var wdl = window.dataLayer; //TODO define real location of datalayer
	
	var url = window.location.href;
	var ttl = document.title;
	var ua = window.adenty.dl.adenty.device.useragent;
	var lang = window.adenty.dl.adenty.device.language;
	var plt = window.adenty.dl.adenty.device.platform;
	var tz = window.adenty.dl.adenty.device.timezone;
	var ck = document.cookie;
	
	var gclid = qsp.get("gclid");
	var fbclid = qsp.get("fbclid");
	var crmid = wdl["crm-id"] || qsp.get("crm-id");
	var pc = wdl["product_category"];
	
	var em = wdl["email"] || qsp.get("cu-em");
	if(em) {
		em = em.trim().toLowerCase();
		em = await sha256Hash(em);
	}
	
	window.adenty.event.fireevent({
		name: 'NPV', 
		eventarguments: JSON.stringify({
			"url": url,
			"title": ttl,
			"uagent": ua,
			"lang": lang,
			"platform": plt,
			"tz": tz,
			"cookie": ck,
			"crmid": crmid,
			"gclid": gclid,
			"fbclid": fbclid,
			"category": pc,
			"email": em
			})
	});
})();