window.addEventListener("VisitorPageView", () => {
  const popupTemplate = `<style>
    .aidp-popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: "Arial";
    }

    .aidp-popup-container {
        position: relative;
        background: #FFFFFF;
        border-radius: 16px;
        border: 1px solid #EFF0F6;
        max-width: 420px;
        text-align: center;
        box-shadow: rgba(0, 0, 0, 0.2) 0px 11px 15px -7px, rgba(0, 0, 0, 0.14) 0px 24px 38px 3px, rgba(0, 0, 0, 0.12) 0px 9px 46px 8px;
    }

    .aidp-header {
        display: flex;
        justify-content: center;
        flex-direction: column;
        border-radius: 16px 16px 0 0;
        background: linear-gradient(270deg, #007ACC 12.18%, #0099FF 100%);
        text-align: center;
        min-height: 140px;
        color: #FCFCFC;
        margin-bottom: 0;
        padding: 20px 20px 0;
    }

    .aidp-triangle {
        position: relative;
        top: -.5px;
        clip-path: polygon(0% 0, 50% 100%, 100% 0%);
        width: 100%;
        height: 30px;
        background: linear-gradient(270deg, #007ACC 12.18%, #0099FF 100%);
    }

    .aidp-text {
        margin: 0;
        font-size: 24px;
        line-height: 40px;
        font-weight: 500;
        letter-spacing: 0.5px;
    }

    .aidp-actions {
        width: 100%;
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 20px;
        padding-bottom: 40px;
    }

    .aidp-button {
        width: 35%;
        padding: 10px 30px;
        border-radius: 30px;
        border: none;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
    }

    .aidp-cancel {
        background: #FFF;
        color: #FF781F;
        position: relative;
    }

    .aidp-cancel::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 30px;
        border: 2px solid transparent;
        background: linear-gradient(0deg, #FF781F 12.18%, #FD9B5B 100%) border-box;
        -webkit-mask: linear-gradient(#fff 0, #fff 0) padding-box, linear-gradient(#fff 0, #fff 0);
        -webkit-mask-composite: destination-out;
        mask-composite: exclude;
    }
    </style>
    <div class="aidp-popup">
        <div class="aidp-popup-container">
            <div class="aidp-header">
                <h3 class="aidp-text">{{popupTitle}}</h3>
            </div>
            <div class="aidp-triangle"></div>
            <div class="aidp-actions">
                <button class="aidp-button aidp-close aidp-cancel">Close</button>
            </div>
        </div>
    </div>`;

    let vid;
    let urlId;
    let segment;
    let isSegmentInit;
    let isHistoryInit;
    const siteName = "demo.adentypro.com";
    const siteForId = "adentypro";
    window.adenty?.dl.dlchanges.subscribe(async (res) => {
        if((window.adenty?.dl?.urlIdVendor?.id != null && urlId !== window.adenty?.dl?.urlIdVendor?.id && urlId == undefined)) {
            urlId = window.adenty?.dl?.urlIdVendor?.id;
            segment = window.adenty?.dl?.segmentVendor?.segment;
            let cookies = await window.adenty?.scookie.get();

            // fill vid
            const dlVid = window.adenty?.dl?.adenty?.visit?.vid;
            if(vid !== dlVid && !(cookies || [])?.find(cookie => cookie?.name === "aidpvid") && dlVid) {
                vid = dlVid;
                window.adenty?.scookie.set({name: "aidpvid", value: JSON.stringify(vid), scope: "SiteGroup"});
            }

            // fill segments
            const segmentVendorValue = window.adenty?.dl?.segmentVendor;
            const sCookieSegments = cookies?.find(cookie => cookie?.name === "aidp-segments");
            if(!sCookieSegments && !isSegmentInit) {
                window.adenty?.scookie.set({name: "aidp-segments", value: JSON.stringify([]), scope: "SiteGroup"});
                isSegmentInit = true;
            } else if(segmentVendorValue?.segment) {
                const currentSegments = sCookieSegments?.value ? JSON.parse(sCookieSegments.value) : [];
                if(!currentSegments.includes(segmentVendorValue.segment)) {
                    currentSegments.push(segmentVendorValue.segment);
                    segment = segmentVendorValue.segment;
                    window.adenty?.scookie.set({name: "aidp-segments", value: JSON.stringify([...new Set(currentSegments)]), scope: "SiteGroup"});
                }
            }

            // fill urlId
            const urlIdVendorValue = window.adenty?.dl?.urlIdVendor;
            if(urlIdVendorValue?.id != null && !(cookies || [])?.find(cookie => cookie?.name === "id-bridging-1")) {
                window.adenty?.scookie.set({name: "id-bridging-1", value: siteForId + '-' + urlIdVendorValue?.id, scope: "SiteGroup"});
                urlId = urlIdVendorValue?.id;
            }

            // fill history
            if (!cookies?.find(cookie => cookie?.name === "aidp-history") && !isHistoryInit) {
                window.adenty?.scookie.set({name: "aidp-history", value: JSON.stringify([]), scope: "SiteGroup"});
                isHistoryInit = true;
            }
        }
    });
    // fill history with section
    const analyticsButton = document.querySelector('a[href="https://demo.adentypro.com/solutions/analytics"]');
    if(analyticsButton) {
        analyticsButton.addEventListener('click', analyticsButtonClickHandler);
    }

    const identityButton = document.querySelector('a[href="https://demo.adentypro.com/solutions/identity"]');
    if(identityButton) {
        identityButton.addEventListener('click', identityButtonClickHandler);
    }

    const remarketingButton = document.querySelector('a[href="https://demo.adentypro.com/solutions/remarketing"]');
    if(remarketingButton) {
        remarketingButton.addEventListener('click', remarketingButtonClickHandler);
    }
    
    async function analyticsButtonClickHandler(e) {
        e.preventDefault();
        let cookies = await window.adenty?.scookie.get();
        if(!(cookies || [])?.find(cookie => cookie?.name === "aidp-smg_Analytics")) {
            let sCookieHistory = (cookies || [])?.find(cookie => cookie?.name === "aidp-history");
            let sCookieHistoryValue = sCookieHistory ? JSON.parse(sCookieHistory.value) : [];
            let neededSite = sCookieHistoryValue?.find((siteObject) => siteObject.site === siteName);
            
            if (!neededSite) {
                neededSite = {
                    site: siteName,
                    articles: [],
                    keywords: []
                };
                sCookieHistoryValue = [...sCookieHistoryValue, neededSite];
            }
            // for getting segment from api(Andrey said we can't get title directly)
            localStorage.setItem("titleName", "Track Visitor Activity");
        
            neededSite.articles.push("Track Visitor Activity");
            neededSite.keywords.push("analytics");
        
            window.adenty?.scookie.set({name: "aidp-history", value: JSON.stringify(sCookieHistoryValue), scope: "SiteGroup"});
            window.adenty?.scookie.set({name: "aidp-smg_Analytics", value: JSON.stringify(true), scope: "SiteGroup"});
        }

        window.location.href = "https://demo.adentypro.com/solutions/analytics";
    }
    
    async function remarketingButtonClickHandler(e) {
        e.preventDefault();
        let cookies = await window.adenty?.scookie.get();
        if(!(cookies || []).find(cookie => cookie?.name === "aidp-smg_Remarketing")) {
            let sCookieHistory = (cookies || []).find(cookie => cookie?.name === "aidp-history");
            let sCookieHistoryValue = sCookieHistory ? JSON.parse(sCookieHistory.value) : [];
            let neededSite = sCookieHistoryValue?.find((siteObject) => siteObject.site === siteName);
        
            if (!neededSite) {
                neededSite = {
                    site: siteName,
                    articles: [],
                    keywords: []
                };
                sCookieHistoryValue = [...sCookieHistoryValue, neededSite];
            }
            // for getting segment from api(Andrey said we can't get title directly)
            localStorage.setItem("titleName", "Remarketing");
        
            neededSite.articles.push("Remarketing");
            neededSite.keywords.push("remarketing");
        
            window.adenty?.scookie.set({name: "aidp-history", value: JSON.stringify(sCookieHistoryValue), scope: "SiteGroup"});
            window.adenty?.scookie.set({name: "aidp-smg_Remarketing", value: JSON.stringify(true), scope: "SiteGroup"});
        }

        window.location.href = "https://demo.adentypro.com/solutions/remarketing";
    }
    
    async function identityButtonClickHandler(e) {
        e.preventDefault();
        let cookies = await window.adenty?.scookie.get();
        if(!(cookies || []).find(cookie => cookie?.name === "aidp-smg_Identity")) {
            let sCookieHistory = (cookies || []).find(cookie => cookie?.name === "aidp-history");
            let sCookieHistoryValue = sCookieHistory ? JSON.parse(sCookieHistory.value) : [];
            let neededSite = sCookieHistoryValue?.find((siteObject) => siteObject.site === siteName);
            
            if (!neededSite) {
                neededSite = {
                    site: siteName,
                    articles: [],
                    keywords: []
                };
                sCookieHistoryValue = [...sCookieHistoryValue, neededSite];
            }
            // for getting segment from api(Andrey said we can't get title directly)
            localStorage.setItem("titleName", "Identify and Track Anonymous Visitors");
        
            neededSite.articles.push("Identify and Track Anonymous Visitors");
            neededSite.keywords.push("identity");
        
            window.adenty?.scookie.set({name: "aidp-history", value: JSON.stringify(sCookieHistoryValue), scope: "SiteGroup"});
            window.adenty?.scookie.set({name: "aidp-smg_Identity", value: JSON.stringify(true), scope: "SiteGroup"});
        }

        window.location.href = "https://demo.adentypro.com/solutions/identity";
    }  
    // counting pageView
    let pageView = localStorage.getItem("DemoPageView") || 0;
    pageView = parseInt(pageView);
    pageView++;
    localStorage.setItem("DemoPageView", pageView);

    function openPopup(title) {
        let modifiedTemplate = popupTemplate;
        modifiedTemplate = modifiedTemplate.replace('{{popupTitle}}', title);
        const shadowContainer = document.createElement('div');
        const popUpNode = shadowContainer.attachShadow({mode: 'open'});
        popUpNode.innerHTML = modifiedTemplate;
        document.body.prepend(shadowContainer);

        popUpNode.querySelector('.aidp-popup').style.zIndex = defineZIndex();

        popUpNode.querySelectorAll('.aidp-close')
            .forEach(element => element.addEventListener('click', closePopup.bind(this, popUpNode, shadowContainer)));
    }

    function closePopup(popupNode, shadowContainer) {
        popupNode.querySelectorAll('.aidp-close')
            .forEach(element => element.removeEventListener('click', closePopup.bind(this, popupNode, shadowContainer)));
        document.body.removeChild(shadowContainer);
    }

    function defineZIndex(increase = 1) {
        const topElements = document.querySelectorAll('body > *');
        return String(
            Array.from(topElements).reduce((acc, element) => {
            const zIndex = parseInt(getComputedStyle(element).zIndex, 10);
            return isNaN(zIndex) ? acc : Math.max(acc, zIndex);
            }, 0) + increase,
        );
    }
});