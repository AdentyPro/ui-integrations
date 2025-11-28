(function () {
    const NAMESPACE = 'activity_data';
    let crm_id =
        new URLSearchParams(window.location.search).get('crm_id') || null;

    if (!crm_id) {
        crm_id =
            window.dataLayer?.find((item) => 'crm_id' in item)?.crm_id || null;
    }

    if (!!crm_id) {
        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }
        window[NAMESPACE].crm_id = crm_id;
    }
})();
