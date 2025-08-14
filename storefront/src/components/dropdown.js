const idDropdown = "Msell-Dropdown";
const classDropdown = "Msell-Dropdown";
const classShowDropdown = `${classDropdown}-Show`;
const classBtnDropdown = "Msell-Dropdown__Button";
const classExpandDropdown = "Msell-Dropdown__Panel";
const classArrowDropdown = "Msell-Dropdown__Panel-Arrow";

export class Dropdown {

  constructor(payload) {
    this.elButton = null;
    this.elExpand = null;
    this.isActive = false;
    this.elDropdown = null;
    this.isClickInsideWrapper = payload?.isClickInsideWrapper || false;
    this.minWidthExpand = payload?.minWidthExpand || 0;
    this.init();
  }

  get button() {
    return this.elButton;
  }

  get expand() {
    return this.elExpand;
  }

  get active() {
    return this.isActive;
  }

  init() {
    let self = this;
    let elDropdown = document.getElementById(idDropdown);
    if (!elDropdown) {
      self.elDropdown = document.createElement("div");
      self.elDropdown.setAttribute("id", idDropdown);
      document.body.insertAdjacentElement("beforeend", self.elDropdown);
    } else {
      self.elDropdown = elDropdown;
    }
  }

  toggle() {
    let self = this;
    if (self.isActive) {
      self.hide();
    } else {
      self.show();
    }
  }

  show() {
    let self = this;
    self.elButton.classList.add(classShowDropdown);
    self.elExpand?.classList.add(classShowDropdown);
    self.setPositionExpand();
    self.isActive = true;
    window.addEventListener("scroll", self.setPositionExpand);
  }

  hide() {
    let self = this;
    self.elButton.classList.remove(classShowDropdown);
    self.elExpand?.classList.remove(classShowDropdown);
    self.isActive = false;
    window.removeEventListener("scroll", self.setPositionExpand);
  }

  setAttribute(type, key, value) {
    let self = this;
    if (type == "button") {
      self.elButton.setAttribute(key, value);
    } else {
      self.elExpand.setAttribute(key, value);
    }
  }

  addClass(type, className) {
    let self = this;
    if (type == "button") {
      self.elButton.classList.add(className);
    } else {
      self.elExpand.classList.add(className);
    }
  }

  removeClass(type, className) {
    let self = this;
    if (type == "button") {
      self.elButton.classList.remove(className);
    } else {
      self.elExpand.classList.remove(className);
    }
  }

  createButton({ content }) {
    let self = this;
    let div = document.createElement("div");
    div.innerHTML = content;
    self.elButton = div.firstChild;
    self.elButton.classList.add(classBtnDropdown);

    self.elButton.addEventListener("click", function () {
      self.toggle();
    });
  }

  createExpand ({ content, elementInsert = null }) {
    let elInsert = elementInsert ? elementInsert : null;
    if (!elInsert) {
      elInsert = this.elDropdown ? this.elDropdown : document.body;
    }
    let self = this;
    let div = document.createElement("div");
    div.innerHTML = content;
    self.elExpand = div.firstChild;
    self.elExpand.classList.add(classExpandDropdown);

    elInsert.insertAdjacentElement("beforeend", self.elExpand);

    document.addEventListener(
      "click",
      function (event) {
        const isClickInsideExpand = self.elExpand.contains(event.target);
        const isClickInsideButton = self.elButton.contains(event.target);
        const isClickInsideParent = self.isClickInsideWrapper
          ? self.elDropdown.contains(event.target)
          : false;
        if (isClickInsideExpand || isClickInsideButton || isClickInsideParent) {
          // code
        } else {
          if (self.isActive) {
            self.hide();
          }
        }
      },
      false,
    );
  }

  setPositionExpand() {
    let self = this;
    let rectButton = self.elButton?.getBoundingClientRect() || null;
    let rectExpand = self.elExpand?.getBoundingClientRect() || null;
    let widthScreen = window.innerWidth;
    let heightScreen = window.innerHeight;
    if (rectButton && self.elExpand) {
      self.elExpand.style.top = "";
      self.elExpand.style.bottom = "";
      self.elExpand.style.left = "";
      self.elExpand.style.right = "";
      self.elExpand.style.minWidth = "";
      if (rectExpand) {
        // left - right
        if (rectExpand.width < widthScreen - rectButton.left) {
          // case left to right
          self.elExpand.style.left = rectButton.left - 40 + "px";
          self.elExpand.classList.remove(`${classArrowDropdown}--Right`);
          self.elExpand.classList.remove(`${classArrowDropdown}--Center`);
          self.elExpand.classList.add(`${classArrowDropdown}--Left`);
        } else if (rectExpand.width < rectButton.width + rectButton.left) {
          // case right to left
          self.elExpand.style.right =
            widthScreen - rectButton.right - 40 + "px";
          self.elExpand.classList.remove(`${classArrowDropdown}--Left`);
          self.elExpand.classList.remove(`${classArrowDropdown}--Center`);
          self.elExpand.classList.add(`${classArrowDropdown}--Right`);
        } else {
          // center
          let marginCenterBtn = rectButton.left + rectButton.width / 2;
          let left = marginCenterBtn - rectExpand.width / 2;
          if (left < 0) {
            left = 8;
          }
          self.elExpand.style.left = left + "px";
          self.elExpand.classList.remove(`${classArrowDropdown}--Right`);
          self.elExpand.classList.remove(`${classArrowDropdown}--Left`);
          self.elExpand.classList.add(`${classArrowDropdown}--Center`);
        }

        // top - bottom
        if (rectExpand.height < heightScreen - rectButton.bottom) {
          let bottom = rectButton.bottom + 4 + 4;
          if (bottom < 0) {
            self.elExpand.style.top = 0 + "px";
            self.elExpand.classList.remove(`${classArrowDropdown}--Down`);
            self.elExpand.classList.remove(`${classArrowDropdown}--Up`);
          } else {
            self.elExpand.style.top = bottom + "px";
            self.elExpand.classList.remove(`${classArrowDropdown}--Down`);
            self.elExpand.classList.add(`${classArrowDropdown}--Up`);
          }
        } else {
          let top = rectButton.top - rectExpand.height - 4 - 4;
          if (top < 0) {
            self.elExpand.style.top = 0 + "px";
            self.elExpand.classList.remove(`${classArrowDropdown}--Up`);
            self.elExpand.classList.remove(`${classArrowDropdown}--Down`);
          } else {
            self.elExpand.style.top =
              rectButton.top - rectExpand.height - 4 - 4 + "px";
            self.elExpand.classList.remove(`${classArrowDropdown}--Up`);
            self.elExpand.classList.add(`${classArrowDropdown}--Down`);
          }
        }
      } else {
        self.elExpand.style.top = rectButton.bottom + 4 + "px";
        self.elExpand.style.left = rectButton.left + "px";
      }
      self.elExpand.style.minWidth =
        (rectButton.width > self.minWidthExpand
          ? rectButton.width
          : self.minWidthExpand) + "px";
    }
  }

  destroy(){
    let self = this;
    self.elButton?.remove();
    self.elExpand?.remove();
  }
}

export default Dropdown;
