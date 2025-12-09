(function () {
  function init() {
    window.saveToServerCookie = saveToSCookieFn;
    const popupTemplate = `<style>
      #aidp-popup {
        position: fixed;
        /* display: none; */
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
        min-width: 420px;
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

      .aidp-form-label {
        display: block;
        text-align: justify;
        font-weight: 700;
        line-height: 24px;
        font-size: 14px;
        color: #4E4B66;
      }

      .aidp-text {
        margin: 0;
        font-size: 24px;
        line-height: 40px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }

      .aidp-form-input {
        padding: 8px;
        font-size: 16px;
        font-weight: 400;
        line-height: 24px;
        border: 1px solid #ccc;
        border-radius: 5px;
        color: rgba(0, 0, 0, 0.87);
        width: 100%;
        box-sizing: border-box;
        outline: none;
      }

      .aidp-form-select {
        padding: 10px 8px 10px 3px;
        font-size: 16px;
        font-weight: 400;
        line-height: 24px;
        border: 1px solid #ccc;
        border-radius: 5px;
        color: rgba(0, 0, 0, 0.87);
        width: 100%;
        box-sizing: border-box;
        outline: none;
      }

      .aidp-form-select:invalid {
        color: #ccc;;
      }

      .aidp-form {
        width: 75%;
        margin: auto;
        margin-top: 11px;
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

      .aidp-proceed {
        background: linear-gradient(180deg, #0099FF 12.18%, #007ACC 100%);
        color: #FCFCFC;
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
    <div id="aidp-popup">
      <div class="aidp-popup-container">
        <div class="aidp-header">
          <h3 class="aidp-text">Customer service</h3>
        </div>
        <div class="aidp-triangle"></div>
        <form class="aidp-form" id="form">
          <div class="field">
            <label class="aidp-form-label" for="problem">Problem</span></label>
            <input placeholder="Please provide your problem" class="aidp-form-input" type="text" id="problem" name="problem">
          </div>
          <div class="field">
            <label class="aidp-form-label" for="request">Request</label>
            <select class="aidp-form-select" name="request" id="request">
              <option value="value1" selected>Report a problem</option>
              <option value="value2">Suggest amendments</option>
              <option value="value3">Other</option>
            </select>
          </div>
        </form>
        <div class="aidp-actions">
          <button type="submit" class="aidp-button aidp-proceed aidp-close" id="proceed-button">Proceed</button>
          <button class="aidp-button aidp-cancel aidp-close">Cancel</button>
      </div>
      </div>
    </div>`;
    function openPopup() {
      const modifiedTemplate = popupTemplate;
      const shadowContainer = document.createElement('div');
      const popUpNode = shadowContainer.attachShadow({mode: 'open'});
      popUpNode.innerHTML = modifiedTemplate;
      document.body.prepend(shadowContainer);

      popUpNode.querySelector('#aidp-popup').style.zIndex = defineZIndex();

      popUpNode.querySelectorAll('.aidp-close')
        .forEach(element => element.addEventListener('click', closePopup.bind(this, popUpNode, shadowContainer)));

      const proceedButton = popUpNode.querySelector('#proceed-button');
      const form = popUpNode.querySelector('#form');

      proceedButton.addEventListener('click', function () {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });
        const event = new CustomEvent('DemoCustomerServiceProceed', {
          detail: data
        });
        window.dispatchEvent(event);
        console.log(data);
      });
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

    openPopup();

    function saveToSCookieFn() {
      window.addEventListener('DemoCustomerServiceProceed', (event) => window.adenty.scookie.set({name: 'demoCustomerServiceInfo', value: JSON.stringify(event.detail)}));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();