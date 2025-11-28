(function () {
    const NAMESPACE = 'adenty_metrics';

    if (!window[NAMESPACE]) {
        window[NAMESPACE] = {};
    }
    window[NAMESPACE].user_ipaddress = window.adenty.dl.adenty.visit.ipsha;
})();

