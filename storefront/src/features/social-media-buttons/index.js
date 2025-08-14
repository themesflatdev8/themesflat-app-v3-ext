import api from "@/api";
import { FEATURE_TYPE_SOCIAL_MEDIA_BUTTONS } from "@/constants/features";
import { getVariablesStyleSocialMediaButtons } from "@/shared/variables-style";
import { getImgFromServer } from "@/utils/cdn";

export default class SocialMediaButtons {
  constructor(payload) {
    this.payload = payload;
    this.init();
  }

  async init() {
    const self = this;
    const params = {
      shopify_domain: self.payload.shop,
      // product_id: window.shopifyMSell?.product?.id,
      type: FEATURE_TYPE_SOCIAL_MEDIA_BUTTONS,
      // mode:
      //   typeof window.shopifyMSell != "undefined"
      //     ? window.shopifyMSell.modeVolume || `${Date.now()}`
      //     : `${Date.now()}`,
    };

    const res = await api.getFeature(params);

    if (!res?.data?.visibility) {
      return;
    }
    if (!res?.data?.desktop?.visibility && !res?.data?.mobile?.visibility) {
      return;
    }
    const { data } = res;
    this.renderHtml({ data });
  }

  renderHtml({ data }) {
    const styles = getVariablesStyleSocialMediaButtons(data);
    const htmlRender =
      /* HTML */
      `<div
        class="Msell-Social-Media-Buttons"
        data-style-desktop="${data.desktop?.style}"
        data-style-mobile="${data.mobile?.style}"
        style="${styles}"
      >
        ${data.socials
    .map((item) => {
      if (!item?.link) return "";
      const imgLink = `${getImgFromServer("icons/socials", `${item.id}-icon.jpg`)}`;
      let link = item.link;
      if (!link.match(/^https?:\/\//i)) {
        link = "https://" + link;
      }

      return /* HTML */ `
        <a
          class="Msell-Social-Media-Buttons__Item"
          target="_blank"
          href="${link}"
        >
          <img src="${imgLink}" alt="${item.label}" />
        </a>
      `;
    })
    .join("")}
      </div>`;
    document.body.insertAdjacentHTML("beforeend", htmlRender);
  }
}
