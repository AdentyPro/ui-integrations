(function () {
    const NAMESPACE = 'adenty_metrics';

    if (!window[NAMESPACE]) {
        window[NAMESPACE] = {};
    }
    window[NAMESPACE].user_agent = window.adenty.dl.adenty.device.browser.useragent;
})();

