export const TYPE_SPECIFIC = "specific";
export const TYPE_COLLECTION = "collection";
export const TYPE_GENERAL = "general";

export const STRATEGY_AI = "ai";
export const STRATEGY_MANUAL_PICK = "manual";

export const PAGE_TYPE_PRODUCT = "product";
export const PAGE_TYPE_CART = "cart";
export const PAGE_TYPE_SEARCH = "search";

export const _bundleDefault = {
  name: "",
  status: 1,
  type: TYPE_SPECIFIC,
  list_default_ids: [],
  mode: STRATEGY_MANUAL_PICK,
  list_commendations: [],
  maxProduct: 10,
  selectable: 1,
  useDiscount: 0,
  minimumAmount: "",
  promotionType: "discount", //freeship
  discountType: "percent", // percent/amount
  discountValue: "",
  discountContent: "Buy {minimum_bundle_amount} to get {discount_value} OFF",
  discountOncePer: 1,
  discountFreeshipType: "free",
  discountFreeshipContent:
    "Buy {minimum_bundle_amount} to get free shipping fee",
  discountFreeshipValue: "",
  countdownTimerActive: 0,
  countdownTimerValue: 30,
  countdownTimerSession: 15,
  countdownTimerReaches: 25,
  templateDesktop: "1",
  templateMobile: "1",
};

export const _settingsDefault = {
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
};
