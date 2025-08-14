export function loadScript({ isBundle, isVolumeDiscount }) {
  let scriptMain = document.querySelector(
    "script[src*='msell.js'], script[data-src*='msell.js']",
  );
  if (!scriptMain) return;
  let srcTemp =
    scriptMain.getAttribute("src") || scriptMain.getAttribute("data-src");
  if (isBundle) {
    let scriptExtra = document.createElement("script");
    scriptExtra.src = srcTemp?.replace("msell.js", "product-bundles.js");
    document.body.appendChild(scriptExtra);
  }
  if (isVolumeDiscount) {
    let scriptExtra = document.createElement("script");
    scriptExtra.src = srcTemp?.replace("msell.js", "volume-discounts.js");
    document.body.appendChild(scriptExtra);
  }
}
