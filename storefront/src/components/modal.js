import viewBackdrop from "@/views/components/modal/backdrop.handlebars";
import viewWrapper from "@/views/components/modal/wrapper.handlebars";

export default class Modal {

  constructor(payload) {
    this.el = null;
    this.elContent = null;
    this.initialize(payload);
  }

  initialize(payload) {
    if (!document.getElementById("Msell-Modal-Backdrop")) {
      document.body.insertAdjacentHTML("beforeend", viewBackdrop());
    }
    let div = document.createElement("div");
    div.innerHTML = viewWrapper({
      id: payload.id,
      className: payload.className,
    });
    this.el = div.firstChild;
    document.body.insertAdjacentElement("beforeend", div.firstChild);
    this.elContent = this.el.querySelector(".Msell-Modal__Content");

    this.el
      .querySelector(".Msell-Modal-Close")
      .addEventListener("click", this.hide.bind(this, false));
    this.el.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() === "ESCAPE") this.hide();
    });
    // if (this.classList.contains('media-modal')) {
    //   this.addEventListener('pointerup', (event) => {
    //     if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
    //   });
    // } else {
    //   this.addEventListener('click', (event) => {
    //     if (event.target === this) this.hide();
    //   });
    // }
  }

  show() {
    document.documentElement.classList.add("Msell-Modal-Opened");
    document.body.classList.add("Msell-Modal-Opened");
    this.el.classList.add("Msell-Modal-Show");
    let elPopupBackdrop = document.getElementById("Msell-Modal-Backdrop");
    if (elPopupBackdrop) {
      elPopupBackdrop.style.setProperty("display", "block", "important");
      elPopupBackdrop.style.opacity = "1";
    }
    if (this.el) {
      // this.el.style.display = "flex";
      this.el.classList.add("Msell-Modal-show");
    }
  }

  hide() {
    document.documentElement.classList.remove("Msell-Modal-Opened");
    document.body.classList.remove("Msell-Modal-opened");
    let elPopupBackdrop = document.getElementById("Msell-Modal-Backdrop");
    if (elPopupBackdrop) {
      elPopupBackdrop.style.display = "none";
      elPopupBackdrop.style.opacity = "0";
    }
    if (this.el) {
      // this.el.style.display = "none";
      this.el.classList.remove("Msell-Modal-Show");
    }
  }
}
