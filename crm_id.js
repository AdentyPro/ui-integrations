(function () {
    const NAMESPACE = 'adenty_metrics';
    let crm_id =
        window.dataLayer.find((item) => 'crm_id' in item)?.crm_id || null;

    if (!crm_id) {
        crm_id =
            new URLSearchParams(window.location.search).get('crm_id') || null;
    }

    if (!window[NAMESPACE]) {
        window[NAMESPACE] = {};
    }

    window[NAMESPACE].crm_id = crm_id;
})();
