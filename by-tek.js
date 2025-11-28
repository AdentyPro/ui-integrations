(async function () {
    // Delay to allow synchronous scripts to execute and set their values
    const SCRIPT_EXECUTION_DELAY_MS = 100;
    const NAMESPACE = 'activity_data';

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
    const hemPromise =
        window.adenty_metrics_hemPromise || Promise.resolve(null);
    const hepPromise =
        window.adenty_metrics_hepPromise || Promise.resolve(null);
    await Promise.all([hemPromise, hepPromise]);

    const activity_data = window[NAMESPACE] || null;

    !!activity_data &&
        window.adenty.event.fireevent({
            name: 'NPV',
            eventarguments: JSON.stringify(activity_data),
        });
})();
