import api from "@/api";
import { 
  FEATURE_TYPE_COUNTDOWN_TIMER_BAR
} from "@/constants/features";
import { STORAGE_COUNTDOWN_TIMER_BAR } from "@/constants/storage";
import {
  getVariablesStyleCountdownTimerBar
} from "@/shared/variables-style";
import viewClockIcon from "@/views/icons/clock.handlebars";
import viewWatchIcon from "@/views/icons/watch.handlebars";
import { getCountdownTimer } from "@/features/countdown-timer-bar/countdown-timer";

export default class CountdownTimerBar {

  constructor(payload) {
    this.payload = payload;
    this.el = document.querySelector(".Msell-Countdown-Timer-Bar-Block");
    if(this.el){
      this.init();
    }
  }

  async init() {
    const self = this;
    const params = {
      shopify_domain: self.payload.shop,
      // product_id: window.shopifyMSell?.product?.id,
      type: FEATURE_TYPE_COUNTDOWN_TIMER_BAR,
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
    let timerObj = getCountdownTimer({ 
      productId: self.payload?.product?.id, 
      settings: data, 
      keyStorage: STORAGE_COUNTDOWN_TIMER_BAR 
    });
    if(timerObj?.active){
      this.renderHtml({el: this.el, data, timer: timerObj});
      self.handleClock({ timer: timerObj });
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

    el.insertAdjacentHTML("beforeend", `
      <div class="Msell-Countdown-Timer-Bar" data-template="${data.template}" style="${styles}">
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