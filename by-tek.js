(async function () {
    // Delay to allow synchronous scripts to execute and set their values
    const SCRIPT_EXECUTION_DELAY_MS = 100;
    const NAMESPACE = 'adenty_metrics';

    const waitForScripts = () => {
        return new Promise((resolve) => {
            const executeAfterDelay = () => {
                // Use requestAnimationFrame to ensure execution after all synchronous scripts
                // in the current event loop cycle, improving data collection reliability
                requestAnimationFrame(() => {
                    setTimeout(resolve, SCRIPT_EXECUTION_DELAY_MS);
                });
            };

            const currentState = document.readyState;

            if (currentState === 'complete') {
                executeAfterDelay();
            } else {
                window.addEventListener('load', executeAfterDelay, {
                    once: true,
                });
            }
        });
    };

    await waitForScripts();

    // Wait for async hem and hep scripts to complete
    const hemPromise = window.adenty_metrics_hemPromise || Promise.resolve(null);
    const hepPromise = window.adenty_metrics_hepPromise || Promise.resolve(null);
    await Promise.all([hemPromise, hepPromise]);

    const data = window[NAMESPACE] || {};

    const page_url = data.page_url ?? null;
    const page_path = data.page_path ?? null;
    const page_urlhost = data.page_urlhost ?? null;

    const os_timezone = data.os_timezone ?? null;
    const os_name = data.os_name ?? null;
    const os_family = data.os_family ?? null;
    const os_manufacturer = data.os_manufacturer ?? null;
    const language = data.language ?? null;

    const device_type = data.device_type ?? null;
    const device_screenheight = data.device_screenheight ?? null;
    const device_screenwidth = data.device_screenwidth ?? null;

    const geo_country = data.geo_country ?? null;
    const geo_region = data.geo_region ?? null;
    const geo_city = data.geo_city ?? null;

    const user_agent = data.user_agent ?? null;
    const browser_name = data.browser_name ?? null;
    const browser_family = data.browser_family ?? null;
    const browser_lang = data.browser_lang ?? null;

    const user_ipaddress = data.user_ipaddress ?? null;

    const gclid = data.gclid ?? null;

    const hem = data.hem ?? null;
    const hep = data.hep ?? null;
    const crm_id = data.crm_id ?? null;

    const utm_source = data.utm_source ?? null;
    const utm_medium = data.utm_medium ?? null;
    const utm_campaign = data.utm_campaign ?? null;
    const utm_content = data.utm_content ?? null;
    const utm_term = data.utm_term ?? null;
    const utm_id = data.utm_id ?? null;

    window.adenty.event.fireevent({
        name: 'by-tek',
        eventarguments: JSON.stringify({
            page_url,
            page_path,
            page_urlhost,
            os_timezone,
            os_name,
            os_family,
            os_manufacturer,
            language,
            device_type,
            device_screenheight,
            device_screenwidth,
            geo_country,
            geo_region,
            geo_city,
            user_agent,
            browser_name,
            browser_family,
            browser_lang,
            user_ipaddress,
            gclid,
            hem,
            hep,
            crm_id,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_content,
            utm_term,
            utm_id,
        }),
    });
})();
