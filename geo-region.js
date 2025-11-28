(function () {
    const NAMESPACE = 'adenty_metrics';

    if (!window[NAMESPACE]) {
        window[NAMESPACE] = {};
    }
    window[NAMESPACE].geo_region = window.adenty.dl.adenty.visit.geo.region;
})();

