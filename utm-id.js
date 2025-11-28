(function () {
    const NAMESPACE = 'adenty_metrics';
    const paramValue = new URLSearchParams(window.location.search).get('utm_id');

    if (!window[NAMESPACE]) {
        window[NAMESPACE] = {};
    }

    window[NAMESPACE].utm_id = paramValue;
})();

