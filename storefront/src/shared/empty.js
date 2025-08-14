import viewDemo from "@/views/components/empty/demo.handlebars";
import { APP_URL } from "@/config/env";

export function handleEmpty(designMode = false) {
  if (designMode) {
    loadDemoInEditor();
  } else {
    let arr = document.getElementsByClassName("Msell-Bundle");
    arr &&
      arr.length > 0 &&
      Array.from(arr, (item) => {
        item.style.display = "none";
      });
  }
}

function loadDemoInEditor() {
  let arr = document.getElementsByClassName("Msell-Bundle");
  Array.from(arr, (item, index) => {
    item.insertAdjacentHTML("beforeend", viewDemo({ APP_URL }));
  });
}
