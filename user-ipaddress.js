(function () {
    const NAMESPACE = 'activity_data';
    const value = window.adenty?.dl?.adenty?.visit?.ipsha;

    if(!!value) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].user_ipaddress = value;
    }
})();

