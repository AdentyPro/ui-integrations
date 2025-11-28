(function () {
    const NAMESPACE = 'activity_data';
    const value = window.location?.href;

    if(!!value) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].page_url = value;
    }
})();
