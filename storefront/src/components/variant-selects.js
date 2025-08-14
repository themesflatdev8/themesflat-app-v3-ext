export class VariantSelects {
  el = null;
  variantData = [];
  optionData = [];
  currentVariant = null;
  currentOptions = [];

  constructor(payload) {
    this.el = payload.el;
    this.setOptionData(payload.options);
    this.setVariantData(payload.variants);
    this.el.addEventListener("change", this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.updateVariantStatuses();
  }

  updateOptions() {
    this.currentOptions = Array.from(
      this.el.querySelectorAll("select"),
      (select) => select.value,
    );
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        ?.map((option, index) => {
          return this.currentOptions[index] === option;
        })
        .includes(false);
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.el.querySelector(":checked").value === variant.option1,
    );
    const inputWrappers = [...this.el.querySelectorAll("fieldset")];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [
        ...option.querySelectorAll('input[type="radio"], option'),
      ];
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(":checked").value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant[`option${index}`] === previousOptionSelected,
        )
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        input.innerText = input.getAttribute("value");
      } else {
        input.innerText = window.variantStrings.unavailable_with_option.replace(
          "[value]",
          input.getAttribute("value"),
        );
      }
    });
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
}
