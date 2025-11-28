(function () {
    const NAMESPACE = 'activity_data';
    const value = window.location?.pathname;

    if(!!value) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].page_path = value;
    }
})();
