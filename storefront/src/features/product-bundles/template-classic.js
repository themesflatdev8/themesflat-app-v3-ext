import viewWidget from "@/views/product-bundles/template-classic/index.handlebars";
import viewProductItem from "@/views/product-bundles/template-classic/product-item.handlebars";
import QuantityInput from "@/components/quantity-input";
import Widget from "@/features/product-bundles/widget";
import { clone } from "@/utils/lodash";
import { formatMoney } from "@/utils/shopify";

export default class BundleClassic {
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
    self.widget.el.classList.add("Msell-BClassic");
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
    });
    self.widget.el.insertAdjacentHTML("beforeend", view);
    self.widget.el.setAttribute("id", `Msell-BClassic-${self.widget.widgetID}`);
    const elList = self.widget.el.querySelector(".Msell-BClassic__List");
    let list = self.widget.default
      ? [self.widget.default, ...listRecommend]
      : [...listRecommend];
    self.renderProducts({
      list,
      elList,
    });
    if (list.length > 4) {
      self.elSwiperComponent = self.widget.el.querySelector("msell-swiper");
      self.elSwiperComponent && self.elSwiperComponent.reset?.();
    }
    self.widget.runTimer();
    self.widget.updatePrice();
    self.widget.handleButton();
  }

  renderProducts({ list = [], elList }) {
    let self = this;
    let elGroup = document.createElement("div");
    elGroup.classList.add("Msell-Swiper__Item", "Msell-BClassic__Group");
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
            if (self.widget.form[item.id].elQuantity) {
              self.widget.form[item.id].elQuantity.value = value;
              self.widget.form[item.id].elQuantity.validateQtyRules({
                isChange: false,
              });
            }
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
      elGroup.insertAdjacentElement("beforeend", elItem);
      if ((index + 1) % 4 == 0) {
        elList.insertAdjacentElement("beforeend", elGroup);
        elGroup = document.createElement("div");
        elGroup.classList.add("Msell-Swiper__Item", "Msell-BClassic__Group");
      } else if (index == list.length - 1) {
        elList.insertAdjacentElement("beforeend", elGroup);
      }
    });
  }

  handleMedia() {
    let self = this;
    self.widget.el.classList.remove(
      "Msell-BClassic--Desktop",
      "Msell-BClassic--Tablet",
      "Msell-BClassic--Mobile",
      "Msell-BClassic--Mobile-LG",
      "Msell-BClassic--Mobile-SM"
    );
    let offsetWidthParent = self.widget.el.parentElement?.offsetWidth || 0;
    if (offsetWidthParent > 1152) {
      self.widget.el.classList.add("Msell-BClassic--Desktop");
      setTimeout(() => {
        self.resizeItem({ oke: true });
      }, 300);
    } else if (offsetWidthParent > 950) {
      self.widget.el.classList.add("Msell-BClassic--Desktop");
      setTimeout(() => {
        self.resizeItem({ oke: true });
      }, 300);
    } else if (offsetWidthParent > 750) {
      self.widget.el.classList.add("Msell-BClassic--Tablet");
      setTimeout(() => {
        self.resizeItem({ oke: true });
      }, 300);
    } else if (offsetWidthParent > 480) {
      self.widget.el.classList.add(
        "Msell-BClassic--Mobile",
        "Msell-BClassic--Mobile-LG"
      );
      setTimeout(() => {
        self.resizeItem({ oke: false });
      }, 300);
    } else {
      self.widget.el.classList.add(
        "Msell-BClassic--Mobile",
        "Msell-BClassic--Mobile-SM"
      );
      setTimeout(() => {
        self.resizeItem({ oke: false });
      }, 300);
    }
  }

  resizeItem({ oke = true }) {
    const self = this;
    let height = 0;
    let arr = self.widget.el.querySelectorAll(".Msell-BClassic__Item");
    if (oke) {
      Array.from(arr).forEach((item) => {
        if (item.offsetHeight > height) {
          height = item.offsetHeight;
        }
      });
      Array.from(arr).forEach((item) => {
        item.style.minHeight = height + "px";
      });
    } else {
      Array.from(arr).forEach((item) => {
        item.style.minHeight = "";
      });
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
