import "@/utils/hbs";
import { loadScript } from "@/shared/load-script";
import { loadStylesheet } from "@/shared/load-css";
import SwiperComponent from "@/components/swiper";
import CountdownTimerComponent from "@/components/countdown-timer";
import TrustBadges from "@/features/trust-badges";
import TrustBadgesOnCart from "@/features/trust-badges/cart";
import PaymentBadges from "@/features/payment-badges";
import PaymentBadgesOnCart from "@/features/payment-badges/cart";
import SocialMediaButtons from "@/features/social-media-buttons";
import CountdownTimerBar from "@/features/countdown-timer-bar";
import CountdownTimerBarOnCart from "@/features/countdown-timer-bar/cart";
import StockCountdown from "@/features/stock-countdown";
import { fetchVariants } from "@/shared/variants";
import { CART_DRAWER } from "@/constants/cart";

let countLoadFunction = 0;

(async function () {
  refetchInit();
})();

function refetchInit() {
  if (typeof window.shopifyMSell == "undefined") {
    if (countLoadFunction <= 30) {
      setTimeout(() => {
        refetchInit();
        countLoadFunction += 1;
      }, 100);
    }
  } else {
    init();
  }
}

async function init() {
  let variants = fetchVariants();
  let isEmbed = 
    typeof window.shopifyMSellAppEmbed != "undefined" &&
    window.shopifyMSellAppEmbed;
  let isBundle =
    (typeof window.shopifyMSellTrustBadge != "undefined" &&
      window.shopifyMSellAppEmbed) ||
    (typeof window.shopifyMSellProductBundle != "undefined" &&
      window.shopifyMSellProductBundle);
  let isVolumeDiscount =
    isEmbed &&
    window.shopifyMSell.pageType == "product";
  let isTrustBadge = 
    typeof window.shopifyMSellTrustBadge != "undefined" &&
    window.shopifyMSellTrustBadge;
  let isPaymentBadge = 
    typeof window.shopifyMSellPaymentBadge != "undefined" &&
    window.shopifyMSellPaymentBadge;
  let isCountdownTimerBar = 
    typeof window.shopifyMSellCountdownTimerBar != "undefined" &&
    window.shopifyMSellCountdownTimerBar;
  let isStockCountdown = 
    typeof window.shopifyMSellStockCountdown != "undefined" &&
    window.shopifyMSellStockCountdown;

  addCustomElements();

  loadScript({ isBundle, isVolumeDiscount });
  loadStylesheet({ isBundle, isVolumeDiscount });

  if(isTrustBadge){
    new TrustBadges(variants);
  }
  if(isPaymentBadge){
    new PaymentBadges(variants);
  }
  if(isCountdownTimerBar){
    new CountdownTimerBar(variants);
  }
  if(isStockCountdown){
    new StockCountdown(variants);
  }
  if(isEmbed && variants.cartType == CART_DRAWER){
    new TrustBadgesOnCart(variants);
    new PaymentBadgesOnCart(variants);
    new CountdownTimerBarOnCart(variants);
  }
  if(isEmbed){
    new SocialMediaButtons(variants);
  }
}

function addCustomElements() {
  customElements.define("msell-swiper", SwiperComponent);
  customElements.define("msell-countdown-timer", CountdownTimerComponent);
}
