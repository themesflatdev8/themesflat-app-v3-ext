import viewWidget from "@/views/template-default-bundle/index.handlebars";
import viewViewMore from "@/views/template-default-bundle/view-more.handlebars";
import viewProductItem from "@/views/template-default-bundle/product-item.handlebars";
import viewIconPlush from "@/views/icons/plus.handlebars";
import Dropdown from "@/components/dropdown";
import QuantityInput from "@/components/quantity-input";
import Widget from "@/features/product-bundles/widget";
import { clone } from "@/utils/lodash";
import { formatMoney } from "@/utils/shopify";

export default class TemplateDefault {
  type = "";
  widget = null;
  viewMore = "";
  dropdownViewMore = null;

  constructor(payload) {
    this.type = payload.type || "";
    this.widget = new Widget(payload);
    this.initialize();
  }

  initialize() {
    let self = this;

    let listRecommend = [];
    self.widget.el.classList.add("msell-df");
    if (self.type == "modal") {
      if (window.matchMedia("(min-width: 850px)").matches) {
        self.widget.el.classList.add("msell-df--horizontal");
        self.widget.el.classList.add("msell-df--horizontal-desktop");
        if (self.widget.recommend.length >= self.getNumberRecommend(4)) {
          listRecommend = [
            ...clone(self.widget.recommend).splice(
              0,
              self.getNumberRecommend(3),
            ),
          ];
          this.viewMore = "dropdown";
        } else {
          listRecommend = [...clone(self.widget.recommend)];
        }
      } else if (
        (window.matchMedia("(min-width: 480px)").matches &&
          self.widget.recommend.length <= 1) ||
        window.matchMedia("(min-width: 768px)").matches
      ) {
        listRecommend = [
          ...clone(self.widget.recommend).splice(0, self.getNumberRecommend(2)),
        ];
        self.widget.el.classList.add("msell-df--horizontal");
        self.widget.el.classList.add("msell-df--horizontal-desktop");
        self.widget.el.classList.add("msell-df--view-more");
        this.viewMore = "dropdown";
      } else {
        // self.widget.el.classList.add("msell-df--horizontal")
        // self.widget.el.classList.add("msell-df--horizontal-mobile")
        // listRecommend = [...clone(self.widget.recommend)]
        // this.viewMore = "load-more"
        self.widget.el.classList.add("msell-df--vertical");
        listRecommend = [...clone(self.widget.recommend)];
        self.viewMore = "load-more";
      }
      if (window.matchMedia("(min-width: 992px)").matches) {
        self.widget.el.classList.add("msell-bundle--desktop");
      } else if (window.matchMedia("(min-width: 480px)").matches) {
        self.widget.el.classList.add("msell-bundle--tablet");
      } else {
        self.widget.el.classList.add("msell-bundle--mobile");
      }
      // if(self.widget.settings.style == "1"){
      //   if (window.matchMedia("(min-width: 850px)").matches) {
      //     self.widget.el.classList.add("msell-df--horizontal")
      //     self.widget.el.classList.add("msell-df--horizontal-desktop")
      //     if(self.widget.recommend.length >= 4){
      //       listRecommend = [...clone(self.widget.recommend).splice(0, 3)]
      //       this.viewMore = "load-more"
      //     }else{
      //       listRecommend = [...clone(self.widget.recommend)]
      //     }
      //   } else if (window.matchMedia("(min-width: 480px)").matches) {
      //     listRecommend = [...clone(self.widget.recommend).splice(0, 2)]
      //     self.widget.el.classList.add("msell-df--horizontal")
      //     self.widget.el.classList.add("msell-df--horizontal-desktop")
      //     self.widget.el.classList.add("msell-df--view-more")
      //     this.viewMore = "load-more"
      //   }else{
      //     self.widget.el.classList.add("msell-df--horizontal")
      //     self.widget.el.classList.add("msell-df--horizontal-mobile")
      //     listRecommend = [...clone(self.widget.recommend)]
      //     this.viewMore = "load-more"
      //   }
      // }else{
      //   self.widget.el.classList.add("msell-df--vertical")
      //   if(self.widget.recommend.length >=3){
      //     listRecommend = [...clone(self.widget.recommend).splice(0, 2)]
      //     this.viewMore = "load-more"
      //   }else{
      //     listRecommend = [...clone(self.widget.recommend)]
      //   }
      // }
    } else {
      let offsetWidthParent = self.widget.el.parentElement?.offsetWidth || 0;
      if (
        (offsetWidthParent >= 600 && self.widget.recommend.length <= 1) ||
        offsetWidthParent >= 850
      ) {
        self.widget.el.classList.add("msell-df--horizontal");
        self.widget.el.classList.add("msell-df--horizontal-desktop");
        if (offsetWidthParent >= 1500) {
          if (self.widget.recommend.length >= self.getNumberRecommend(5)) {
            listRecommend = [
              ...clone(self.widget.recommend).splice(
                0,
                self.getNumberRecommend(4),
              ),
            ];
            self.viewMore = "dropdown";
          } else {
            listRecommend = [...clone(self.widget.recommend)];
          }
        } else if (offsetWidthParent >= 1075) {
          if (self.widget.recommend.length >= self.getNumberRecommend(4)) {
            listRecommend = [
              ...clone(self.widget.recommend).splice(
                0,
                self.getNumberRecommend(3),
              ),
            ];
            self.viewMore = "dropdown";
          } else {
            listRecommend = [...clone(self.widget.recommend)];
          }
        } else {
          self.widget.el.classList.add("msell-df--view-more");
          if (offsetWidthParent >= 850) {
            if (self.widget.recommend.length > self.getNumberRecommend(2)) {
              listRecommend = [
                ...clone(self.widget.recommend).splice(
                  0,
                  self.getNumberRecommend(2),
                ),
              ];
              self.viewMore = "dropdown";
            } else {
              listRecommend = [...clone(self.widget.recommend)];
            }
          } else {
            if (
              self.widget.recommend.length > self.getNumberRecommend(1) &&
              self.getNumberRecommend(1) >= 1
            ) {
              listRecommend = [
                ...clone(self.widget.recommend).splice(
                  0,
                  self.getNumberRecommend(1),
                ),
              ];
              self.viewMore = "dropdown";
            } else {
              listRecommend = [...clone(self.widget.recommend)];
            }
          }
        }
      } else {
        // self.widget.el.classList.add("msell-df--horizontal-mobile")
        // listRecommend = [...clone(self.widget.recommend)]
        // this.viewMore = "load-more"
        self.widget.el.classList.add("msell-df--vertical");
        listRecommend = [...clone(self.widget.recommend)];
        self.viewMore = "load-more";
      }
      if (offsetWidthParent > 992) {
        self.widget.el.classList.add("msell-bundle--desktop");
      } else if (offsetWidthParent > 480) {
        self.widget.el.classList.add("msell-bundle--tablet");
      } else {
        self.widget.el.classList.add("msell-bundle--mobile");
      }
      // if(this.widget.settings.style == "1"){
      //   self.widget.el.classList.add("msell-df--horizontal")
      //   if(offsetWidthParent >= 490){
      //     self.widget.el.classList.add("msell-df--horizontal-desktop")
      //     if(offsetWidthParent >= 1125){
      //       if(self.widget.recommend.length >= 4){
      //         listRecommend = [...clone(self.widget.recommend).splice(0, 3)]
      //         this.viewMore = "dropdown"
      //       }else{
      //         listRecommend = [...clone(self.widget.recommend)]
      //       }
      //     }else{
      //       self.widget.el.classList.add("msell-df--view-more")
      //       if(offsetWidthParent >= 850){
      //         if(self.widget.recommend.length > 2){
      //           listRecommend = [...clone(self.widget.recommend).splice(0, 2)]
      //           this.viewMore = "dropdown"
      //         }else{
      //           listRecommend = [...clone(self.widget.recommend)]
      //         }
      //       }else{
      //         if(self.widget.recommend.length > 1){
      //           listRecommend = [...clone(self.widget.recommend).splice(0, 1)]
      //           this.viewMore = "dropdown"
      //         }else{
      //           listRecommend = [...clone(self.widget.recommend)]
      //         }
      //       }
      //     }
      //   }else{
      //     self.widget.el.classList.add("msell-df--horizontal-mobile")
      //     listRecommend = [...clone(self.widget.recommend)]
      //     this.viewMore = "load-more"
      //   }
      // }else{
      //   self.widget.el.classList.add("msell-df--vertical")
      //   listRecommend = [...clone(self.widget.recommend)]
      //   this.viewMore = "load-more"
      // }
    }
    let { classAddToCard = "", classBuyNow = "" } =
      self.widget.getClassNameButtons();

    let promotionalContent = self.widget.getPromotionalContent();

    const view = viewWidget({
      settings: self.widget.settings,
      promotionalContent,
      classAddToCard,
      classBuyNow,
      discount: self.widget.getDiscount(),
      timer: self.widget.timer,
      isGift: self.widget.bundle.gift_active,
    });
    self.widget.el.insertAdjacentHTML("beforeend", view);
    self.widget.el.setAttribute("id", `msell-df-${self.widget.widgetID}`);
    const elDefault = self.widget.el.querySelector(".msell-df__prod-default");
    self.renderProducts({
      list: [self.widget.default],
      elInsert: elDefault,
      isDefault: true,
    });
    const elRecommend = self.widget.el.querySelector(
      ".msell-df__prod-recommend",
    );
    self.renderProducts({
      list: listRecommend,
      elInsert: elRecommend,
      viewMore: self.viewMore,
    });
    if (self.widget.bundle.gift_active) {
      const elGift = self.widget.el.querySelector(".msell-df__prod-gift");
      self.renderProducts({
        list: [self.widget.gift],
        elInsert: elGift,
        viewMore: "",
      });
    }
    if (self.type == "modal") {
      setTimeout(() => {
        self.resizeItem({
          selectorListWrap: ".msell-df__lemsell-inner",
          selectorItem: ".msell-df__item",
          selectorRecommend: ".msell-df__prod-recommend",
        });
      }, 100);
    } else {
      self.resizeItem({
        selectorListWrap: ".msell-df__lemsell-inner",
        selectorItem: ".msell-df__item",
        selectorRecommend: ".msell-df__prod-recommend",
      });
    }
    self.widget.runTimer();
    self.widget.updatePrice();
    self.widget.handleButton();
  }

  renderProducts({
    list = [],
    elInsert,
    viewMore = "",
    isDefault = false,
    isDropdown = false,
  }) {
    let self = this;
    list.map((item, index) => {
      if (!item.variants || item.variants.length <= 0) return;
      let isViewMoreLastItem =
        viewMore == "dropdown" && index == list.length - 1 ? true : false;
      let isChecked = !self.widget.bundle.selectable_bundle_option
        ? true
        : (isDefault ||
              (!isDropdown && !isViewMoreLastItem && viewMore != "load-more") ||
              (viewMore == "load-more" && index < 3)) &&
            !self.widget.excludeIdsChecked.includes(String(item.id))
          ? true
          : false;
      let isDisabled = !self.widget.bundle.selectable_bundle_option
        ? true
        : false;
      let variantDefault = item.variants[0];
      let isHideCheckbox = false; // isDefault && self.type == "cart" ? true : false
      let hasVariant = item.variants[0].title?.toLowerCase() != "default title";
      if (isDefault) {
        let variantId = self.widget.getVariantId();
        if (variantId) {
          variantDefault =
            item.variants.find((variant) => variant.id == variantId) ||
            variantDefault;
        }
      }
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
      } else {
        if (isDropdown && self.widget.form[item.id].checked) {
          isChecked = true;
        }
      }
      const divTag = document.createElement("div");
      // Dành cho prod chính để giá k bị lệch giũa store với bundle app mình
      let price = variantDefault.priced
        ? variantDefault.priced
        : formatMoney({
            price: self.widget.convertMoneyWithRate({
              value: variantDefault.price,
            }),
            format: self.widget.currency?.format,
          });
      divTag.innerHTML = viewProductItem({
        checked: isChecked,
        disabled: isDisabled,
        isHideCheckbox,
        prod: { ...item, price },
        widgetID: self.widget.widgetID,
        isDefault: isDefault,
        isViewMore: isViewMoreLastItem,
        isDropdown,
        originUrl: self.widget.originUrl,
        settings: self.widget.settings,
      });
      const elItem = divTag.firstChild;
      if (!isViewMoreLastItem) {
        let elQuantityWrap = elItem.querySelector(".msell-bundle__quantity");
        let elQuantity = new QuantityInput({
          el: elQuantityWrap,
          elInput: elQuantityWrap.querySelector("input"),
          elBtnMinus: elQuantityWrap.querySelector(
            ".msell-bundle__quantity-button[name='minus']",
          ),
          elBtnPlus: elQuantityWrap.querySelector(
            ".msell-bundle__quantity-button[name='plus']",
          ),
          cbChange: ({ value }) => {
            if (isDropdown && self.widget.form[item.id].elQuantity[0]) {
              self.widget.form[item.id].elQuantity[0].value = value;
              self.widget.form[item.id].elQuantity[0].validateQtyRules({
                isChange: false,
              });
            } else if (self.widget.form[item.id].elQuantity[1]) {
              self.widget.form[item.id].elQuantity[1].value = value;
              self.widget.form[item.id].elQuantity[1].validateQtyRules({
                isChange: false,
              });
            }
            self.widget.updatePrice();
          },
        });
        elQuantity.input.max = variantDefault.inventory;
        self.widget.form[item.id].elQuantity.push(elQuantity);
        self.widget.createVariant({
          el: elItem,
          prod: item,
          variantDefault,
          isDropdown,
          index,
          hasVariant,
        });
        self.handleSelectProduct({ el: elItem, id: item.id, isDropdown });
        if (viewMore == "load-more" && index >= 3) {
          elItem.style.display = "none";
        }
      } else {
        elItem.classList.add("msell-df__item--view-more");
        let elMedia = elItem.querySelector(".msell-df__item-media");
        self.dropdownViewMore = new Dropdown({ isClickInsideWrapper: true });
        self.dropdownViewMore.createButton({
          content: `<a class="msell-df__item-view-more">View more</a>`,
        });
        elMedia.insertAdjacentElement(
          "beforeend",
          self.dropdownViewMore.button,
        );
        let { classAddToCard = "", classBuyNow = "" } =
          self.widget.getClassNameButtons();
        self.dropdownViewMore.createExpand({
          content: viewViewMore({
            settings: self.widget.settings,
            classBuyNow,
            classAddToCard,
          }),
        });
        self.dropdownViewMore.expand.style =
          self.dropdownViewMore.expand.getAttribute("style") +
          " " +
          self.widget.variablesStyle;
        let elBtnBuyNow =
          self.dropdownViewMore.expand.querySelector(".msell-btn-buy-now");
        if (elBtnBuyNow) {
          // let color = window.getComputedStyle ? window.getComputedStyle(elBtnBuyNow, null).getPropertyValue("color") : elBtnBuyNow.style.color;
          // let paddingLeft = window.getComputedStyle ? window.getComputedStyle(elBtnBuyNow, null).getPropertyValue("padding-left") : elBtnBuyNow.style.paddingLeft;
          elBtnBuyNow.addEventListener(
            "click",
            this.widget.handleBuyNow.bind(this.widget),
          );
          // if(paddingLeft == "0px"){
          //   elBtnBuyNow.style.paddingLeft = "32px";
          //   elBtnBuyNow.style.paddingRight = "32px";
          // }
          // let elSvg = elBtnBuyNow.querySelector("svg")
          // elSvg.style.fill = color
        }
        let elBtnAddToCart = self.dropdownViewMore.expand.querySelector(
          ".msell-btn-add-to-cart",
        );
        if (elBtnAddToCart) {
          // let color = window.getComputedStyle ? window.getComputedStyle(elBtnAddToCart, null).getPropertyValue("color") : elBtnAddToCart.style.color;
          // let paddingLeft = window.getComputedStyle ? window.getComputedStyle(elBtnAddToCart, null).getPropertyValue("padding-left") : elBtnAddToCart.style.paddingLeft;
          elBtnAddToCart.addEventListener(
            "click",
            this.widget.handleAddToCart.bind(this.widget),
          );
          // if(paddingLeft == "0px"){
          //   elBtnAddToCart.style.paddingLeft = "32px";
          //   elBtnAddToCart.style.paddingRight = "32px";
          // }
          // let elSvg = elBtnAddToCart.querySelector("svg")
          // elSvg.style.fill = color
        }
        let elClose = self.dropdownViewMore.expand.querySelector(
          ".msell-df-view-more__close",
        );
        elClose &&
          elClose.addEventListener("click", () => {
            self.dropdownViewMore.hide();
          });
        let elViewMoreContent = self.dropdownViewMore.expand.querySelector(
          ".msell-df-view-more__content",
        );
        self.renderProducts({
          list: clone(self.widget.recommend),
          elInsert: elViewMoreContent,
          viewMore: "",
          isDropdown: true,
        });
      }
      if (index != 0) {
        elInsert.insertAdjacentHTML(
          "beforeend",
          `<div class="msell-bundle__plus msell-bundle__plus-align--center">${viewIconPlush()}</div>`,
        );
      }
      elInsert.insertAdjacentElement("beforeend", elItem);
      if (viewMore == "load-more" && index >= 3 && index == list.length - 1) {
        const elRecommend = self.widget.el.querySelector(
          ".msell-df__prod-recommend",
        );
        const aTag = document.createElement("a");
        aTag.classList.add("msell-df__prod-recommend-view-more");
        aTag.innerHTML = "View more";
        elRecommend.insertAdjacentElement("beforeend", aTag);
        aTag.addEventListener("click", () => {
          aTag.remove();
          let arrProd = elRecommend.querySelectorAll(".msell-df__item");
          Array.from(arrProd).map((prod) => {
            prod.style.display = "";
          });
        });
      }
    });
  }

  getNumberRecommend(number) {
    let newNumber = number;
    let self = this;
    if (self.widget.bundle.gift_active) {
      newNumber = newNumber - 1;
    }
    return newNumber;
  }

  resizeItem({
    selectorListWrap = "",
    selectorItem = "",
    selectorRecommend = "",
  }) {
    const self = this;
    const elLeft = self.widget.el.querySelector(selectorListWrap);
    const elIconPlus = elLeft.querySelectorAll(".msell-bundle__plus");
    let totalWidthIconPlus = 0;
    elIconPlus.forEach((item) => {
      totalWidthIconPlus += item.offsetWidth;
    });
    const widthLeft = elLeft.offsetWidth;
    const elRecommend = elLeft.querySelector(selectorRecommend);
    const elGift = elLeft.querySelector(selectorRecommend);
    const styleLeft = elLeft.currentStyle || window.getComputedStyle(elLeft);
    const styleRecommend =
      elRecommend.currentStyle || window.getComputedStyle(elRecommend);
    const styleGift = elGift.currentStyle || window.getComputedStyle(elGift);
    const widthBorder = (elGift ? 2 : 1) * 2.5;
    const totalWidth =
      widthLeft -
      totalWidthIconPlus -
      parseInt(styleLeft.paddingLeft) -
      parseInt(styleLeft.paddingRight) -
      parseInt(styleRecommend.paddingLeft) -
      parseInt(styleRecommend.paddingRight) -
      parseInt(styleGift?.paddingLeft || 0) -
      parseInt(styleGift?.paddingRight || 0) -
      widthBorder;
    const arrItemWidget = elLeft.querySelectorAll(selectorItem);
    const widthItem = totalWidth / arrItemWidget.length;
    console.log("totalWidth", totalWidth, widthLeft);
    arrItemWidget.forEach((item) => {
      item.style.width = widthItem + "px";
    });
    // let elImg = elRecommend.querySelector("img")
    // if(elImg){
    //   let heightImg = elImg.offsetHeight
    //   elRecommend.querySelectorAll(".msell-bundle__plus").forEach((item) => {
    //     item.style.paddingTop = (heightImg/2 - 6) + "px";
    //   })
    // }else{
    //   elRecommend.querySelectorAll(".msell-bundle__plus").forEach((item) => {
    //     item.classList.add("msell-bundle__plus-align--center")
    //   })
    // }
  }

  updateQuantity({ quantity = 1 }) {
    const self = this;
    let id = self.widget?.default?.id;
    if (id) {
      self.widget.form[id].elQuantity.forEach((item) => {
        item.value = quantity;
        item.validateQtyRules({ isChange: false });
      });
      self.widget.updatePrice();
    }
  }

  handleSelectProduct({ el, id, isDropdown }) {
    const self = this;
    const elCheckbox = el.querySelector(
      `#msell-w${self.widget.widgetID}-p${id}${isDropdown ? "-d" : ""}-checkbox`,
    );
    elCheckbox &&
      elCheckbox.addEventListener("change", function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.widget.form[id].checked = e.target.checked;
        if (isDropdown) {
          const elCheckboxOther = document.getElementById(
            `msell-w${self.widget.widgetID}-p${id}-checkbox`,
          );
          elCheckboxOther && (elCheckboxOther.checked = e.target.checked);
        } else {
          const elCheckboxOther = document.getElementById(
            `msell-w${self.widget.widgetID}-p${id}-d-checkbox`,
          );
          elCheckboxOther && (elCheckboxOther.checked = e.target.checked);
        }
        self.updateSelected();
        self.widget.updatePrice();
      });
  }

  updateSelected() {
    let self = this;
    if (!self.dropdownViewMore) return;
    let total = -1;
    for (const property in self.widget.form) {
      if (self.widget.form[property].checked) {
        total += 1;
      }
    }
    let elSelected = self.dropdownViewMore.expand.querySelector(
      ".msell-df-view-more__number-selected",
    );
    if (elSelected) {
      elSelected.innerHTML = `Selected ${total} out of ${self.widget.recommend.length} products`;
    }
  }
}
