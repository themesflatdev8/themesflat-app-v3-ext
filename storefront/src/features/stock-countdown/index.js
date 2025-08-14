import api from "@/api";
import { FEATURE_TYPE_STOCK_COUNTDOWN } from "@/constants/features";
import { getVariablesStyleStockCountdown } from "@/shared/variables-style";
import viewClockIcon from "@/views/icons/clock.handlebars";
import viewWatchIcon from "@/views/icons/watch.handlebars";

export default class StockCountdown {
  constructor(payload) {
    this.payload = payload;
    this.el = document.querySelector(".Msell-Stock-Countdown-Block");
    if (this.el) {
      this.init();
    }
  }

  async init() {
    const self = this;
    const params = {
      shopify_domain: self.payload.shop,
      // product_id: window.shopifyMSell?.product?.id,
      type: FEATURE_TYPE_STOCK_COUNTDOWN,
      // mode:
      //   typeof window.shopifyMSell != "undefined"
      //     ? window.shopifyMSell.modeVolume || `${Date.now()}`
      //     : `${Date.now()}`,
    };

    const res = await api.getFeature(params);

    if (!res?.data?.visibility) {
      return;
    }
    const { data } = res;
    this.settings = data;
    this.load();
  }

  load() {
    const self = this;
    window.addEventListener("change", () => {
      const params = new URLSearchParams(window.location.search);
      const variantId = params.get("variant");
      if (variantId) {
        this.renderHtml({ el: self.el, data: self.settings, variantId });
      }
    });
    try {
      this.renderHtml({ el: self.el, data: self.settings });
    } catch {
      // code
    }
  }

  renderHtml({ el, data, variantId }) {
    const self = this;
    const styles = getVariablesStyleStockCountdown(data);
    let objVariant =
      self.payload.product?.variants?.find((item) => item.id == variantId) ||
      self.payload.product?.firstAvailableVariant ||
      self.payload.product?.variants?.[0];
    const stock =
      objVariant?.inventory_quantity && !isNaN(objVariant?.inventory_quantity)
        ? objVariant?.inventory_quantity
        : 0;
    if (stock <= 0) {
      el.style.display = "none";
    } else {
      el.style.display = "unset";
    }

    if (
      data.condition != "stock_quantity" ||
      (data.condition == "stock_quantity" &&
        !isNaN(data.conditionStock) &&
        stock <= Number(data.conditionStock))
    ) {
      el.insertAdjacentHTML(
        "beforeend",
        `
        <div class="Msell-Stock-Countdown" data-template="${data.template}" style="${styles}">
          <div class="Msell-Stock-Countdown__Icon">
            ${data.template == "default" ? viewClockIcon() : viewWatchIcon()}
          </div>
          <div class="Msell-Stock-Countdown__Content">
            ${(data.text || "")?.replaceAll("{stock_quantity}", `<strong>${stock}</strong>`)}
          </div>
        </div>  
      `
      );
    } else {
      el.style.display = "none";
    }
  }
}
