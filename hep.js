window.adenty_metrics_hepPromise = (async function () {
    function isPhone(value) {
        // Remove common phone formatting characters and check if it's a valid phone number
        const cleaned = value.replace(/[\s\-\(\)\+]/g, '');
        // Check if it contains only digits and has reasonable length (7-15 digits)
        return /^\d{7,15}$/.test(cleaned);
    }

    async function sha256Hash(value) {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    const NAMESPACE = 'adenty_metrics';
    let hep = window.dataLayer.find((item) => 'hep' in item)?.hep || null;

    if (!hep) {
        hep = (window[NAMESPACE] && window[NAMESPACE].tr_phone) || null;
    }

    if (!hep) {
        hep = new URLSearchParams(window.location.search).get('hep') || null;
    }

    if (!!hep) {
        hep = hep.trim();
        isPhone(hep) && (hep = await sha256Hash(hep));
    }

    if (!window[NAMESPACE]) {
        window[NAMESPACE] = {};
    }

    window[NAMESPACE].hep = hep;
    return hep;
})();

