export default class CartDrawer {

  constructor(payload) {
    const self = this;
    this.elCart = null;
    self.init(payload);
  }

  init() {
    const self = this;
    self.elCart = document.querySelector("cart-drawer"); // support notification: document.querySelector('cart-notification') || document.querySelector('cart-drawer');
  }

  hasSupport() {
    let self = this;
    if (
      self.elCart &&
      self.elCart.getSectionsToRender &&
      self.elCart.getSectionsToRender()?.map((section) => section.id)?.length >
        0 &&
      self.elCart.renderContents
    ) {
      return true;
    }
    return false;
  }

  async addToCart({ items }) {
    let self = this;
    return await fetch("/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/javascript",
      },
      body: JSON.stringify({
        items,
        sections: self.elCart
          ?.getSectionsToRender()
          .map((section) => section.id),
        sections_url: window.location.pathname,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (self.elCart) {
          if (self.elCart.classList.contains("is-empty")) {
            self.elCart.classList.remove("is-empty");
          }
          self.elCart.renderContents(res);
        } else {
          location.href = location.origin + "/cart";
        }
      });
  }
}
