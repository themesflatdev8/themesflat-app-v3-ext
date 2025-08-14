export default class QuantityInput {

  constructor(payload) {
    this.el = payload.el;
    this.input = payload.elInput;
    this.changeEvent = new Event("change", { bubbles: true });
    this.cbChange = payload.cbChange || null;

    this.input.addEventListener("change", this.onInputChange.bind(this));
    this.input.addEventListener("blur", this.onInputChange.bind(this));
    this.btnMinus = payload.elBtnMinus;
    this.btnPlus = payload.elBtnPlus;
    this.btnMinus &&
      this.btnMinus.addEventListener("click", this.onButtonClick.bind(this));
    this.btnPlus &&
      this.btnPlus.addEventListener("click", this.onButtonClick.bind(this));
  }

  get value() {
    if (isNaN(this.input.value)) {
      return 1;
    }
    return this.input.value;
  }

  set value(val) {
    this.input.value = val;
  }

  onInputChange(event) {
    event.preventDefault();
    event.stopPropagation();
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const previousValue = this.input.value;

    event.target.name === "plus" ? this.input.stepUp() : this.input.stepDown();
    this.cbChange && this.cbChange({ value: this.value });
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }

  validateQtyRules(data = {}) {
    const { isChange = true } = data;
    const value = parseInt(this.input.value);
    if (isNaN(value)) {
      this.input.value = 1;
    } else {
      if (this.input.min) {
        const min = parseInt(this.input.min);
        if (value <= min) {
          this.btnMinus.setAttribute("disabled", "");
        } else {
          this.btnMinus.removeAttribute("disabled");
        }
        if (value < min) {
          this.input.value = min;
        }
      }
      if (this.input.max) {
        const max = parseInt(this.input.max);
        if (value >= max) {
          this.btnPlus.setAttribute("disabled", "");
        } else {
          this.btnPlus.removeAttribute("disabled");
        }
        if (value > max) {
          this.input.value = max;
        }
      }
    }
    isChange && this.cbChange && this.cbChange({ value: this.value });
  }
}
