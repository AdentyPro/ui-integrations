(function () {
    const NAMESPACE = 'activity_data';
    const value = window.adenty?.dl?.adenty?.visit?.geo?.region;

    if(!!value) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].geo_region = value;
    }
})();

