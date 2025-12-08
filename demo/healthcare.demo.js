(function() {
    function init() {
        let popupTemplate = `<style>
            .aidp-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: "Arial";
            }

            .aidp-popup-container {
                position: relative;
                background: #FFFFFF;
                border-radius: 16px;
                border: 1px solid #EFF0F6;
                max-width: 420px;
                text-align: center;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 11px 15px -7px, rgba(0, 0, 0, 0.14) 0px 24px 38px 3px, rgba(0, 0, 0, 0.12) 0px 9px 46px 8px;
            }

            .aidp-header {
                display: flex;
                justify-content: center;
                flex-direction: column;
                border-radius: 16px 16px 0 0;
                background: linear-gradient(270deg, #007ACC 12.18%, #0099FF 100%);
                text-align: center;
                min-height: 140px;
                color: #FCFCFC;
                margin-bottom: 0;
                padding: 20px 20px 0;
            }

            .aidp-triangle {
                position: relative;
                top: -.5px;
                clip-path: polygon(0% 0, 50% 100%, 100% 0%);
                width: 100%;
                height: 30px;
                background: linear-gradient(270deg, #007ACC 12.18%, #0099FF 100%);
            }

            .aidp-text {
                margin: 0;
                font-size: 24px;
                line-height: 40px;
                font-weight: 500;
                letter-spacing: 0.5px;
            }

            .aidp-actions {
                width: 100%;
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 20px;
                padding-bottom: 40px;
            }

            .aidp-button {
                width: 35%;
                padding: 10px 30px;
                border-radius: 30px;
                border: none;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
            }

            .aidp-cancel {
                background: #FFF;
                color: #FF781F;
                position: relative;
            }

            .aidp-cancel::before {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: 30px;
                border: 2px solid transparent;
                background: linear-gradient(0deg, #FF781F 12.18%, #FD9B5B 100%) border-box;
                -webkit-mask: linear-gradient(#fff 0, #fff 0) padding-box, linear-gradient(#fff 0, #fff 0);
                -webkit-mask-composite: destination-out;
                mask-composite: exclude;
            }
            </style>
            <div class="aidp-popup">
                <div class="aidp-popup-container">
                    <div class="aidp-header">
                        <h3 class="aidp-text">{{popupTitle}}</h3>
                    </div>
                    <div class="aidp-triangle"></div>
                    <div class="aidp-actions">
                        <button class="aidp-button aidp-close aidp-cancel">Close</button>
                    </div>
                </div>
            </div>`;
        function openPopup(title) {
            let modifiedTemplate = popupTemplate;
            modifiedTemplate = modifiedTemplate.replace('{{popupTitle}}', title);   const shadowContainer = document.createElement('div');
            const popUpNode = shadowContainer.attachShadow({mode: 'open'});
            popUpNode.innerHTML = modifiedTemplate;
            document.body.prepend(shadowContainer);

            popUpNode.querySelector('.aidp-popup').style.zIndex = defineZIndex();

            popUpNode.querySelectorAll('.aidp-close')
                .forEach(element => element.addEventListener('click', closePopup.bind(this, popUpNode, shadowContainer)));
        }

        function closePopup(popupNode, shadowContainer) {
            popupNode.querySelectorAll('.aidp-close')
                .forEach(element => element.removeEventListener('click', closePopup.bind(this, popupNode, shadowContainer)));
            document.body.removeChild(shadowContainer);
        }

        function defineZIndex(increase = 1) {
            const topElements = document.querySelectorAll('body > *');
            return String(
                Array.from(topElements).reduce((acc, element) => {
                const zIndex = parseInt(getComputedStyle(element).zIndex, 10);
                return isNaN(zIndex) ? acc : Math.max(acc, zIndex);
                }, 0) + increase,
            );
        }
        openPopup("You viewed Custom healthcare software development earlier.");
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
)();