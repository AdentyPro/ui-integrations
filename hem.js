window.adenty_metrics_hemPromise = (async function () {
    function isEmail(value) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    }

    async function sha256Hash(value) {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    const NAMESPACE = 'adenty_metrics';
    let hem = window.dataLayer.find((item) => 'hem' in item)?.hem || null;

    if (!hem) {
        hem = (window[NAMESPACE] && window[NAMESPACE].tr_email) || null;
    }

    if (!hem) {
        hem = new URLSearchParams(window.location.search).get('hem') || null;
    }

    if (!!hem) {
        hem = hem.trim().toLowerCase();
        isEmail(hem) && (hem = await sha256Hash(hem));
    }

    if (!window[NAMESPACE]) {
        window[NAMESPACE] = {};
    }

    window[NAMESPACE].hem = hem;
    return hem;
})();
