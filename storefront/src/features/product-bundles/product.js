import api from "@/api";
import BundleSwiper from "@/features/product-bundles/template-slider";
import BundleClassic from "@/features/product-bundles/template-classic";
import BundleAmazon from "@/features/product-bundles/template-amazon";
import BundlePopular from "@/features/product-bundles/template-popular";
import { clone } from "@/utils/lodash";
import { mergeCountdownTimer } from "@/features/product-bundles/countdown-timer";
import { handleEmpty } from "@/shared/empty";
import { convertWithFormatMoney } from "@/utils/shopify";
import {
  getRecommendationsProducts,
  getProductShopifySyncApp,
} from "@/shared/shopify";
import { PAGE_TYPE_PRODUCT, STRATEGY_AI } from "@/constants/product-bundles";
// import { _dataFake } from "@/mock-data/bundle"

export default class BundleProductPage {

  constructor(payload) {
    this.payload = payload || {};
    this.init();
  }

  async init() {
    const self = this;
    const params = {
      shopify_domain: self.payload.shop,
      product_id: window.shopifyMSell?.product?.id,
      collection_ids: window.shopifyMSell?.collectionIds,
      pageType: PAGE_TYPE_PRODUCT,
      theme_name: self.payload.themeName || "",
      mode:
        typeof window.shopifyMSell != "undefined"
          ? window.shopifyMSell.modeBundle || `${Date.now()}`
          : `${Date.now()}`,
    };

    const res = await api.getBundle(params);

    if (!res || (res && !res.data)) {
      handleEmpty(self.payload.designMode);
      return;
    }
    const { data } = res;
    if (data.theme_selector) {
      self.payload.themeSelector = data.theme_selector;
    }
    if (!data.bundle) {
      handleEmpty(self.payload.designMode);
      return;
    }
    if (
      !data.settings ||
      !data.settings.visibility ||
      !data.bundle ||
      !data.bundle.status
    ) {
      return;
    }
    self.payload.bundle = data.bundle;
    if (data.settings) {
      self.payload.settings = data.settings;
    }
    if (self.payload.bundle.useDiscount) {
      let objCountdownTimer = mergeCountdownTimer({
        bundle: self.payload.bundle,
        productId: window.shopifyMSell.product?.id,
      });
      if (objCountdownTimer) {
        self.payload.bundle.useDiscount = objCountdownTimer.useDiscount;
        self.payload.countdownTimer = objCountdownTimer.countdownTimer;
      }
    }
    let productRecommendations = [];
    let productCurrent = null;
    if (self.payload.bundle && self.payload.bundle.product) {
      let obj = { ...self.payload.bundle.product };
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
      if (obj.variants.length > 0 && obj.status?.toLowerCase() == "active") {
        productCurrent = clone(obj);
      }
    }
    if (self.payload.bundle && self.payload.bundle.gift_product) {
      self.payload.giftProduct = self.payload.bundle.gift_product;
      self.payload.giftProduct.isGift = true;
    }
    if (self.payload.bundle.mode == STRATEGY_AI) {
      self.payload.useAI = true;
      let resProducts = await getRecommendationsProducts({
        productId: window.shopifyMSell?.product?.id,
        limit: self.payload.bundle.maxProduct ?? 20,
      });
      let products = resProducts?.products || [];
      products.map((item) => {
        let obj = getProductShopifySyncApp(item);
        if (obj.variants.length > 0 && obj.status?.toLowerCase() == "active") {
          productRecommendations.push(clone(obj));
        }
      });
    } else {
      if (self.payload.bundle.list_commendations) {
        self.payload.bundle.list_commendations.map((item) => {
          let obj = { ...item };
          let variants = [];
          item.variants.forEach((variant) => {
            if (!variant.inventory_management) {
              variant.inventory = 999999;
            }
            if (variant.inventory > 0) {
              variants.push(variant);
            }
          });
          obj.variants = variants;
          if (
            obj.variants.length > 0 &&
            obj.status?.toLowerCase() == "active"
          ) {
            productRecommendations.push(clone(obj));
          }
        });
      }
    }
    self.payload.productRecommendations = productRecommendations.slice(
      0,
      self.payload.bundle.maxProduct ?? 10,
    );
    self.payload.product = productCurrent;

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

    if (productRecommendations?.length <= 0 && !productCurrent) {
      handleEmpty(self.payload.designMode);
    } else {
      let arr = document.querySelectorAll(
        ".Msell-Bundle:not(.Msell-Bundle--Cart)",
      );
      Array.from(arr, (item, index) => {
        let offsetWidthParent = item.parentElement?.offsetWidth || 0;
        let settingsByTemplate = null;
        if (offsetWidthParent < 600) {
          let templateMobile = self.payload.bundle.templateMobile;
          settingsByTemplate =
            self.payload.settings?.[
              templateMobile == "1"
                ? "themeOne"
                : templateMobile == "2"
                  ? "themeTwo"
                  : "themeThree"
            ];
        } else {
          let templateDesktop = self.payload.bundle.templateDesktop;
          settingsByTemplate =
            self.payload.settings?.[
              templateDesktop == "1"
                ? "themeOne"
                : templateDesktop == "2"
                  ? "themeTwo"
                  : "themeThree"
            ];
        }
        let obj = {
          default: clone(self.payload.product),
          recommend: clone(self.payload.productRecommendations),
          gift: self.payload.giftProduct,
          el: item,
          id: index + 1,
          type: PAGE_TYPE_PRODUCT,
          cartType: self.payload.cartType,
          settings: settingsByTemplate,
          btnAddToCart: self.payload.btnAddToCart,
          btnBuyNow: self.payload.btnBuyNow,
          currency: self.payload.currency,
          bundle: self.payload.bundle,
          originUrl: self.payload.originUrl,
          countdownTimer: self.payload.countdownTimer,
          useAI: self.payload.useAI,
          apiURI: self.payload.apiURI,
          shop: self.payload.shop,
        };
        if (settingsByTemplate?.template == "4") {
          new BundleClassic(obj);
        } else if (settingsByTemplate?.template == "2") {
          new BundlePopular(obj);
        } else if (settingsByTemplate?.template == "3") {
          new BundleAmazon(obj);
        } else {
          new BundleSwiper(obj);
        }
      });
    }
  }
}
