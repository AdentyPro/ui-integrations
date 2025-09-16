//Common
setTimeout(async () => {
    const traceNow = false;

    function trc(message) {
        if (traceNow) {
        console.trace(message);
        }
    }


    fireAuthEvent();

    let paywallEventFired = false;
    listenPaywall();

    listenSubscriptionCreate();

    function fireAuthEvent() {
        window.adenty.event.fireevent({
            name: 'AuthStatus',
            eventarguments: JSON.stringify({'auth': !!Pelcro?.user?.read()?.id})
        });
    }

    function firePaywallEvent() {
        if(!paywallEventFired){
            trc('PaywallHit');
            window.adenty.event.fireevent({
                name: 'PaywallHit'
            });
            paywallEventFired = true;
        }
    }

    function fireConversionEvent() {
        window.adenty.event.fireevent({
            name: 'ConversionHappened'
        });
    }

    function listenPaywall() {
        const modalElement = document.querySelector('#pelcro-view-meter-modal');
        if (modalElement) {
            firePaywallEvent();
            return;
        }
        if(!window.Pelcro?.paywall?.displayMeterPaywall() && !window.Pelcro?.paywall?.displayNewsletterPaywall()) {
            if(window.Pelcro?.paywall?.displayPaywall(false)){ //we pass false in order not to dispatch event
                firePaywallEvent();
                return;
            }
        }
        const isAlwaysWalledContent = window.xxx?.metadata?.isAlwaysWalledContent;
        const isFreeContent = window.xxx?.metadata?.isFreeContent;
        if (!+isAlwaysWalledContent && !+isFreeContent){
            demeter("getDecision", { args: { visitor: window.userState?.userType }, onSuccess: (decision) => { 
                    trc('decision', decision)
                    if(decision?.outcome?.wallVisibility === "always") {
                        firePaywallEvent();
                        return;
                    }
                }});
        }
    }

    function listenSubscriptionCreate() {
        document.addEventListener('PelcroSubscriptionCreate', fireConversionEvent);
    }

}, 0)