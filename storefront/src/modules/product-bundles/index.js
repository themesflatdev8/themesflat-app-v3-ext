import "@/utils/hbs";
import { fetchVariants } from "@/shared/variants";
import BundleCartPage from "@/features/product-bundles/cart";
import BundleProductPage from "@/features/product-bundles/product";

export default class Bundle {
  constructor() {
    this.init();
  }

  init() {
    let variants = fetchVariants();
    if (window.shopifyMSell.pageType == "product") {
      new BundleProductPage(variants);
    }

    new BundleCartPage(variants);
  }
}
(async function () {
  new Bundle();
})();
