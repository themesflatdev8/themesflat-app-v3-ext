import api from "@/api";
import BundleSwiper from "@/features/product-bundles/template-slider";
import BundleClassic from "@/features/product-bundles/template-classic";
import BundleAmazon from "@/features/product-bundles/template-amazon";
import BundlePopular from "@/features/product-bundles/template-popular";
import { mergeCountdownTimer } from "@/features/product-bundles/countdown-timer";
import { clone, disorder } from "@/utils/lodash";
import { convertWithFormatMoney } from "@/utils/shopify";
import { loadStyle } from "@/utils/load-file";
import {
  getRecommendationsProducts,
  getCartProducts,
  getProductShopifySyncApp,
  getProduct as getProductShopify,
} from "@/shared/shopify";
import { STRATEGY_AI } from "@/constants/product-bundles";
import { CART_DRAWER } from "@/constants/cart";

export default class BundleCartPage {
  constructor(payload) {
    this.payload = payload || {};
    this.init();
  }

  async init() {
    if (
      typeof window.shopifyMSellAppEmbed == "undefined" ||
      !window.shopifyMSellAppEmbed
    )
      return;
    this.handleCart({ productsCart: window.shopifyMSell.productsInCart });
  }

  async handleCart({ productsCart }) {
    const self = this;
    const ids = productsCart.map((item) => `${item.id}`) || [];
    const params = {
      shopify_domain: self.payload.shop,
      product_id: ids,
      pageType: "cart",
      theme_name: self.payload.themeName || "",
      mode:
        typeof shopifyMSell != "undefined"
          ? window.shopifyMSell.modeBundle || `${Date.now()}`
          : `${Date.now()}`,
    };

    const res = await api.getBundle(params);
    if (!res || (res && !res.data)) {
      return;
    }
    const { data } = res;
    let productBundle = data?.bundle?.product || null;
    if (data.theme_selector) {
      self.payload.themeSelector = data.theme_selector;
    }
    if (
      !data.bundle ||
      (data.bundle &&
        data.bundle.mode != STRATEGY_AI &&
        !data.bundle.list_commendations?.length)
    ) {
      self.detectCartLoadProduct();
      return;
    }
    if (!data.settings || !data.settings.visibility || !data.bundle.status) {
      return;
    }
    self.payload.hasProduct = true;
    if (data.settings) {
      self.payload.settings = data.settings;
    }

    self.payload.bundle = data.bundle;

    let productRecommendations = [];
    let productCurrent = null;
    if (self.payload.bundle.gift_product) {
      self.payload.giftProduct = self.payload.bundle.gift_product;
      self.payload.giftProduct.isGift = true;
    }
    if (self.payload.bundle.mode == STRATEGY_AI) {
      self.payload.useAI = true;
      let resProducts =
        (await self.loadRecommendationsProducts({
          ids: [...ids],
          limit: self.payload.bundle.maxProduct ?? 20,
        })) || [];
      if (!productBundle) {
        let objTemp = productsCart?.find((item) => `${item.id}` == `${resProducts?.id}`);
        if (objTemp) {
          let pro = await getProductShopify(objTemp.handle);
          productBundle = pro ? getProductShopifySyncApp(pro) : null;
        }
      }
      if (resProducts?.products?.length) {
        resProducts?.products?.map((item) => {
          let obj = getProductShopifySyncApp(item);
          if (
            obj.variants.length > 0 &&
            obj.status?.toLowerCase() == "active"
          ) {
            productRecommendations.push(clone(obj));
          }
        });
      } else {
        self.detectCartLoadProduct();
        return;
      }
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

    if (productBundle) {
      let obj = { ...productBundle };
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

    if (self.payload.bundle.useDiscount) {
      let objCountdownTimer = mergeCountdownTimer({
        bundle: self.payload.bundle,
        productId: `${productCurrent?.id}`,
      });
      if (objCountdownTimer) {
        self.payload.bundle.useDiscount = objCountdownTimer.useDiscount;
        self.payload.countdownTimer = objCountdownTimer.countdownTimer;
      }
    }

    self.payload.productRecommendations = productRecommendations.slice(
      0,
      self.payload.bundle.maxProduct ?? 10
    );
    self.payload.product = productCurrent;

    if (data.currency == self.payload.currency.code) {
      self.payload.currency = {
        ...self.payload.currency,
        fee: 0,
        round: -1,
      };
    } else {
      let productTemp = productsCart.find(
        (item) => `${item.id}` == `${productBundle?.id}`
      );
      if (productTemp) {
        const variants = self.payload.product.variants?.map((item) => {
          let obj = productTemp.variants?.find((other) => `${other.id}` == `${item.id}`);
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
    }

    if (productRecommendations?.length <= 0 && !productCurrent) {
      // code
    } else {
      self.renderWidgetCartDrawer({ ids, isFirstLoad: true });

      if (window.shopifyMSell.pageType == "cart") {
        let elCartPage = self.payload.themeSelector?.selector_cart_page
          ? document.querySelector(
            self.payload.themeSelector?.selector_cart_page
          )
          : null;
        if (elCartPage) {
          let divTag = document.createElement("DIV");
          divTag.innerHTML =
            "<div class='Msell-bundle Msell-bundle--Cart'></div>";
          divTag.classList.add("page-width", "Msell-Page-Width");
          elCartPage.insertAdjacentElement(
            self.payload.themeSelector?.position_cart_page || "beforeend",
            divTag
          );
          self.renderWidget({ el: divTag.firstChild, type: "page", ids });
          if (self.payload.themeSelector?.style_cart_page) {
            loadStyle(self.payload.themeSelector.style_cart_page);
          }
        }
      }
    }
  }

  async loadRecommendationsProducts({ ids, limit }) {
    let idsClone = disorder(ids);
    let res = [];
    let id = "";
    for (let i = 0; i < idsClone.length; i++) {
      let resProducts = await getRecommendationsProducts({
        productId: idsClone[i],
        limit,
      });
      if (resProducts?.products?.length) {
        id = idsClone[i];
        res = resProducts.products || [];
        break;
      }
    }
    return {
      id,
      products: res,
    };
  }

  detectCartLoadProduct() {
    const self = this;
    let timerCartDrawer = null;
    let isLoading = false;
    let el = self.payload.themeSelector?.selector_wrap_cart_drawer
      ? document.querySelector(
        self.payload.themeSelector?.selector_wrap_cart_drawer
      )
      : null;
    const observer = new MutationObserver(function () {
      if (self.payload.hasProduct) {
        observer.disconnect();
        return;
      }
      if (isLoading) return;
      clearTimeout(timerCartDrawer);
      timerCartDrawer = setTimeout(async () => {
        isLoading = true;
        let res = await getCartProducts();
        let arr = res.items.map((item) => {
          return {
            id: `${item.product_id}`,
            title: item.title,
            price: item.price,
            priced: "",
            variants: [],
          };
        });
        arr && arr.length && self.handleCart({ productsCart: arr });
        isLoading = false;
      }, 500);
    });
    const config = { subtree: true, childList: true };
    el && observer.observe(el, config);
  }

  detectCartChange() {
    let timerCartDrawer = null;
    const cartObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const isValidRequestType = ["xmlhttprequest", "fetch"].includes(
          entry.initiatorType,
        );
        const isCartChangeRequest = /\/cart\//.test(entry.name);
        if (isValidRequestType && isCartChangeRequest) {
          // cart drawer của theme phổ biến shopify
          clearTimeout(timerCartDrawer);
          timerCartDrawer = setTimeout(async () => {
            let resCartProducts = await getCartProducts();
            let elWrap = window._fether.themeSelector?.selector_wrap_cart_drawer
              ? document.querySelector(
                window._fether.themeSelector?.selector_wrap_cart_drawer,
              )
              : null;
            resCartProducts.items?.length > 0 && elWrap &&
              !elWrap.querySelector(".fether-widget") &&
              self.renderWidgetCartDrawer({ ids: resCartProducts.items.map((item) => `${item.product_id}`), isFirstLoad: false });
          }, 590);
        }
      });
    });
    cartObserver.observe({ entryTypes: ["resource"] });
  }

  renderWidgetCartDrawer({ ids, isFirstLoad = true }) {
    const self = this;
    let elCartDrawer = self.payload.themeSelector?.selector_cart_drawer
      ? document.querySelector(self.payload.themeSelector?.selector_cart_drawer)
      : null;
    if (elCartDrawer) {
      let divTag = document.createElement("DIV");
      divTag.classList.add("Msell-Bundle", "Msell-Bundle--Cart");
      elCartDrawer.insertAdjacentElement(
        self.payload.themeSelector?.position_cart_drawer || "beforeend",
        divTag
      );
      self.renderWidget({ el: divTag, type: CART_DRAWER, ids });
      if (self.payload.themeSelector?.style_cart_drawer && isFirstLoad) {
        loadStyle(self.payload.themeSelector.style_cart_drawer);
      }
    }
    if (isFirstLoad) {
      let el = self.payload.themeSelector?.selector_wrap_cart_drawer
        ? document.querySelector(
          self.payload.themeSelector?.selector_wrap_cart_drawer
        )
        : null;
      el && self.detectCartChange();
    }
  }

  renderWidget({ el, type = "", ids }) {
    const self = this;
    let offsetWidthParent = el.parentElement?.offsetWidth || 0;
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
      el,
      id: `cart-${type}`,
      type: "cart",
      cartType: type,
      excludeIdsChecked: ids,
      settings: settingsByTemplate,
      btnAddToCart: self.payload.btnAddToCart,
      btnBuyNow: self.payload.btnBuyNow,
      currency: self.payload.currency,
      bundle: self.payload.bundle,
      originUrl: self.payload.originUrl,
      countdownTimer: self.payload.countdownTimer,
      theme: self.payload.themeSelector,
      useAI: self.payload.useAI,
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
  }
}
