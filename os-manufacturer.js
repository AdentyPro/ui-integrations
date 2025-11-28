(function () {
    const NAMESPACE = 'adenty_metrics';

    if (!window[NAMESPACE]) {
        window[NAMESPACE] = {};
    }
    window[NAMESPACE].os_manufacturer = window.adenty.dl.adenty.device.os.manufacturer;
})();

