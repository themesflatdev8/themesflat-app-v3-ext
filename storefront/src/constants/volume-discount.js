export const _volumeDiscountDefault = {
  name: "",
  productId: "",
  status: 1,
  mostPopularActive: 1,
  mostPopularPosition: "1",
  tiers: [
    {
      name: "Single",
      quantity: "1",
      message: "Buy {quantity} and get a {discount_value} OFF",
      useDiscount: 1,
      discountType: "percent", // percent/amount
      discountValue: "",
    },
  ],
  countdownTimerActive: 0,
  countdownTimerValue: 30,
  countdownTimerSession: 15,
  countdownTimerReaches: 25,
};

export const _settingsDefault = {
  visibility: true,
  title: "Buy More, Save More!",
  contentMostPopular: "Most popular",
  contentChooseVariantTitle: "Choose variant",
  contentChooseVariantButton: "Choose variant",
  contentAddToCartButton: "Add to cart",
  position: "above", // below
  override: true,
  cardBackgroundColor: "#FFFFFF",
  primaryColor: "#1e1212",
  secondaryColor: "#FFFFFF",
  borderColor: "#0000000d",
  outstandColor: "#fc3f15",
  borderRadius: 8,
};
