(function () {
    const NAMESPACE = 'activity_data';
    const value = window.adenty?.dl?.adenty?.device?.type;

    if(!!value) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].device_type = value;
    }
})();

