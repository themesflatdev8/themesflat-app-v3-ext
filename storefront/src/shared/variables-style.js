export function getVariablesStyleBundle(settings) {
  if (!settings) return "";
  return `
    --msell-card-background-color: ${settings.cardBackgroundColor};
    --msell-primary-color: ${settings.primaryColor};
    --msell-secondary-color: ${settings.secondaryColor};
    --msell-outstand-color: ${settings.outstandColor};
    --msell-border-radius: ${settings.borderRadius}px;
    --msell-border-color: ${settings.borderColor};
    --msell-image-fit: ${settings.imageFit};
  `;
}

export function getVariablesStyleOffer(settings) {
  if (!settings) return "";
  return `
    --msell-card-background-color: ${settings.cardBackgroundColor};
    --msell-primary-color: ${settings.primaryColor};
    --msell-secondary-color: ${settings.secondaryColor};
    --msell-outstand-color: ${settings.outstandColor};
    --msell-border-radius: ${settings.borderRadius}px;
    --msell-border-color: ${settings.borderColor};
  `;
}

export function getVariablesStyleTrustBadges(settings) {
  if (!settings) return "";
  return `
    --msell-trust-badge-background-color: ${settings.backgroundColor};
    --msell-trust-badge-border-color: ${settings.borderColor};
    --msell-trust-badge-text-color: ${settings.textColor};
    --msell-trust-badge-font-size: ${settings.headingSize};
    --msell-trust-badge-line-height: ${settings.headingSize * 1.2}px;
    --msell-trust-badge-width-desktop: ${settings.desktop.size}px;
    --msell-trust-badge-width-mobile: ${settings.mobile.size}px;
    --msell-trust-badge-height-desktop: ${settings.desktop.size}px;
    --msell-trust-badge-height-mobile: ${settings.mobile.size}px;
  `;
}

export function getVariablesStylePaymentBadges(settings) {
  if (!settings) return "";
  return `
    --msell-payment-badge-background-color: ${settings.backgroundColor};
    --msell-payment-badge-border-color: ${settings.borderColor};
    --msell-payment-badge-text-color: ${settings.textColor};
    --msell-payment-badge-font-size: ${settings.headingSize};
    --msell-payment-badge-line-height: ${settings.headingSize * 1.2}px;
    --msell-payment-badge-width-desktop: ${settings.desktop.size}px;
    --msell-payment-badge-width-mobile: ${settings.mobile.size}px;
    --msell-payment-badge-height-desktop: ${settings.desktop.size}px;
    --msell-payment-badge-height-mobile: ${settings.mobile.size}px;
  `;
}

export function getVariablesStyleSocialMediaButtons(settings) {
  if (!settings) return "";
  return `
    --msell-social-media-buttons-display-desktop: ${settings.desktop.visibility ? "flex" : "none"};
    --msell-social-media-buttons-display-mobile: ${settings.mobile.visibility ? "flex" : "none"};
    --msell-social-media-buttons-border-radius-desktop: ${settings.desktop.template == "circle" ? "100%" : "4px"};
    --msell-social-media-buttons-border-radius-mobile: ${settings.mobile.template == "circle" ? "100%" : "4px"};
    --msell-social-media-buttons-width-desktop: ${settings.desktop.size}px;
    --msell-social-media-buttons-width-mobile: ${settings.mobile.size}px;
    --msell-social-media-buttons-height-desktop: ${settings.desktop.size}px;
    --msell-social-media-buttons-height-mobile: ${settings.mobile.size}px;
    --msell-social-media-buttons-left-desktop: ${settings.desktop.position == "bottom_left" ? `${settings.desktop.positionLeft}px` : "unset"};
    --msell-social-media-buttons-right-desktop: ${settings.desktop.position == "bottom_left" ? "unset" : `${settings.desktop.positionRight}px`};
    --msell-social-media-buttons-bottom-desktop: ${settings.desktop.positionBottom}px;
    --msell-social-media-buttons-left-mobile: ${settings.mobile.position == "bottom_left" ? `${settings.mobile.positionLeft}px` : "unset"};
    --msell-social-media-buttons-right-mobile: ${settings.mobile.position == "bottom_left" ? "unset" : `${settings.mobile.positionRight}px`};
    --msell-social-media-buttons-bottom-mobile: ${settings.mobile.positionBottom}px;
  `;
}

export function getVariablesStyleSalesPopup(settings) {
  if (!settings) return "";
  return `
    --msell-sales-popup-background-color: ${settings.backgroundColor};
    --msell-sales-popup-border-color: ${settings.borderColor};
    --msell-sales-popup-text-color: ${settings.textColor};
    --msell-sales-popup-top: ${settings.desktop.positionTop}px;
    --msell-sales-popup-bottom: ${settings.desktop.positionBottom}px;
    --msell-sales-popup-left: ${settings.desktop.positionLeft}px;
    --msell-sales-popup-right: ${settings.desktop.positionRight}px;
  `;
}

export function getVariablesStyleCountdownTimerBar(settings) {
  if (!settings) return "";
  return `
    --msell-countdown-timer-bar-background-color: ${settings.backgroundColor};
    --msell-countdown-timer-bar-border-color: ${settings.borderColor};
    --msell-countdown-timer-bar-text-color: ${settings.textColor};
    --msell-countdown-timer-bar-timer-color: ${settings.timerColor};
  `;
}

export function getVariablesStyleStockCountdown(settings) {
  if (!settings) return "";
  return `
    --msell-stock-countdown-background-color: ${settings.backgroundColor};
    --msell-stock-countdown-border-color: ${settings.borderColor};
    --msell-stock-countdown-text-color: ${settings.textColor};
  `;
}
