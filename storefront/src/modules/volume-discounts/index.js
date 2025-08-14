import "@/utils/hbs";
import { fetchVariants } from "@/shared/variants";
import Offer from "@/features/volume-discounts";

export default class QuantityBreaks {
  constructor() {
    this.init();
  }

  init() {
    if (window.shopifyMSell.pageType == "product") {
      let variants = fetchVariants();
      new Offer(variants);
    }
  }
}
(async function () {
  new QuantityBreaks();
})();
