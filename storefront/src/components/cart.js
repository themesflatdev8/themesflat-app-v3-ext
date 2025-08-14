import {
  _buttonsAddToCart,
  _buttonsBuyNow,
  _elementQuantity,
} from "@/constants/selectors";

export default class Cart {
  constructor(payload) {}

  async addToCart(payload) {
    return await fetch(window.Shopify.routes.root + "cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  async fetchDiscount({ discountCode }) {
    return await fetch(
      window.Shopify.routes.root + `discount/${discountCode}`,
      {
        credentials: "include",
      },
    );
    // await fetch(window.Shopify.routes.root + `cart?discount_code=FT_Offer9_172137986261,`)
  }

  redirectCartPage() {
    location.href = location.origin + "/cart";
    // this.btnAddToCart && this.btnAddToCart.click();
  }

  redirectCheckoutPage() {
    location.href = location.origin + "/cart/checkout";
    // let elForm = document.querySelector(`form[action$="/cart/add"]`)
    // elForm && elForm.submit()
  }

  getButtonAddToCart() {
    let btn = null;
    for (let i = 0; i < _buttonsAddToCart.length; i++) {
      let arrButtonFound = document.querySelectorAll(_buttonsAddToCart[i]);
      let buttonFound = Array.from(arrButtonFound).find((item) => {
        return (
          item &&
          (!item.style ||
            (item.style && item.style.display != "none") ||
            (item.style && item.style.opacity != "0"))
        );
      });
      if (buttonFound) {
        btn = buttonFound;
        break;
      }
    }
    return btn;
  }

  getButtonBuyNow() {
    let btn = null;
    for (let i = 0; i < _buttonsBuyNow.length; i++) {
      let arrButtonFound = document.querySelectorAll(_buttonsBuyNow[i]);
      let buttonFound = Array.from(arrButtonFound).find((item) => {
        return item;
      });
      if (buttonFound) {
        btn = buttonFound;
        break;
      }
    }
    return btn;
  }

  getElementQuantity() {
    let btn = null;
    for (let i = 0; i < _elementQuantity.length; i++) {
      let buttonFound = document.querySelector(_elementQuantity[i]);
      if (buttonFound) {
        btn = buttonFound;
        break;
      }
    }
    return btn;
  }
}
