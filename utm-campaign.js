(function () {
    const NAMESPACE = 'activity_data';
    const paramValue = new URLSearchParams(window.location.search).get('utm_campaign');

    if(!!paramValue) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].utm_campaign = paramValue;
    }
})();

