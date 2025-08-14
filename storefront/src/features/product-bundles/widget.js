import api from "@/api";
import viewBtnVariant from "@/views/components/variants/button.handlebars";
import viewExpandVariant from "@/views/components/variants/expand.handlebars";
import viewIconDelivery from "@/views/icons/delivery.handlebars";
import Dropdown from "@/components/dropdown";
import VariantRadios from "@/components/variant-radios";
import Cart from "@/components/cart";
import CartDrawer from "@/components/cart-drawer";
import { convertMoney, formatMoney, convertWithRate } from "@/utils/shopify";
import { getVariablesStyleBundle } from "@/shared/variables-style";
import { CART_DRAWER } from "@/constants/cart";

export default class Widget {
  constructor(payload) {
    this.el = payload.el;
    this.default = payload.default;
    this.recommend = payload.recommend;
    this.gift = payload.gift;
    this.widgetID = payload.id;
    this.settings = payload.settings;
    this.btnAddToCart = payload.btnAddToCart || null;
    this.btnBuyNow = payload.btnBuyNow || null;
    this.btnAddToCartWidget = null;
    this.currency = payload.currency;
    this.bundle = payload.bundle;
    this.originUrl = payload.originUrl;
    this.countdownTimer = payload.countdownTimer;
    this.excludeIdsChecked = payload.excludeIdsChecked || [];
    this.cartType = payload.cartType || "";
    this.theme = payload.theme || null;
    this.useAI = payload.useAI || false;
    this.shop = payload.shop || "";
    this.cbResize = payload.cbResize || null;
    this.isDiscount = false;
    this.lastUrl = location.href;
    this.variablesStyle = null;
    this.timerInterval = null;
    this.timerEl = null;
    this.timer = null;
    this.cartDrawer = null;
    this.cart = null;
    this.form = {};
    this.initialize();
  }

  initialize() {
    this.cart = new Cart();
    this.cartDrawer = new CartDrawer();
    this.variablesStyle = getVariablesStyleBundle(this.settings);
    this.el.style = `${this.el.getAttribute("style") ? this.el.getAttribute("style") : ""} ${this.variablesStyle}`;
    this.handleResize();
  }

  handleMedia() {
    let self = this;
    self.cbResize?.();
  }

  handleResize() {
    const resizeObserver = new ResizeObserver(() => this.handleMedia());
    resizeObserver.observe(this.el);
  }

  createVariant({ el, prod, variantDefault, isDropdown, hasVariant = true }) {
    const self = this;
    const dropdown = new Dropdown();
    dropdown.createButton({
      content: variantDefault?.title
        ? viewBtnVariant({ name: variantDefault?.title })
        : "",
    });
    let elVariant = el.querySelector(
      `#Msell-bundle-${self.widgetID}-p${prod.id}-variant`
    );
    // elVariant && elVariant.replaceWith(dropdown.button)
    if (elVariant) {
      hasVariant &&
        elVariant.insertAdjacentElement("beforeend", dropdown.button);
      dropdown.createExpand({
        content: viewExpandVariant({
          options: prod.options,
          widgetID: self.widgetID,
          prodID: prod.id,
          isDropdown,
        }),
      }); // , elementInsert: elVariant
      dropdown.elExpand.style = `${dropdown.elExpand.getAttribute("style") ? dropdown.elExpand.getAttribute("style") : ""} ${self.variablesStyle}`;
      let instanceVariant = new VariantRadios({
        el: dropdown.expand,
        elProduct: el,
        options: prod.options,
        variants: prod.variants,
        variantDefault,
        cbChange: () => {
          let currentVariant = self.form[prod.id].elVariant
            ? self.form[prod.id].elVariant.getCurrentVariant()
            : self.form[prod.id].variantDefault;
          if (self.form[prod.id].elVariant) {
            self.form[prod.id].elVariant.updateInit({
              variant: currentVariant,
              options: self.form[prod.id].elVariant.getCurrentOptions(),
            });
          }
          self.handleChangeVariant({ id: prod.id });
        },
      });
      self.form[prod.id].elVariant = instanceVariant;
    }
  }

  handleChangeVariant({ id, variantId = 0 }) {
    const self = this;
    let currentVariant = variantId
      ? self.form[id].elVariant?.variantData.find(
        (itemVariant) => itemVariant.id == variantId
      )
      : self.form[id].elVariant
        ? self.form[id].elVariant.getCurrentVariant()
        : self.form[id].variantDefault;
    if (variantId) {
      self.form[id].elVariant?.updateInit({
        variant: currentVariant,
        options: self.form[id].elVariant?.getOptions(currentVariant),
      });
    }
    let buttonVariant = self.form[id].elVariant?.elProduct?.querySelector(
      ".Msell-Variant__Button"
    );
    let spanVariant = buttonVariant?.querySelector("span");
    if (buttonVariant && currentVariant?.title) {
      buttonVariant.setAttribute("title", currentVariant.title);
      if (spanVariant) {
        spanVariant.innerHTML = currentVariant.title;
      }
    }
    if (self.form[id].elQuantity) {
      self.form[id].elQuantity.input.max = currentVariant.inventory;
      self.form[id].elQuantity.validateQtyRules();
    }
    let elImage =
      self.form[id].elVariant?.elProduct?.querySelector(".Msell-Media");
    if (elImage) {
      elImage.setAttribute(
        "src",
        currentVariant?.image ? currentVariant?.image : self.form[id].image
      );
    }
    self.updatePrice();
  }

  handleButton() {
    let self = this;
    let elBtnAddToCart = this.el.querySelectorAll(".Msell-Button-AddToCart");
    if (elBtnAddToCart?.length) {
      self.btnAddToCartWidget = elBtnAddToCart;
      Array.from(elBtnAddToCart).forEach((item) => {
        item.addEventListener("click", this.handleAddToCart.bind(this));
      });
    }
  }

  updatePrice() {
    const self = this;
    let total = 0;
    let totalNotDiscount = 0;
    let minium = 0;
    let valueDiscount = 0;
    for (const property in self.form) {
      if (self.form[property].checked) {
        let variantCurrent =
          self.form[property].elVariant?.getCurrentVariant() ||
          self.form[property].variantDefault;
        let quantity = Number(self.form[property].elQuantity?.value || 1);
        let price = variantCurrent.price;
        let priceNotDiscount =
          variantCurrent.compare_at_price &&
          variantCurrent.compare_at_price > variantCurrent.price
            ? variantCurrent.compare_at_price
            : variantCurrent.price;
        let priceNew = convertWithRate({
          price,
          rate: self.currency?.rate,
          fee: self.currency?.fee,
          round: self.currency?.round,
        });
        let priceNewNotDiscount = convertWithRate({
          price: priceNotDiscount,
          rate: self.currency?.rate,
          fee: self.currency?.fee,
          round: self.currency?.round,
        });
        if (self.useAI || self.form[property].isDefault) {
          total += price * quantity;
          totalNotDiscount += priceNotDiscount * quantity;
        } else {
          total += priceNew * quantity;
          totalNotDiscount += priceNewNotDiscount * quantity;
        }
      }
    }
    if (self.bundle.useDiscount) {
      minium = convertWithRate({
        price: self.bundle.minimumAmount,
        rate: self.currency?.rate,
        fee: self.currency?.fee,
        round: self.currency?.round,
      });
      if (self.bundle.discountType == "amount") {
        valueDiscount = convertWithRate({
          price: self.bundle.discountValue,
          rate: self.currency?.rate,
          fee: self.currency?.fee,
          round: self.currency?.round,
        });
      } else {
        valueDiscount = self.bundle.discountValue;
      }
    }

    let totalDiscount =
      self.bundle.discountType != "amount" ||
      (self.bundle.discountType == "amount" && self.bundle.discountOncePer)
        ? valueDiscount
        : 0;
    for (const property in self.form) {
      let variantCurrent =
        self.form[property].elVariant?.getCurrentVariant() ||
        self.form[property].variantDefault;
      let elPrice1 = self.form[property].elVariant?.elProduct?.querySelector(
        ".Msell-Bundle__PriceRegular"
      );
      let elPrice2 = self.form[property].elVariant?.elProduct?.querySelector(
        ".Msell-Bundle__PriceDefault"
      );
      let elPrice3 = self.form[property].elVariant?.elProduct?.querySelector(
        ".Msell-Bundle__PriceDiscount"
      );
      let price =
        self.useAI || self.form[property].isDefault
          ? variantCurrent.price
          : convertWithRate({
            price: variantCurrent.price,
            rate: self.currency?.rate,
            fee: self.currency?.fee,
            round: self.currency?.round,
          });
      let priceNew = 0;
      let priceNew3 = "";
      let priceNew3Temp = "";
      if (
        self.bundle.useDiscount &&
        self.bundle.promotionType == "discount" &&
        total >= minium &&
        self.form[property].checked
      ) {
        if (self.bundle.discountType == "amount") {
          if (self.bundle.discountOncePer) {
            let priceTemp = price - (valueDiscount / total) * price;
            priceNew = convertMoney({
              price: priceTemp && priceTemp > 0 ? priceTemp : 0,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            });
            priceNew3Temp = `${convertMoney({
              price: (valueDiscount / total) * price,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            })}`;
          } else {
            let priceTemp = price - valueDiscount;
            priceNew = convertMoney({
              price: priceTemp && priceTemp > 0 ? priceTemp : 0,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            });
            priceNew3Temp = `${convertMoney({
              price: priceTemp && priceTemp > 0 ? valueDiscount : price,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            })}`;
            let priceDiscount = priceTemp >= 0 ? valueDiscount : price;
            totalDiscount += priceDiscount;
          }
          priceNew3 = `${formatMoney({ price: priceNew3Temp, format: self.currency?.format })}`;
        } else {
          let priceTemp = price - (price * valueDiscount) / 100;
          priceNew = convertMoney({
            price: priceTemp && priceTemp > 0 ? priceTemp : 0,
            format: self.currency?.format,
            thousands: self.currency?.display_type,
            decimal: self.currency?.display_decimal,
            precision: self.currency?.decimal,
          });
          priceNew3Temp = `${valueDiscount}`;
          priceNew3 = `${valueDiscount}%`;
        }
        if (priceNew3Temp == 0) {
          if (elPrice1) {
            elPrice1.innerHTML = `${formatMoney({
              price: convertMoney({
                price: price || 0,
                format: self.currency?.format,
                thousands: self.currency?.display_type,
                decimal: self.currency?.display_decimal,
                precision: self.currency?.decimal,
              }),
              format: self.currency?.format,
            })}`;
          }
          if (elPrice2) {
            elPrice2.innerHTML = ``;
          }
          if (elPrice3) {
            elPrice3.innerHTML = ``;
          }
        } else {
          if (elPrice1) {
            elPrice1.innerHTML = `${formatMoney({ price: priceNew, format: self.currency?.format })}`;
          }
          if (elPrice2) {
            let newPrice2 = convertMoney({
              price: price || 0,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            });
            elPrice2.innerHTML = `${formatMoney({ price: newPrice2, format: self.currency?.format })}`;
          }
          if (elPrice3) {
            elPrice3.innerHTML = `${self.settings.contentSave || ""} ${priceNew3}`;
          }
        }
      } else {
        if (
          !self.bundle.useDiscount &&
          variantCurrent.compare_at_price &&
          variantCurrent.compare_at_price > variantCurrent.price
        ) {
          priceNew = convertMoney({
            price: variantCurrent.price,
            format: self.currency?.format,
            thousands: self.currency?.display_type,
            decimal: self.currency?.display_decimal,
            precision: self.currency?.decimal,
          });
          priceNew3Temp = `${convertMoney({
            price: variantCurrent.compare_at_price - variantCurrent.price,
            format: self.currency?.format,
            thousands: self.currency?.display_type,
            decimal: self.currency?.display_decimal,
            precision: self.currency?.decimal,
          })}`;
          let priceDiscount =
            variantCurrent.compare_at_price - variantCurrent.price;
          totalDiscount += priceDiscount;
          if (elPrice1) {
            elPrice1.innerHTML = `${formatMoney({ price: priceNew, format: self.currency?.format })}`;
          }
          if (elPrice2) {
            let newPrice2 = convertMoney({
              price: variantCurrent.compare_at_price,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            });
            elPrice2.innerHTML = `${formatMoney({ price: newPrice2, format: self.currency?.format })}`;
          }
          if (elPrice3) {
            priceNew3 = `${formatMoney({ price: priceNew3Temp, format: self.currency?.format })}`;
            elPrice3.innerHTML = `${self.settings.contentSave || ""} ${priceNew3}`;
          }
        } else {
          priceNew = convertMoney({
            price: price || 0,
            format: self.currency?.format,
            thousands: self.currency?.display_type,
            decimal: self.currency?.display_decimal,
            precision: self.currency?.decimal,
          });
          if (elPrice1) {
            elPrice1.innerHTML = `${formatMoney({ price: priceNew, format: self.currency?.format })}`;
          }
          if (elPrice2) {
            elPrice2.innerHTML = ``;
          }
          if (elPrice3) {
            elPrice3.innerHTML = ``;
          }
        }
      }
    }
    let elLabelPriceTotal = this.el.querySelectorAll(
      ".Msell-Bundle__TotalLabel"
    );
    let elStrongPriceTotal = this.el.querySelectorAll(
      ".Msell-Bundle__TotalRegular"
    );
    let elIPriceTotal = this.el.querySelectorAll(".Msell-Bundle__TotalDefault");
    let elPromotion = self.el.querySelectorAll(".Msell-Bundle__Promotion");
    let elDiscount = self.el.querySelectorAll(".Msell-Bundle__Discount");
    if (self.bundle.useDiscount && total >= minium) {
      self.isDiscount = true;
    } else {
      self.isDiscount = false;
    }
    if (self.bundle.useDiscount && total >= minium) {
      if (self.bundle.promotionType == "discount") {
        let totalTemp = 0;
        if (self.bundle.discountType == "amount") {
          if (self.bundle.discountOncePer) {
            totalTemp = total - valueDiscount;
          } else {
            totalTemp = total - totalDiscount;
          }
        } else {
          totalTemp = total - (total * valueDiscount) / 100;
        }

        if (elStrongPriceTotal?.length) {
          let valueTemp = `${formatMoney({
            price: convertMoney({
              price: totalTemp && totalTemp > 0 ? totalTemp : 0,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            }),
            format: self.currency?.format,
          })}`;
          Array.from(elStrongPriceTotal).forEach((item) => {
            item.innerHTML = valueTemp;
          });
        }
        if (elIPriceTotal?.length) {
          let valueTemp = `${formatMoney({
            price: convertMoney({
              price: total,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            }),
            format: self.currency?.format,
          })}`;
          Array.from(elIPriceTotal).forEach((item) => {
            item.innerHTML = valueTemp;
          });
        }

        if (elDiscount?.length) {
          let discountTemp = self.getDiscount(totalDiscount);
          Array.from(elDiscount).forEach((item) => {
            item.style.display = "";
            item.innerHTML = discountTemp;
          });
        }
        if (elPromotion?.length) {
          Array.from(elPromotion).forEach((item) => {
            item.style.display = "none";
          });
        }
        if (elLabelPriceTotal?.length) {
          Array.from(elLabelPriceTotal).forEach((item) => {
            item.style.display = "none";
          });
        }
      } else if (self.bundle.promotionType == "freeship") {
        if (elStrongPriceTotal?.length) {
          let valueTemp = `${formatMoney({
            price: convertMoney({
              price: total,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            }),
            format: self.currency?.format,
          })}`;
          Array.from(elStrongPriceTotal).forEach((item) => {
            item.innerHTML = valueTemp;
          });
        }
        if (elIPriceTotal?.length) {
          Array.from(elIPriceTotal).forEach((item) => {
            item.innerHTML = "";
          });
        }

        if (elDiscount?.length) {
          let discountTemp = `${viewIconDelivery()} Free shipping`;
          Array.from(elDiscount).forEach((item) => {
            item.style.display = "";
            item.innerHTML = discountTemp;
          });
        }
        if (elPromotion?.length) {
          Array.from(elPromotion).forEach((item) => {
            item.style.display = "none";
          });
        }
        if (elLabelPriceTotal?.length) {
          Array.from(elLabelPriceTotal).forEach((item) => {
            item.style.display = "";
          });
        }
      }
    } else {
      if (!self.bundle.useDiscount && totalNotDiscount > total) {
        if (elStrongPriceTotal?.length) {
          let valueTemp = `${formatMoney({
            price: convertMoney({
              price: total,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            }),
            format: self.currency?.format,
          })}`;
          Array.from(elStrongPriceTotal).forEach((item) => {
            item.innerHTML = valueTemp;
          });
        }
        if (elIPriceTotal?.length) {
          let valueTemp = `${formatMoney({
            price: convertMoney({
              price: totalNotDiscount,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            }),
            format: self.currency?.format,
          })}`;
          Array.from(elIPriceTotal).forEach((item) => {
            item.innerHTML = valueTemp;
          });
        }

        if (elDiscount?.length) {
          let discountTemp = `-${formatMoney({
            price: convertMoney({
              price: totalNotDiscount - total,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            }),
            format: self.currency?.format,
          })}`;
          Array.from(elDiscount).forEach((item) => {
            item.style.display = "";
            item.innerHTML = discountTemp;
          });
        }
        if (elPromotion?.length) {
          Array.from(elPromotion).forEach((item) => {
            item.style.display = "none";
          });
        }
        if (elLabelPriceTotal?.length) {
          Array.from(elLabelPriceTotal).forEach((item) => {
            item.style.display = "none";
          });
        }
      } else {
        if (elStrongPriceTotal?.length) {
          let valueTemp = `${formatMoney({
            price: convertMoney({
              price: total,
              format: self.currency?.format,
              thousands: self.currency?.display_type,
              decimal: self.currency?.display_decimal,
              precision: self.currency?.decimal,
            }),
            format: self.currency?.format,
          })}`;
          Array.from(elStrongPriceTotal).forEach((item) => {
            item.innerHTML = valueTemp;
          });
        }
        if (elIPriceTotal?.length) {
          Array.from(elIPriceTotal).forEach((item) => {
            item.innerHTML = ``;
          });
        }
        if (elDiscount?.length) {
          Array.from(elDiscount).forEach((item) => {
            item.style.display = "none";
          });
        }
        if (elPromotion?.length) {
          Array.from(elPromotion).forEach((item) => {
            item.style.display = "";
          });
        }
        if (elLabelPriceTotal?.length) {
          Array.from(elLabelPriceTotal).forEach((item) => {
            item.style.display = "";
          });
        }
      }
    }
  }

  getPromotionalContent() {
    let self = this;
    let promotionalContent = "";
    if (self.bundle.useDiscount) {
      if (self.bundle.promotionType == "gift") {
        promotionalContent = self.bundle.discountContent
          ?.replaceAll(
            "{minimum_bundle_amount}",
            `<span>${formatMoney({ price: self.convertMoneyWithRate({ value: self.bundle.minimumAmount }), format: self.currency?.format })}</span>`
          )
          ?.replaceAll(
            "{discount_value}",
            `<span>${
              self.bundle.gift_tye == "percent"
                ? `${self.bundle.gift_value}%`
                : self.bundle.gift_tye == "free"
                  ? "100%"
                  : `${formatMoney({
                    price: self.convertMoneyWithRate({
                      value: self.bundle.gift_value,
                    }),
                    format: self.currency?.format,
                  })}`
            }</span>`
          );
      } else if (self.bundle.promotionType == "freeship") {
        promotionalContent = self.bundle.discountContent
          ?.replaceAll(
            "{minimum_bundle_amount}",
            `<span>${formatMoney({ price: self.convertMoneyWithRate({ value: self.bundle.minimumAmount }), format: self.currency?.format })}</span>`
          )
          ?.replaceAll("{discount_value}", `<span>100%</span>`);
      } else {
        promotionalContent = self.bundle.discountContent
          ?.replaceAll(
            "{minimum_bundle_amount}",
            `<span>${formatMoney({ price: self.convertMoneyWithRate({ value: self.bundle.minimumAmount }), format: self.currency?.format })}</span>`
          )
          ?.replaceAll(
            "{discount_value}",
            `<span>${
              self.bundle.discountType == "percent"
                ? `${self.bundle.discountValue}%`
                : `${formatMoney({
                  price: self.convertMoneyWithRate({
                    value: self.bundle.discountValue,
                  }),
                  format: self.currency?.format,
                })}`
            }</span>`
          );
      }
    }
    return promotionalContent;
  }

  getDiscount(value) {
    let self = this;
    let discountValue = "";
    if (self.bundle.useDiscount) {
      if (self.bundle.discountType == "percent") {
        discountValue = `${self.settings.contentSave || ""} ${value ?? self.bundle.discountValue}%`;
      } else {
        let newValue = formatMoney({
          price: convertMoney({
            price:
              value ??
              convertWithRate({
                price: self.bundle.discountValue,
                rate: self.currency?.rate,
                fee: self.currency?.fee,
                round: self.currency?.round,
              }),
            format: self.currency?.format,
            thousands: self.currency?.display_type,
            decimal: self.currency?.display_decimal,
            precision: self.currency?.decimal,
            hasPrecision: false,
          }),
          format: self.currency?.format,
        });
        discountValue = `-${newValue}`;
      }
    }
    return discountValue;
  }

  getClassNameButtons() {
    let classAddToCard = "Msell-Button";
    let classBuyNow = "Msell-Button";
    return { classAddToCard, classBuyNow };
  }

  runTimer() {
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
              self.bundle.useDiscount = false;
              self.updatePrice();
              let elPromotion = self.el.querySelectorAll(
                ".Msell-Bundle__Promotion"
              );
              if (elPromotion?.length) {
                Array.from(elPromotion).forEach((itemSub) => {
                  itemSub && itemSub.remove();
                });
              }
            },
          });
        });
      }
    }
  }

  getVariantId() {
    let self = this;
    let variantId = self.btnAddToCart
      ?.closest("form")
      ?.querySelector("input[name='id']");
    return variantId ? variantId.value : "";
  }

  handleStatusButton() {
    const self = this;
    let count = 0;
    for (const property in self.form) {
      if (self.form[property].checked) {
        count += 1;
      }
    }
    if (count <= 0) {
      self.btnAddToCartWidget &&
        Array.from(self.btnAddToCartWidget).forEach((item) => {
          item?.setAttribute("disabled", "true");
        });
    } else {
      self.btnAddToCartWidget &&
        Array.from(self.btnAddToCartWidget).forEach((item) => {
          item?.removeAttribute("disabled");
        });
    }
  }

  async handleAddToCart(e) {
    e.preventDefault();
    const self = this;
    self.btnAddToCartWidget &&
      Array.from(self.btnAddToCartWidget).forEach((item) => {
        item?.setAttribute("loading", "true");
      });
    try {
      let productIds = [];
      let payload = {
        items: [],
      };
      for (const property in self.form) {
        if (self.form[property].checked) {
          let variantId = self.form[property].elVariant
            ? self.form[property].elVariant.getCurrentVariant().id
            : self.form[property].variantDefault.id;
          let obj = {
            id: variantId,
            quantity: self.form[property].elQuantity?.value || 1,
          };
          payload.items.push(obj);
          self.form[property].id && productIds.push(self.form[property].id);
        }
      }
      if (payload.items.length <= 0) return;
      await self.handleDiscount({ ids: productIds });

      if (self.cartType == CART_DRAWER && self.cartDrawer.hasSupport()) {
        try {
          await self.cartDrawer.addToCart(payload);
        } catch (e) {
          setTimeout(() => {
            self.cart.redirectCartPage();
          }, 300);
        }
      } else {
        await self.cart.addToCart(payload);
        setTimeout(() => {
          self.cart.redirectCartPage();
        }, 300);
      }
    } catch (error) {
      // code
    } finally {
      self.btnAddToCartWidget &&
        Array.from(self.btnAddToCartWidget).forEach((item) => {
          item?.removeAttribute("loading");
        });
    }
  }

  async handleDiscount({ ids }) {
    const self = this;
    try {
      let discountCode = "";
      if (self.isDiscount) {
        const payload = {
          shopify_domain: self.shop,
          bundle_id: self.bundle.id,
          product_ids: ids,
        };
        let res = await api.getDiscount(payload);
        if (res?.data?.code) {
          discountCode = res.data.code;
        }
        if (discountCode) {
          await self.cart.fetchDiscount({ discountCode });
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  convertMoneyWithRate({ value, hasPrecision = true }) {
    const self = this;
    return convertMoney({
      price: convertWithRate({
        price: value,
        rate: self.currency?.rate,
        fee: self.currency?.fee,
        round: self.currency?.round,
      }),
      format: self.currency?.format,
      thousands: self.currency?.display_type,
      decimal: self.currency?.display_decimal,
      precision: self.currency?.decimal,
      hasPrecision,
    });
  }
}
