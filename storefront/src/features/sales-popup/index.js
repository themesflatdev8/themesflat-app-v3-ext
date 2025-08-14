import api from "@/api";
import { FEATURE_TYPE_SALES_POPUP } from "@/constants/features";
import { getVariablesStyleSalesPopup } from "@/shared/variables-style";
import viewCloseIcon from "@/views/icons/cancel.handlebars";
import { timeAgo } from "@/utils/time";

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
      type: FEATURE_TYPE_SALES_POPUP,
      // mode:
      //   typeof window.shopifyMSell != "undefined"
      //     ? window.shopifyMSell.modeVolume || `${Date.now()}`
      //     : `${Date.now()}`,
    };

    const res = await api.getFeature(params);

    if (!res?.data?.visibility) {
      return;
    }
    const resOrders = await api.getOrders(params);
    const { data } = res;

    const orderRandom = resOrders?.data?.[0];
		if (!orderRandom) {
			return false;
		}
    //Check show
		const { specificPages, placement, timingFirst, timingDelay, mobile, desktop } = data;
    if (!mobile?.visibility && !desktop?.visibility) {
			return false;
		}
    if (
			placement === 'all' ||
			(placement === 'specific' && specificPages.some((x) => this.payload.pageType.includes(x)))
		) {
			try {
				if (this.interval) {
					clearInterval(this.interval);
					this.interval = null;
				}

				if (this.firstTime) {
					this.timeout = setTimeout(() => {
						this.renderHtml({ data, order: orderRandom });
					}, timingFirst * 1000);
				} else {
					this.timeout = setTimeout(() => {
						this.renderHtml({ data, order: orderRandom});
					}, timingDelay * 1000);
				}
			} catch {
        // code
      }
		}
  }

  renderHtml({ data, order }) {
    const styles = getVariablesStyleSalesPopup(data);
    const {
			createdAt,
			city,
			customer_full_name,
			customer_last_name,
			customer_first_name,
			lineItems,
			country_code
		} = order;
		const random = Math.floor(Math.random() * lineItems.length);
		const randomLineItems = lineItems[random];

		const timeAgoData =timeAgo(createdAt)
		const { text, timingDuration, desktop, mobile } = data;
		const positionDesktop = desktop.position;
		const positionMobile = mobile.position;
		const indexFromProduct = text.indexOf('{product_name}');
		const headText = text.slice(0, indexFromProduct);
		const headTextData = headText
			.replaceAll('{customer_full_name}', customer_full_name)
			.replaceAll('{customer_first_name}', customer_first_name)
			.replaceAll('{customer_last_name}', customer_last_name)
			.replaceAll('{city}', city)
			.replaceAll('{country_code}', country_code);
		const checkProduct = text.includes('{product_name}');
		const productName = checkProduct ? randomLineItems?.title : '';
		const checkTime = text?.includes('{time_ago}');
		const timeData = checkTime ? timeAgoData : '';
		//Handle link product
		const { product } = randomLineItems;
		const onlineStoreUrl = product?.onlineStoreUrl;
		const handle = product?.handle;
		const link = onlineStoreUrl ? onlineStoreUrl : `https://${this.payload.shop}/products/${handle}`;

		//Render
		const htmlRender =
			/* HTML */
			`<div
        class="Msell-Sales-Popup"
        data-show-mobile="${mobile.visibility}"
        data-show-desktop="${desktop.visibility}"
        style="${styles}"
      >
        <img src="${randomLineItems.image?.url}" alt="${product?.name}" />
        <div class="Msell-Sales-Popup__Content">
          <div class="Msell-Sales-Popup__Info">
            <div class="Msell-Sales-Popup__Product">
              <span class="Msell-Sales-Popup__Text">${headTextData}</span>
              <a href="${link}" class="Msell-Sales-Popup__Product-Name"> ${productName} </a>
            </div>
            <span class="Msell-Sales-Popup__Time">
              ${timeData}
            </span>
          </div>
          <div class="Msell-Sales-Popup__Close" id="closeSalesPopup">${viewCloseIcon}</div>
        </div>
      </div>`;
    document.body.innerHTML("beforeend", htmlRender)
    let elSalesPopup = document.querySelector(".Msell-Sales-Popup");

		this.intervalAnimation = setInterval(() => {
			const windowWidth = window.innerWidth;
			const desktop = windowWidth > 768;
			if (desktop) {
				elSalesPopup.style.animation = `${
					positionDesktop.includes('bottom')
						? 'msellCloseSalePopUpBottom 1s forwards'
						: 'msellCloseSalePopUpTop 1s forwards'
				}`;
			} else {
				elSalesPopup.style.animation = `${
					positionMobile.includes('bottom')
						? 'msellCloseSalePopUpBottom 1s forwards'
						: 'msellCloseSalePopUpTop 1s forwards'
				}`;
			}
		}, timingDuration * 1000);

		this.interval = setInterval(() => {
			this.firstTime = false;
			this.timeout = null;
			this.intervalAnimation = null;
			clearTimeout(this.timeout);
			this.render();
		}, timingDuration * 1000 + 1000);

		const closeSalesPopup = elSalesPopup?.querySelector('.Msell-Sales-Popup__Close');
		closeSalesPopup?.addEventListener('click', (e) => {
			e.preventDefault();
      elSalesPopup?.remove();
			sessionStorage.setItem('sales_pop_up_opened', 'false');
			clearTimeout(this.timeout);
			clearInterval(this.interval);
			this.timeout = null;
			this.interval = null;
		});
  }
}
