import api from "@/api";
import { 
  FEATURE_TYPE_COUNTDOWN_TIMER_BAR_ON_CART
} from "@/constants/features";
import { STORAGE_COUNTDOWN_TIMER_BAR_ON_CART } from "@/constants/storage";
import {
  getVariablesStyleCountdownTimerBar
} from "@/shared/variables-style";
import viewClockIcon from "@/views/icons/clock.handlebars";
import viewWatchIcon from "@/views/icons/watch.handlebars";
import { getCountdownTimer } from "@/features/countdown-timer-bar/countdown-timer";

const selectorCart = "cart-drawer-items,cart-items-component";

export default class CountdownTimerBar {

  constructor(payload) {
    this.payload = payload;
    const el = document.querySelector(selectorCart);
    if(el){
      this.init();
    }
  }

  async init() {
    const self = this;
    const params = {
      shopify_domain: self.payload.shop,
      // product_id: window.shopifyMSell?.product?.id,
      type: FEATURE_TYPE_COUNTDOWN_TIMER_BAR_ON_CART,
      // mode:
      //   typeof window.shopifyMSell != "undefined"
      //     ? window.shopifyMSell.modeVolume || `${Date.now()}`
      //     : `${Date.now()}`,
    };

    const res = await api.getFeature(params);
    if (!res?.data?.visibility) {
      return;
    }
    const { data } = res;
    this.settings = data;
    self.load();
    self.detectCartChange();
  }

  load(){
    const self = this;
    let timerObj = getCountdownTimer({ 
      productId: self.payload?.product?.id, 
      settings: self.settings, 
      keyStorage: STORAGE_COUNTDOWN_TIMER_BAR_ON_CART 
    });
    if(timerObj?.active){
      this.el = document.querySelector(selectorCart);
      self.renderHtml({el: self.el, data: self.settings, timer: timerObj});
      self.handleClock({ timer: timerObj });
    }else{
      setTimeout(() => {
        self.cartObserver?.disconnect?.();
      }, 1200);
    }
  }

  getTimeRemaining(countdown) {
    const now = new Date();
    const diff = countdown - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
      diff,
      days,
      hours: `${hours}`.length <= 1 ? `0${hours}` : `${hours}`,
      minutes: `${minutes}`.length <= 1 ? `0${minutes}` : `${minutes}`,
      seconds: `${seconds}`.length <= 1 ? `0${seconds}` : `${seconds}`,
    };
  }

  handleClock({ timer }){
    const self = this;
    let elMinutes = this.el.querySelector(".Msell-Countdown-Timer-Bar__Minutes");
    let elSeconds = this.el.querySelector(".Msell-Countdown-Timer-Bar__Seconds");
    const countdown = new Date(Date.parse(new Date()) + timer.timeRemaining);
    if(elMinutes && elSeconds){
      self.updateClock({ countdown, elMinutes, elSeconds });
      self.timerInterval = setInterval(() => {
        self.updateClock({ countdown, elMinutes, elSeconds });
      }, 1000);
    }
  }

  updateClock({ countdown, elMinutes, elSeconds }) {
    const self = this;
    const obj = self.getTimeRemaining(countdown);
    elMinutes.innerText = obj.minutes;
    elSeconds.innerText = obj.seconds;
    if (obj.diff <= 0) {
      setTimeout(() => {
        self.el.remove();
      }, 2000);
      clearInterval(self.timerInterval);
    }
  }

  detectCartChange() {
    const self = this;
    let timerCartDrawer = null;
    self.cartObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const isValidRequestType = ["xmlhttprequest", "fetch"].includes(
          entry.initiatorType
        );
        const isCartChangeRequest = /\/cart\//.test(entry.name);
        if (isValidRequestType && isCartChangeRequest) {
          clearTimeout(timerCartDrawer);
          timerCartDrawer = setTimeout(async () => {
            self.load();
          }, 590);
        }
      });
    });
    self.cartObserver.observe({ entryTypes: ["resource"] });
  }

  renderHtmlTimer({ data }){
    return `<div class="Msell-Countdown-Timer-Bar__Box">
      <div class="Msell-Countdown-Timer-Bar__Rotor Msell-Countdown-Timer-Bar__Minutes">
        ${data.minutes}
      </div>
      <div class="Msell-Countdown-Timer-Bar__Separator">
      :
      </div>
      <div class="Msell-Countdown-Timer-Bar__Rotor Msell-Countdown-Timer-Bar__Seconds">
         ${data.seconds}
      </div>
    </div>`;
  }

  renderHtml({el, data, timer}){
    const styles = getVariablesStyleCountdownTimerBar(data);
    const countdown = new Date(Date.parse(new Date()) + timer.timeRemaining);

    el.insertAdjacentHTML(data.position == "bottom" ? "beforeend" : "afterbegin", `
      <div class="Msell-Countdown-Timer-Bar Msell-Countdown-Timer-Bar--Cart" data-template="${data.template}" style="${styles}">
        <div class="Msell-Countdown-Timer-Bar__Icon">
          ${data.template == "default" ? viewClockIcon() : viewWatchIcon()}
        </div>
        <div class="Msell-Countdown-Timer-Bar__Content" data-template="${data.template}">
          ${(data.text || "")?.replace("{timer}", this.renderHtmlTimer({ data: countdown }))}
        </div>
      </div>  
    `);
  }
}