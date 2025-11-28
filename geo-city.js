(function () {
    const NAMESPACE = 'activity_data';
    const value = window.adenty?.dl?.adenty?.visit?.geo?.city;

    if(!!value) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].geo_city = value;
    }
})();

