(function () {
    const NAMESPACE = 'activity_data';
    const value = window.screen?.width;

    if(!!value) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].device_screenwidth = value;
    }
})();

