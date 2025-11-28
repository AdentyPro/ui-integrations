(async function () {
    const NAMESPACE = 'adenty_metrics';

    function isEmail(v) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
    }

    function normalizeEmail(email) {
        // Split email into local part and domain
        const [localPart, domain] = email.split('@');

        // Normalize domain to lowercase for comparison
        const normalizedDomain = domain.toLowerCase();

        // Remove dots from local part
        let normalizedLocal = localPart.toLowerCase().replace(/\./g, '');

        // Remove + tags (everything from + to @)
        const plusIndex = normalizedLocal.indexOf('+');
        if (plusIndex !== -1) {
            normalizedLocal = normalizedLocal.substring(0, plusIndex);
        }

        return normalizedLocal + '@' + normalizedDomain;
    }

    async function sha256Hash(value) {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    function pickEmailValue(form) {
        let fields = form.querySelectorAll('input, textarea');

        for (let i = 0; i < fields.length; i++) {
            let val = (fields[i].value || '').trim().toLowerCase();

            if (isEmail(val)) {
                return val;
            }
        }
        return null;
    }

    let forms = document.querySelectorAll('form');

    forms.forEach((form) => {
        form.addEventListener('submit', async () => {
            let emailValue = pickEmailValue(form);

            if (!emailValue) {
                return;
            }

            console.log('fem: ' + emailValue);

            let normalizedEmail = normalizeEmail(emailValue);
            let hashedEmail = await sha256Hash(normalizedEmail);

            if (!window[NAMESPACE]) {
                window[NAMESPACE] = {};
            }
            window[NAMESPACE].tr_email = hashedEmail;

            window.adenty.event.fireevent({
                name: 'tr-email',
                eventarguments: JSON.stringify({
                    source: 'form',
                    email: hashedEmail,
                }),
            });
        });
    });
})();
