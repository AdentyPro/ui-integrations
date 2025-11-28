(function () {
    const NAMESPACE = 'adenty_metrics';

    if (!window[NAMESPACE]) {
        window[NAMESPACE] = {};
    }
    window[NAMESPACE].page_urlhost = window.location.host;
})();

