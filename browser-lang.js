(function () {
    const NAMESPACE = 'adenty_metrics';

    if (!window[NAMESPACE]) {
        window[NAMESPACE] = {};
    }
    window[NAMESPACE].browser_lang = window.adenty.dl.adenty.device.browser.language;
})();

