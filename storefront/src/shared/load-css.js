export function loadStylesheet({ isBundle, isVolumeDiscount }) {
  let styleMain = document.querySelector(
    "link[href*='msell.css'], link[data-href*='msell.css']",
  );
  if (!styleMain) return;
  let head = document.getElementsByTagName("head")[0];
  if (isBundle) {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = styleMain
      .getAttribute("href")
      .replace("msell.css", "product-bundles.css");
    head.appendChild(link);
  }
  if (isVolumeDiscount) {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = styleMain
      .getAttribute("href")
      .replace("msell.css", "volume-discounts.css");
    head.appendChild(link);
  }
}
