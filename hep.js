window.adenty_metrics_hepPromise = (async function () {
    function isPhone(value) {
        // Remove common phone formatting characters and check if it's a valid phone number
        const cleaned = value.replace(/[\s\-\(\)\+]/g, '');
        // Check if it contains only digits and has reasonable length (7-15 digits)
        return /^\d{7,15}$/.test(cleaned);
    }

    function normalizePhone(phone) {
        // Remove spaces, parentheses, and dashes
        let cleaned = phone.replace(/[\s\-\(\)]/g, '');

        // Convert to E.164 format
        // If it doesn't start with +, add it
        if (!cleaned.startsWith('+')) {
            // If it starts with 1 and has 11 digits, it's a US number: add +
            if (cleaned.startsWith('1') && cleaned.length === 11) {
                cleaned = '+' + cleaned;
            } else if (cleaned.length === 10) {
                // Assume US number without country code: add +1
                cleaned = '+1' + cleaned;
            } else {
                // For other cases, just add +
                cleaned = '+' + cleaned;
            }
        }

        return cleaned;
    }

    async function sha256Hash(value) {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    function pickPhoneValue(form) {
        let fields = form.querySelectorAll('input, textarea');

        for (let i = 0; i < fields.length; i++) {
            let val = (fields[i].value || '').trim();

            if (isPhone(val)) {
                return val;
            }
        }
        return null;
    }

    const NAMESPACE = 'activity_data';

    let hep = new URLSearchParams(window.location.search).get('hep') || null;

    if (!hep) {
        hep = window.dataLayer?.find((item) => 'hep' in item)?.hep || null;
    }

    if (!!hep) {
        hep = hep.trim();
        isPhone(hep) && (hep = await sha256Hash(hep));

        if (!window[NAMESPACE]) {
            window[NAMESPACE] = {};
        }

        window[NAMESPACE].hep = hep;
    }

    let forms = document.querySelectorAll('form');

    forms.forEach((form) => {
        form.addEventListener('submit', async () => {
            let phoneValue = pickPhoneValue(form);

            if (!phoneValue) {
                return;
            }

            console.log('fph: ' + phoneValue);

            let normalizedPhone = normalizePhone(phoneValue);
            let hashedPhone = await sha256Hash(normalizedPhone);

            window.adenty.event.fireevent({
                name: 'tr-phone',
                eventarguments: JSON.stringify({
                    source: 'form',
                    phone: hashedPhone,
                }),
            });
        });
    });

    return hep;
})();
