import viewWidget from "@/views/product-bundles/template-slider/index.handlebars";
import viewProductItem from "@/views/product-bundles/template-slider/product-item.handlebars";
import QuantityInput from "@/components/quantity-input";
import Widget from "@/features/product-bundles/widget";
import { clone } from "@/utils/lodash";
import { formatMoney } from "@/utils/shopify";

export default class BundleSwiper {
  constructor(payload) {
    this.type = payload.type || "";
    this.widget = new Widget({
      ...payload,
      cbResize: this.handleMedia.bind(this),
    });
    this.elSwiperComponent = null;
    this.initialize();
  }

  initialize() {
    let self = this;
    let listRecommend = [...clone(self.widget.recommend)];
    self.widget.el.classList.add("Msell-BSwiper");
    self.handleMedia();

    let { classAddToCard = "", classBuyNow = "" } =
      self.widget.getClassNameButtons();

    let promotionalContent = self.widget.getPromotionalContent();
    const view = viewWidget({
      settings: self.widget.settings,
      promotionalContent,
      classAddToCard,
      classBuyNow,
      discount: self.widget.getDiscount(),
      timer: self.widget.countdownTimer,
      widgetID: self.widget.widgetID,
    });
    self.widget.el.insertAdjacentHTML("beforeend", view);
    self.widget.el.setAttribute("id", `Msell-BSwiper-${self.widget.widgetID}`);
    const elList = self.widget.el.querySelector(".Msell-BSwiper__List");
    self.renderProducts({
      list: self.widget.default
        ? [self.widget.default, ...listRecommend]
        : [...listRecommend],
      elList,
    });
    self.elSwiperComponent = self.widget.el.querySelector("msell-swiper");
    self.elSwiperComponent && self.elSwiperComponent.reset?.();
    self.widget.runTimer();
    self.widget.updatePrice();
    self.widget.handleButton();
  }

  renderProducts({ list = [], elList }) {
    let self = this;
    list.map((item, index) => {
      if (!item.variants || item.variants.length <= 0) return;
      let variantDefault = item.variants[0];
      let isDefault = index == 0;
      let isChecked =
        self.widget.bundle.selectable == 3
          ? true
          : self.widget.bundle.selectable == 2
            ? false
            : self.widget.excludeIdsChecked.includes(String(item.id))
              ? false
              : true;
      let isDisabled = self.widget.bundle.selectable == 3 ? true : false;
      let isHideCheckbox = false; // isDefault && self.type == "cart" ? true : false
      let hasVariant = item.variants[0].title?.toLowerCase() != "default title";
      if (!self.widget.form[item.id]) {
        self.widget.form[item.id] = {
          id: item.id,
          image: item.image,
          checked: isChecked,
          isDefault,
          variantDefault,
          elVariant: [],
          elQuantity: [],
          hasVariant,
        };
      }
      const divTagItem = document.createElement("div");
      let price = variantDefault.priced
        ? variantDefault.priced
        : formatMoney({
          price: self.widget.convertMoneyWithRate({
            value: variantDefault.price,
          }),
          format: self.widget.currency?.format,
        });
      let objProductItem = {
        index,
        checked: isChecked,
        disabled: isDisabled,
        isHideCheckbox,
        prod: { ...item, price },
        widgetID: self.widget.widgetID,
        isDefault: isDefault,
        originUrl: self.widget.originUrl,
        settings: self.widget.settings,
      };
      divTagItem.innerHTML = viewProductItem(objProductItem);
      const elItem = divTagItem.firstChild;
      let elQuantityWrap = elItem.querySelector(".Msell-Bundle__Quantity");
      if (elQuantityWrap) {
        let elQuantity = new QuantityInput({
          el: elQuantityWrap,
          elInput: elQuantityWrap.querySelector("input"),
          elBtnMinus: elQuantityWrap.querySelector(
            ".Msell-Bundle__Quantity-Button[name='minus']"
          ),
          elBtnPlus: elQuantityWrap.querySelector(
            ".Msell-Bundle__Quantity-Button[name='plus']"
          ),
          cbChange: ({ value }) => {
            self.widget.form[item.id].elQuantity.value = value;
            self.widget.form[item.id].elQuantity.validateQtyRules({
              isChange: false,
            });
            self.widget.updatePrice();
          },
        });
        elQuantity.input.max = variantDefault.inventory;
        self.widget.form[item.id].elQuantity = elQuantity;
      }
      self.widget.createVariant({
        el: elItem,
        prod: item,
        variantDefault,
        index,
        hasVariant,
      });
      self.handleSelectProduct({ el: elItem, id: item.id });
      elList.insertAdjacentElement("beforeend", elItem);
    });
  }

  handleMedia() {
    let self = this;
    self.widget.el.classList.remove(
      "Msell-BSwiper--Desktop",
      "Msell-BSwiper--Tablet",
      "Msell-BSwiper--Mobile",
      "Msell-BSwiper--Mobile-LG",
      "Msell-BSwiper--Mobile-SM"
    );
    let offsetWidthParent = self.widget.el.parentElement?.offsetWidth || 0;
    if (offsetWidthParent > 1152) {
      self.widget.el.classList.add("Msell-BSwiper--Desktop");
    } else if (offsetWidthParent > 950) {
      self.widget.el.classList.add("Msell-BSwiper--Desktop");
    } else if (offsetWidthParent > 750) {
      self.widget.el.classList.add("Msell-BSwiper--Tablet");
    } else if (offsetWidthParent > 480) {
      self.widget.el.classList.add(
        "Msell-BSwiper--Mobile",
        "Msell-BSwiper--Mobile-LG"
      );
    } else {
      self.widget.el.classList.add(
        "Msell-BSwiper--Mobile",
        "Msell-BSwiper--Mobile-SM"
      );
    }
  }

  handleSelectProduct({ el, id }) {
    const self = this;
    const elCheckbox = el.querySelector(
      `#Msell-bundle-${self.widget.widgetID}-p${id}-select`
    );
    elCheckbox &&
      elCheckbox.addEventListener("change", function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.widget.form[id].checked = e.target.checked;
        self.widget.updatePrice();
        self.widget.handleStatusButton();
      });
  }
}
