export default class VariantRadios {

  constructor(payload) {
    const variant = payload.variantDefault || payload.variants[0];
    let options = this.getOptions(variant);
    this.el = payload.el;
    this.elProduct = payload.elProduct;
    this.cbChange = payload.cbChange || null;
    this.variantData = [];
    this.optionData = [];
    this.currentVariant = null;
    this.currentOptions = [];
    this.setOptionData(payload.options);
    this.setVariantData(payload.variants);
    this.setCurrentVariant(variant);
    this.setCurrentOptions(options);

    this.updateOptionChecked();
    this.updateVariantStatuses();

    this.el.addEventListener("change", this.onVariantChange.bind(this));
  }

  updateInit({ variant, options }) {
    variant && this.setCurrentVariant(variant);
    options && this.setCurrentOptions(options);
    this.updateOptionChecked();
    this.updateVariantStatuses();
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.updateVariantStatuses();
    this.cbChange && this.cbChange();
  }

  updateOptionChecked() {
    const fieldsets = Array.from(this.el.querySelectorAll("fieldset"));
    fieldsets.map((fieldset, index) => {
      Array.from(fieldset.querySelectorAll("input[type='radio']")).map(
        (radio) => {
          if (radio.value == this.getCurrentOptions()[index]) {
            radio.checked = true;
          } else {
            radio.checked = false;
          }
          let isVariant = this.getVariantData().some(
            (item) => item.option1 == radio.value,
          );
          if (!isVariant) {
            radio.setAttribute("disabled", "");
          }
        },
      );
    });
  }

  updateOptions() {
    const fieldsets = Array.from(this.el.querySelectorAll("fieldset"));
    const currentOptions = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll("input[type='radio']")).find(
        (radio) => radio.checked,
      ).value;
    });
    this.setCurrentOptions(currentOptions);
  }

  updateMasterId() {
    const currentVariant = this.getVariantData().find((variant) => {
      return !this.getOptions(variant)
        .map((option, index) => {
          return this.getCurrentOptions()[index] === option;
        })
        .includes(false);
    });
    if (currentVariant) {
      this.setCurrentVariant(currentVariant);
    } else {
      const firstOptionSelected = this.el.querySelector(
        "input:checked:not(disabled)",
      )?.value;
      let selectedOptionOneVariants = this.getVariantData().filter(
        (variant) => firstOptionSelected === variant.option1,
      );
      if (selectedOptionOneVariants.length > 0) {
        this.setCurrentVariant(selectedOptionOneVariants[0]);
        this.setCurrentOptions(this.getOptions(selectedOptionOneVariants[0]));
        this.updateOptionChecked();
      }
    }
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.getVariantData().filter(
      (variant) =>
        this.el.querySelector("input:checked:not(disabled)")?.value ===
        variant.option1,
    );
    const inputWrappers = [...this.el.querySelectorAll("fieldset")];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [...option.querySelectorAll('input[type="radio"]')];
      const previousOptionSelected = inputWrappers[index - 1].querySelector(
        "input:checked:not(disabled)",
      )?.value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) => variant[`option${index}`] === previousOptionSelected,
        )
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        input.removeAttribute("disabled");
      } else {
        input.setAttribute("disabled", "");
      }
    });
  }

  getOptions(variant) {
    let result = [];
    for (let i = 1; i <= 10; i++) {
      let option = variant[`option${i}`];
      if (option) {
        result.push(option);
      } else {
        break;
      }
    }
    return result;
  }

  setVariantData(value) {
    this.variantData = value;
  }

  getVariantData() {
    return this.variantData;
  }

  setOptionData(value) {
    this.optionData = value;
  }

  getOptionData() {
    return this.optionData;
  }

  getCurrentVariant() {
    return this.currentVariant;
  }

  setCurrentVariant(value) {
    this.currentVariant = value;
  }

  getCurrentOptions() {
    return this.currentOptions;
  }

  setCurrentOptions(value) {
    this.currentOptions = value;
  }
}
