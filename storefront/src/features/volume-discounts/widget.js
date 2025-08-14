import viewWidget from "@/views/volume-discounts/index.handlebars";
import tierItemWidget from "@/views/volume-discounts/tier-item.handlebars";
import viewVariantItem from "@/views/volume-discounts/variant-item.handlebars";
import viewChooseVariantWidget from "@/views/volume-discounts/choose-variant.handlebars";
import VariantRadios from "@/components/variant-radios";
import Modal from "@/components/modal";
import Cart from "@/components/cart";
import CartDrawer from "@/components/cart-drawer";
import { convertMoney, formatMoney, convertWithRate } from "@/utils/shopify";
import { getVariablesStyleOffer } from "@/shared/variables-style";
import { CART_DRAWER } from "@/constants/cart";

export default class Widget {
  constructor(payload) {
    this.product = payload.product;
    this.el = null;
    this.elContent = null;
    this.widgetID = payload.id;
    this.settings = payload.settings;
    this.btnAddToCart = payload.btnAddToCart || null;
    this.currency = payload.currency;
    this.offer = payload.offer;
    this.countdownTimer = payload.countdownTimer;
    this.originUrl = payload.originUrl;
    this.elForm = payload.elForm;
    this.cartType = payload.cartType || "";
    this.cart = null;
    this.cartDrawer = null;
    this.btnAddToCartWidget = null;
    this.modalChooseVariant = null;
    this.chooseVariantCurrent = null;
    this.instanceVariant = null;
    this.hasVariants = false;
    this.form = {};
    this.initialize();
  }

  initialize() {
    const self = this;
    if (!self.elForm) return;
    if (self.settings.override) {
      self.hideElementsOutsideProductForm();
    } else {
      self.handleRemoveElementsHidden();
    }
    self.cart = new Cart();
    self.cartDrawer = new CartDrawer();
    let { classAddToCard = "" } = self.getClassNameButtons();
    self.hasVariants =
      !self.product.variants ||
      self.product.variants.length <= 0 ||
      (self.product.variants.length == 1 &&
        self.product.variants[0].title == "Default Title")
        ? false
        : true;
    const view = viewWidget({
      settings: self.settings,
      title: self.offer.name,
      classAddToCard,
      tiers: self.offer.tiers,
      countdownTimer: self.countdownTimer,
      hasVariants: self.hasVariants,
    });
    self.createWidgetContainer({ view, settings: self.settings });
    self.el.classList.add("Msell-VD");
    self.el.setAttribute("id", `Msell-VD-${self.widgetID}`);
    let styleVariables = getVariablesStyleOffer(self.settings);
    self.el.style = `${self.el.getAttribute("style") ? self.el.getAttribute("style") : ""} ${styleVariables}`;
    self.elContent = self.el.querySelector(".Msell-VD__Content");
    if (self.hasVariants) {
      self.modalChooseVariant = new Modal({
        id: "Msell-VD-CV-Modal",
        className: "Msell-VD-CV-Modal",
      });
      let variantDefault = self.product.variants[0];
      let price = variantDefault.priced
        ? variantDefault.priced
        : self.getPriceFormat({ price: variantDefault.price });
      self.modalChooseVariant.elContent.insertAdjacentHTML(
        "beforeend",
        viewChooseVariantWidget({
          classAddToCard,
          product: { ...self.product, price },
          originUrl: self.originUrl,
          settings: self.settings,
        })
      );
      self.modalChooseVariant.el.style = `${self.modalChooseVariant.el.getAttribute("style") ? self.modalChooseVariant.el.getAttribute("style") : ""} ${styleVariables}`;
    }
    self.renderTiers();
    self.handleButton();
    self.runCountdownTimer();
  }

  renderTiers() {
    const self = this;
    self.hasVariants && self.detectChangeVariant();
    let isBest = false;
    let indexBest = -1;
    self.offer.tiers.forEach((item, index) => {
      if (
        `${index + 1}` == self.offer.mostPopularPosition &&
        self.offer.mostPopularActive
      ) {
        isBest = true;
        indexBest = index;
      }
    });
    self.offer.tiers.forEach((item, index) => {
      let isChecked = isBest
        ? indexBest == index
        : self.offer.tiers.length <= 1
          ? true
          : index == 1;
      self.createTier({
        tier: item,
        index,
        isChecked,
        isBest: indexBest == index,
        indexBest,
      });
    });
  }

  createTier({ tier, index, isChecked, isBest, indexBest }) {
    const self = this;
    const variantDefault = self.product.variants[0] || null;
    const variants = [];
    const promotionalContent = self.getPromotionalContent({ tier });
    const price = Number(variantDefault.price) * Number(tier.quantity);
    let salePrice = self.getPriceFormat({
      price: self.getPricePromotional({ price, tier }),
    });
    let regularPrice = self.getPriceFormat({ price });
    let objView = {
      tier,
      index,
      promotionalContent,
      widgetID: self.widgetID,
      salePrice,
      regularPrice,
      isBest,
      titleBest: self.settings.contentMostPopular,
      checked: isChecked,
      hasVariants: self.hasVariants,
    };
    indexBest == 0 && (self.elContent.style.marginTop = "12px");
    self.elContent.insertAdjacentHTML("beforeend", tierItemWidget(objView));

    const elItem = self.el.querySelector(
      `.Msell-VD__Item[data-tier-id="${tier.id}"]`
    );
    const elVariants = elItem.querySelector(".Msell-VD__Item-Variants");
    for (let i = 0; i <= tier.quantity - 1; i++) {
      if (self.hasVariants && elVariants) {
        self.createVariant({ el: elVariants, variantDefault, index: i, tier });
      }
      variants.push({
        index: i,
        idActive: variantDefault?.id || null,
        data: variantDefault,
      });
    }
    if (!self.form[tier.id]) {
      self.form[tier.id] = {
        id: tier.id,
        checked: isChecked,
        variantDefault,
        variants,
        el: elItem,
        elVariant: elVariants,
        tier,
        discountCode: tier.discountCode,
      };
    }
    self.handleSelectTier({ el: elItem, tier });
  }

  createVariant({ el, variantDefault, index, tier }) {
    const self = this;
    let divTag = document.createElement("div");
    divTag.innerHTML = viewVariantItem({
      index: index,
      stt: index + 1,
      name: variantDefault?.title || "",
    });
    let devFirst = divTag.firstChild;
    el.insertAdjacentElement("beforeend", devFirst);
    devFirst.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      let idActive = self.form[tier.id].variants[index].idActive;
      let obj = self.product.variants.find((item) => item.id == idActive);
      self.chooseVariantCurrent = {
        tier: tier,
        index,
        variant: obj,
      };
      self.instanceVariant?.updateInit({
        variant: obj,
        options: self.instanceVariant?.getOptions(obj),
      });
      self.handleChangeVariant();
      self.modalChooseVariant.show();
    });
  }

  detectChangeVariant() {
    const self = this;
    let elVariants = self.modalChooseVariant.elContent.querySelector(
      ".Msell-VD-CV__Variants"
    );
    if (elVariants) {
      self.instanceVariant = new VariantRadios({
        el: elVariants,
        options: self.product.options,
        variants: self.product.variants,
        variantDefault: self.product.variants[0],
        cbChange: () => {
          self.handleChangeVariant();
        },
      });
    }
  }

  handleChangeVariant() {
    const self = this;
    let currentVariant = self.instanceVariant?.getCurrentVariant();
    let elPrice = self.modalChooseVariant.elContent?.querySelector(
      ".Msell-VD-CV__Price"
    );
    if (elPrice) {
      elPrice.innerHTML = currentVariant.priced
        ? currentVariant.priced
        : `${self.getPriceFormat({ price: currentVariant.price })}`;
    }
    let elImage =
      self.modalChooseVariant.elContent?.querySelector(".Msell-Media");
    if (elImage) {
      elImage.setAttribute(
        "src",
        currentVariant?.image ? currentVariant?.image : self.product.image
      );
    }
  }

  handleSelectTier({ el, tier }) {
    const self = this;
    el.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      for (const property in self.form) {
        self.form[property].checked = false;
        self.form[property].el.classList.remove("Msell-VD__Item--Active");
      }
      self.form[tier.id].checked = true;
      self.form[tier.id].el.classList.add("Msell-VD__Item--Active");
    });
  }

  handleButton() {
    let self = this;
    let elBtnAddToCart = this.el.querySelector(".Msell-Button-AddToCart");
    if (elBtnAddToCart) {
      self.btnAddToCartWidget = elBtnAddToCart;
      elBtnAddToCart.addEventListener("click", this.handleAddToCart.bind(this));
    }
    let elBtnChooseVariant = this.modalChooseVariant?.elContent?.querySelector(
      ".Msell-Button-ChooseVariant"
    );
    if (elBtnChooseVariant) {
      elBtnChooseVariant.addEventListener(
        "click",
        this.handleChooseVariant.bind(this)
      );
    }
  }

  updatePrice() {
    const self = this;
    let total = 0;
    for (const property in self.form) {
      if (self.form[property].checked) {
        self.form[property].variants.forEach((item) => {
          total += +(item.data?.price || 0);
        });
        let regularPrice = self.getPriceFormat({ price: total });
        if (self.form[property].tier.useDiscount) {
          let salePrice = self.getPriceFormat({
            price: self.getPricePromotional({
              price: total,
              tier: self.form[property].tier,
            }),
          });
          let elPriceSale = self.form[property].el.querySelector(
            ".Msell-VD__PriceRegular"
          );
          if (elPriceSale) {
            elPriceSale.innerHTML = `${salePrice}`;
          }
          let elPriceOld = self.form[property].el.querySelector(
            ".Msell-VD__PriceDefault"
          );
          if (elPriceOld) {
            elPriceOld.innerHTML = `${regularPrice}`;
          }
        } else {
          let elPriceRegular = self.form[property].el.querySelector(
            ".Msell-VD__PriceRegular"
          );
          if (elPriceRegular) {
            elPriceRegular.innerHTML = `${regularPrice}`;
          }
        }
      }
    }
  }

  getPromotionalContent({ tier }) {
    let self = this;
    let promotionalContent = "";
    if (tier.useDiscount) {
      promotionalContent = tier.message
        ?.replaceAll("{quantity}", tier.quantity)
        ?.replaceAll(
          "{discount_value}",
          `${
            tier.discount_type == "percent"
              ? `${tier.discountValue}%`
              : `${formatMoney({
                price: convertMoney({
                  price: convertWithRate({
                    price: tier.discountValue,
                    rate: self.currency?.rate,
                    fee: self.currency?.fee,
                    round: self.currency?.round,
                  }),
                  format: self.currency?.format,
                  thousands: self.currency?.display_type,
                  decimal: self.currency?.display_decimal,
                  precision: self.currency?.decimal,
                }),
                format: self.currency?.format,
              })}`
          }`
        );
    } else {
      promotionalContent = tier.message;
    }
    return promotionalContent;
  }

  getPricePromotional({ price, tier }) {
    if (tier.discount_type == "percent") {
      return price - (price * Number(tier.discountValue)) / 100;
    } else {
      let newPrice = price - Number(tier.discountValue);
      return newPrice > 0 ? newPrice : 0;
    }
  }

  getPriceFormat({ price }) {
    const self = this;
    return formatMoney({
      price: convertMoney({
        price,
        format: self.currency?.format,
        thousands: self.currency?.display_type,
        decimal: self.currency?.display_decimal,
        precision: self.currency?.decimal,
      }),
      format: self.currency?.format,
    });
  }

  getClassNameButtons() {
    let classAddToCard = "Msell-Button";
    let classBuyNow = "Msell-Button";
    return { classAddToCard, classBuyNow };
  }

  async handleChooseVariant() {
    const self = this;
    self.modalChooseVariant.hide();
    let variantCurrent = self.instanceVariant?.getCurrentVariant();
    if (variantCurrent && self.chooseVariantCurrent) {
      self.form[self.chooseVariantCurrent.tier.id].variants[
        self.chooseVariantCurrent.index
      ] = {
        index: self.chooseVariantCurrent.index,
        idActive: variantCurrent.id,
        data: variantCurrent,
      };
    }
    self.updateVariantAndPriceTier({ variantCurrent });
    self.updatePrice();
  }

  updateVariantAndPriceTier({ variantCurrent }) {
    const self = this;
    let elItem = self.form[self.chooseVariantCurrent.tier.id].elVariant;
    let buttonVariant = elItem?.querySelector(
      `.Msell-Variant__Button[data-key="${self.chooseVariantCurrent.index}"]`
    );
    let spanVariant = buttonVariant?.querySelector("span");
    if (buttonVariant && variantCurrent?.title) {
      buttonVariant.setAttribute("title", variantCurrent.title);
      if (spanVariant) {
        spanVariant.innerHTML = variantCurrent.title;
      }
    }
  }

  async handleAddToCart(e) {
    e.preventDefault();
    const self = this;
    self.btnAddToCartWidget?.setAttribute("loading", "true");
    try {
      let discountCode = "";
      let payload = {
        items: [],
      };
      for (const property in self.form) {
        if (self.form[property].checked) {
          discountCode = self.form[property].discountCode;
          self.form[property].variants.forEach((item) => {
            let index = payload.items.findIndex(
              (itemChild) => itemChild.id == item.idActive
            );
            if (index >= 0) {
              payload.items[index].quantity += 1;
            } else {
              let obj = {
                id: item.idActive,
                quantity: 1,
              };
              payload.items.push(obj);
            }
          });
        }
      }
      if (payload.items.length <= 0) return;

      if (self.cartType == CART_DRAWER && self.cartDrawer.hasSupport()) {
        try {
          discountCode && (await this.cart.fetchDiscount({ discountCode }));
          await self.cartDrawer.addToCart(payload);
        } catch (e) {
          setTimeout(() => {
            self.cart.redirectCartPage();
          }, 300);
        }
      } else {
        await this.cart.addToCart(payload);
        discountCode && (await this.cart.fetchDiscount({ discountCode }));
        setTimeout(() => {
          self.cart.redirectCartPage();
        }, 300);
      }
    } catch (error) {
      // code
    } finally {
      self.btnAddToCartWidget?.removeAttribute("loading");
    }
  }

  createWidgetContainer({ view, settings }) {
    const self = this;
    self.el = document.createElement("div");
    self.el.innerHTML = view;
    let formTheme = self.elForm;
    if (settings.position == "below") {
      formTheme.insertAdjacentElement("afterend", self.el);
    } else {
      formTheme.insertAdjacentElement("beforebegin", self.el);
    }
    if (settings.override) {
      formTheme.setAttribute("msell-vd-hidden-section", "1");
    }
  }

  handleRemoveElementsHidden() {
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

  hideElementsOutsideProductForm() {
    const selectorOptionsHide = [
      ".dbtfy-color_swatches",
      ".product-layout-grid__detail .product-detail__options",
      ".product__info-wrapper variant-radios",
      "div[data-variant-picker]",
      ".product-detail__form__options.product-detail__gap-lg.product-detail__form__options--underlined",
      ".product-block-container .product-block.product-block-variant-picker:not(.pb-card-shadow)",
      ".product-block-container .product-block.product-block-quantity-selector:not(.pb-card-shadow)",
      ".product-form__quantity",
      ".product-block-item.atc-wrapper",
      ".product__quantity",
      ".product-form product-variants",
      ".tt-swatches-container",
      ".product__quantity",
      ".product-info__quantity-selector",
      "variant-picker",
      "product-page product-variants",
      ".product__variants-wrapper.product__block",
      ".product__controls-group-quantity.product__block",
      ".product-options--root",
      "variant-radios",
      ".quantity_selector",
      ".productView-subtotal",
      ".productView-options",
      "f-variant-picker",
      "[data-product-variants]",
      ".product__controls-group-quanity",
      ".yv-product-quantity",
      ".product-block--buy-button .button--sold-out",
      ".container .product__meta[itemscope] div div.row.gy-3",
      ".product__grid__item .product__content .product__selector[id^='ProductSelector-template--']",
      ".product-block .variant-wrapper",
      ".product__info-container variant-radios",
      ".pt-swatches-container.pt-swatches-container-js",
      ".product__info-container variant-selects",
      ".product__info-wrapper variant-selects",
      ".product-page-section variant-selects",
      ".pg__option--single",
      ".product-option-selector",
    ];

    selectorOptionsHide.forEach((item) => {
      let elOption = document.querySelector(item);
      if (elOption && !elOption.hasAttribute("msell-vd-hidden")) {
        elOption.setAttribute("msell-vd-hidden", "1");
      }
    });
  }

  runCountdownTimer() {
    let self = this;
    if (self.countdownTimer?.active) {
      self.timerEl = self.el.querySelectorAll("msell-countdown-timer");
      if (self.timerEl?.length) {
        Array.from(self.timerEl).forEach((item) => {
          item?.init?.({
            time: self.countdownTimer.time,
            timeRemaining: self.countdownTimer.timeRemaining,
            percentWarning: self.countdownTimer.percentWarning,
            cb: () => {
              item?.parentElement?.remove();
              self.offer.useDiscount = false;
              self.updatePrice();
              if (!self.settings?.title) {
                let elHeader = self.el.querySelector(".Msell-VD__Header");
                elHeader && elHeader.remove();
              } else {
                let elHeader = self.el.querySelector(".Msell-VD__Header");
                elHeader &&
                  elHeader.classList.remove("Msell-VD__Header--multi");
              }
            },
          });
        });
      }
    }
  }
}
