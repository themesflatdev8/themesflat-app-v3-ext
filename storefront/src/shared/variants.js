import { _listCurrencySupportShopify } from "@/config/currency";
import { getButtonAddToCart, getButtonBuyNow } from "@/shared/dom";

export function fetchVariants() {
  let obj = {
    themeName: "",
    themeSelector: {
      id: "",
      name: "",
      selector_cart_page: "#main-cart-footer",
      position_cart_page: "beforeend",
      style_cart_page: "",
      selector_cart_drawer: "#CartDrawer cart-drawer-items",
      position_cart_drawer: "beforeend",
      style_cart_drawer: "",
      selector_button_cart_drawer: "#cart-icon-bubble",
      selector_wrap_cart_drawer: "#CartDrawer",
    },
    pageType: window.shopifyMSell.pageType,
    product: window.shopifyMSell.product,
  };
  obj.shop = window?.Shopify.shop;
  obj.country = window?.Shopify.country;
  obj.designMode = !!window?.Shopify.designMode;
  obj.originUrl = location.origin;
  obj.currency = {
    ...obj.currency,
    rate: !isNaN(window?.Shopify.currency.rate)
      ? Number(window.Shopify.currency.rate)
      : 1,
    fee: 0, // 2
  };
  obj.themeName =
    typeof Shopify != "undefined" &&
    window.Shopify.theme &&
    window.Shopify.theme.schema_name
      ? window.Shopify.theme.schema_name
      : "";
  let currencySupportShopify =
    _listCurrencySupportShopify[window?.Shopify.currency.active];
  if (currencySupportShopify) {
    obj.currency = {
      ...obj.currency,
      ...currencySupportShopify,
      display_type: currencySupportShopify.display_type || undefined,
      display_decimal: currencySupportShopify.display_type
        ? currencySupportShopify.display_type.includes(",")
          ? "."
          : ","
        : ".",
    };
  }
  if (typeof window.shopifyMSell != "undefined") {
    obj.currency = {
      ...obj.currency,
      ...window.shopifyMSell.currency,
      format:
        window.shopifyMSell.currencyCodeEnabled == "true" ||
        window.shopifyMSell.currencyCodeEnabled == "1"
          ? window.shopifyMSell.moneyWithCurrencyFormatShopify
          : window.shopifyMSell.moneyFormatShopify,
    };
    obj.cartType = window.shopifyMSell.cartType;
  }
  if (window.shopifyMSell.pageType == "product") {
    let btnCart = getButtonAddToCart();
    obj.elForm = btnCart?.closest("form");
    obj.btnAddToCart = btnCart;
    obj.btnBuyNow = getButtonBuyNow();
  }
  return obj;
}
