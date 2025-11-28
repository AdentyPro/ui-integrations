(function () {
    const NAMESPACE = 'activity_data';
    const value = window.adenty?.dl?.adenty?.device?.browser?.name;

    if(!!value) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].browser_name = value;
    }
})();

