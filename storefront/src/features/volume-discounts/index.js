import api from "@/api";
import Widget from "@/features/volume-discounts/widget";
import { mergeCountdownTimer } from "@/features/volume-discounts/countdown-timer";
import { clone } from "@/utils/lodash";
import { convertWithFormatMoney } from "@/utils/shopify";

export default class VolumeDiscounts {

  constructor(payload) {
    this.payload = payload;
    this.init();
  }

  async init() {
    const self = this;
    const params = {
      shopify_domain: self.payload.shop,
      product_id: window.shopifyMSell?.product?.id,
      mode:
        typeof window.shopifyMSell != "undefined"
          ? window.shopifyMSell.modeVolume || `${Date.now()}`
          : `${Date.now()}`,
    };

    const res = await api.getOffer(params);

    if (!res || (res && !res.data)) {
      self.handleRemoveElementsHidden();
      return;
    }
    const { data } = res;
    // if(data.theme_selector){
    //   self.payload.themeSelector = data.theme_selector
    // }
    if (!data.offer) {
      self.handleRemoveElementsHidden();
      return;
    }
    let productCurrent = null;
    if (data && data.offer && data.offer.product) {
      let obj = { ...data.offer.product };
      let variants = [];
      obj.variants.forEach((variant) => {
        if (!variant.inventory_management) {
          variant.inventory = 999999;
        }
        if (variant.inventory > 0) {
          variants.push(variant);
        }
      });
      obj.variants = variants;
      if (obj.variants.length > 0 && obj.status == "active") {
        productCurrent = clone(obj);
      }
    }
    data.settings.visibility = true;
    if (
      !data.settings ||
      !data.settings.visibility ||
      !data.offer ||
      !data.offer.status
    ) {
      self.handleRemoveElementsHidden();
      return;
    }

    self.payload.offer = data.offer;
    self.payload.product = productCurrent;
    self.payload.settings = data.settings;

    if (self.payload.offer.tiers?.some((item) => item.useDiscount)) {
      let objCountdownTimer = mergeCountdownTimer({
        offer: self.payload.offer,
        productId: productCurrent?.id,
      });
      if (objCountdownTimer) {
        // self.payload.bundle.useDiscount = objCountdownTimer.useDiscount
        self.payload.countdownTimer = objCountdownTimer.countdownTimer;
      }
    } else {
      self.payload.countdownTimer = {};
      self.payload.countdownTimer.active = false;
    }

    if (data.currency == self.payload.currency.code) {
      self.payload.currency = {
        ...self.payload.currency,
        fee: 0,
        round: -1,
      };
    } else if (window.shopifyMSell.product) {
      const variants = self.payload.product.variants?.map((item) => {
        let obj = window.shopifyMSell.product.variants?.find(
          (other) => other.id == item.id,
        );
        if (obj) {
          item.priced = obj.priced;
          item.price = convertWithFormatMoney({
            price: obj.price,
            format: self.payload.currency.format,
          });
        }
        return item;
      });
      self.payload.product.variants = variants;
    }

    if (!productCurrent || !self.payload.elForm) {
      self.handleRemoveElementsHidden();
    } else {
      if (typeof observerFT != "undefined" && window.observerFT) {
        window.observerFT.disconnect();
      }
      let obj = {
        product: clone(self.payload.product),
        id: "volume-discount",
        cartType: self.payload.cartType,
        settings: self.payload.settings,
        countdownTimer: self.payload.countdownTimer,
        btnAddToCart: self.payload.btnAddToCart,
        currency: self.payload.currency,
        offer: self.payload.offer,
        originUrl: self.payload.originUrl,
        elForm: self.payload.elForm,
      };
      new Widget(obj);
    }
  }

  handleRemoveElementsHidden() {
    if (typeof window.obVolumeMS != "undefined" && window.obVolumeMS) {
      window.obVolumeMS.disconnect();
    }
    let elsBlur = document.querySelectorAll("[msell-vd-blur]");
    Array.from(elsBlur).forEach((item) => {
      item.removeAttribute("msell-vd-blur");
    });
    let elsForm = document.querySelectorAll("[msell-vd-hidden-section]");
    Array.from(elsForm).forEach((item) => {
      item.removeAttribute("msell-vd-hidden-section");
    });
    let els = document.querySelectorAll("[msell-vd-hidden]");
    Array.from(els).forEach((item) => {
      item.removeAttribute("msell-vd-hidden");
    });
  }
}
