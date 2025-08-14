export function loadStyle(content) {
  document.head.insertAdjacentHTML("beforeend", `<style>${content}</style>`);
}
