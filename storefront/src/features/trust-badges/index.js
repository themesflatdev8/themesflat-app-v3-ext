import api from "@/api";
import { 
  FEATURE_TYPE_TRUST_BADGES
} from "@/constants/features";
import {
  getVariablesStyleTrustBadges
} from "@/shared/variables-style";
import { getImgFromServer } from "@/utils/cdn";

export default class TrustBadges {

  constructor(payload) {
    this.payload = payload;
    this.el = document.querySelector(".Msell-Trust-Badge-Block");
    if(this.el){
      this.init();
    }
  }

  async init() {
    const self = this;
    const params = {
      shopify_domain: self.payload.shop,
      // product_id: window.shopifyMSell?.product?.id,
      type: FEATURE_TYPE_TRUST_BADGES,
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
    this.renderHtml({el: this.el, data});
  }

  renderHtml({el, data}){
    const styles = getVariablesStyleTrustBadges(data);
    el.insertAdjacentHTML("beforeend", `
      <div class="Msell-Trust-Badge"  data-template="${data.template}" style="${styles}">
        <h2>${data.heading || ""}</h2>
        <div class="Msell-Trust-Badge__List">
          ${data.icons.map((item) => {
    return `<div class="Msell-Trust-Badge__Item">
      <img
        src="${getImgFromServer("icons/trust", item)}"
        alt=""
      />
    </div>`;
  }).join("")}
        </div>
      </div>  
    `);
  }
}