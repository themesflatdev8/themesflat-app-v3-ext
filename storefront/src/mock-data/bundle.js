import {
  _product1,
  _product2,
  _product3,
  _product4,
  _product5,
} from "./product";

export const _dataFake = {
  bundle: {
    name: "Oke",
    status: 1,
    type: "specific",
    list_default_ids: [],
    mode: "manual",
    product: _product1,
    list_commendations: [
      _product2,
      _product3,
      _product4,
      _product5,
      _product2,
      _product3,
      _product4,
      _product3,
      _product4,
    ],
    maxProduct: 10,
    selectable: 1,
    useDiscount: 1,
    minimumAmount: 1000,
    promotionType: "discount", //freeship
    discountType: "percent", // percent/amount
    discountValue: "",
    discountContent: "Buy {minimum_bundle_amount} to get {discount_value} OFF",
    discountOncePer: 1,
    discountFreeshipType: "free",
    discountFreeshipContent:
      "Buy {minimum_bundle_amount} to get free shipping fee",
    discountFreeshipValue: "",
    discountOncePer: 1,
    countdownTimerActive: true,
    countdownTimerValue: 30,
    countdownTimerSession: 1,
    countdownTimerReaches: 25,
    templateDesktop: "4",
    templateMobile: "4",
  },
  settings: {
    visibility: true,
    themeOne: {
      themeName: "Template Slider",
      template: "1", // 1: slider, 2: classic, 3: amazon
      title: "Frequently Bought Together",
      subTitle: "",
      contentTotal: "Total price",
      contentSave: "Save",
      contentAddToCartButton: "Add to cart",
      useQuantity: false,
      cardBackgroundColor: "#FFFFFF",
      primaryColor: "#1e1212",
      secondaryColor: "#FFFFFF",
      borderColor: "#0000000d",
      outstandColor: "#fc3f15",
      borderRadius: 8,
      imageFit: "contain", // cover
    },
    themeTwo: {
      themeName: "Template Classic",
      template: "2", // 1: slider, 2: classic, 3: amazon
      title: "Frequently Bought Together",
      subTitle: "",
      contentTotal: "Total price",
      contentSave: "Save",
      contentAddToCartButton: "Add to cart",
      useQuantity: false,
      cardBackgroundColor: "#FFFFFF",
      primaryColor: "#1e1212",
      secondaryColor: "#FFFFFF",
      borderColor: "#0000000d",
      outstandColor: "#fc3f15",
      borderRadius: 8,
      imageFit: "contain", // cover
    },
    themeThree: {
      themeName: "Template Amazon",
      template: "3", // 1: slider, 2: classic, 3: amazon
      title: "Frequently Bought Together",
      subTitle: "",
      contentTotal: "Total price",
      contentSave: "Save",
      contentAddToCartButton: "Add to cart",
      useQuantity: false,
      cardBackgroundColor: "#FFFFFF",
      primaryColor: "#1e1212",
      secondaryColor: "#FFFFFF",
      borderColor: "#0000000d",
      outstandColor: "#fc3f15",
      borderRadius: 8,
      imageFit: "contain", // cover
    },
  },
};
