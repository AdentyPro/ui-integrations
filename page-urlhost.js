(function () {
    const NAMESPACE = 'activity_data';
    const value = window.location?.host;

    if(!!value) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].page_urlhost = value;
    }
})();

