(function () {
    const NAMESPACE = 'activity_data';
    const paramValue = new URLSearchParams(window.location.search).get('gclid');

    if(!!paramValue) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].gclid = paramValue;
    }
})();
