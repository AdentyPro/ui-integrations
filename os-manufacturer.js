(function () {
    const NAMESPACE = 'activity_data';
    const value = window.adenty?.dl?.adenty?.device?.os?.manufacturer;

    if(!!value) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].os_manufacturer = value;
    }
})();

