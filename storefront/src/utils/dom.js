export function noTranslateElement(e) {
  e.classList.add("notranslate");
  e.setAttribute("translate", "no");
}

export function removeNoTranslateElement(e) {
  e.classList.remove("notranslate");
  e.removeAttribute("translate");
}
