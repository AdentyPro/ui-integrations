(function () {
    const NAMESPACE = 'activity_data';
    const value = window.screen?.height;

    if(!!value) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].device_screenheight = value;
    }
})();

