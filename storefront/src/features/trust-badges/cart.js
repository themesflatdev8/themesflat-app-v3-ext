import api from "@/api";
import { FEATURE_TYPE_TRUST_BADGES_ON_CART } from "@/constants/features";
import { getVariablesStyleTrustBadges } from "@/shared/variables-style";
import { getImgFromServer } from "@/utils/cdn";
import { _checkoutButton } from "@/constants/selectors";

export default class TrustBadgesOnCart {
  constructor(payload) {
    this.payload = payload;
    this.init();
  }

  async init() {
    const self = this;
    const params = {
      shopify_domain: self.payload.shop,
      // product_id: window.shopifyMSell?.product?.id,
      type: FEATURE_TYPE_TRUST_BADGES_ON_CART,
      // mode:
      //   typeof window.shopifyMSell != "undefined"
      //     ? window.shopifyMSell.modeVolume || `${Date.now()}`
      //     : `${Date.now()}`,
    };

    const res = await api.getFeature(params);

    if (!res?.data?.visibility) {
      return;
    }
    this.settings = res.data;

    const themeName = window.Shopify?.theme?.schema_name;
    const themeName2 = window.Shopify?.theme?.name;
    //Render
    const dataTheme =
      _checkoutButton.find((x) =>
        themeName.toLowerCase().includes(x.name.toLowerCase())
      ) ??
      _checkoutButton.find((x) =>
        themeName2.toLowerCase().includes(x.name.toLowerCase())
      ) ??
      _checkoutButton.find((x) => x.name === "Default");
    this.checkoutSelector = dataTheme?.selectors;
    this.load();
    this.detectCartChange();
  }

  load() {
    const self = this;
    this.checkoutSelector?.forEach((keyData) => {
      const checkoutButton = document.querySelectorAll(keyData);
      if (checkoutButton.length > 0) {
        checkoutButton?.forEach((html) => {
          self.renderHtml({ el: html, data: self.settings });
        });
      }
      const paymentCart = document.querySelectorAll(".Msell-Trust-Badge--Cart");
      let check = 0;
      paymentCart.forEach((e) => {
        if (e.offsetParent?.className.includes("drawer")) {
          check = check + 1;
        }
      });

      if (paymentCart.length > 2) {
        if (check > 1) {
          paymentCart[1].parentNode?.removeChild(paymentCart[1]);
        } else {
          paymentCart[2].parentNode?.removeChild(paymentCart[2]);
        }
      }
    });
  }

  detectCartChange() {
    const self = this;
    let timerCartDrawer = null;
    const cartObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const isValidRequestType = ["xmlhttprequest", "fetch"].includes(
          entry.initiatorType
        );
        const isCartChangeRequest = /\/cart\//.test(entry.name);
        if (isValidRequestType && isCartChangeRequest) {
          clearTimeout(timerCartDrawer);
          timerCartDrawer = setTimeout(async () => {
            self.load();
          }, 590);
        }
      });
    });
    cartObserver.observe({ entryTypes: ["resource"] });
  }

  renderHtml({ el, data }) {
    const styles = getVariablesStyleTrustBadges(data);
    el.insertAdjacentHTML(
      data.position === "above" ? "beforebegin" : "afterend",
      `
      <div class="Msell-Trust-Badge Msell-Trust-Badge--Cart" data-template="${data.template}" style="${styles}">
        <h2>${data.heading || ""}</h2>
        <div class="Msell-Trust-Badge__List">
          ${data.icons
    .map((item) => {
      return `<div class="Msell-Trust-Badge__Item">
      <img
        src="${getImgFromServer("icons/trust", item)}"
        alt=""
      />
    </div>`;
    })
    .join("")}
        </div>
      </div>  
    `
    );
  }
}
