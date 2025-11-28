(function () {
    const NAMESPACE = 'adenty_metrics';
    const paramValue = new URLSearchParams(window.location.search).get('utm_campaign');

    if (!window[NAMESPACE]) {
        window[NAMESPACE] = {};
    }

    window[NAMESPACE].utm_campaign = paramValue;
})();

