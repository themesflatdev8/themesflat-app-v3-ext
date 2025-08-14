export const addCusEventListener = function (selector, event, handler) {
  let rootElement = document.querySelector("body");
  //since the root element is set to be body for our current dealings
  rootElement.addEventListener(
    event,
    function (evt) {
      var targetElement = evt.target;
      while (targetElement != null) {
        if (targetElement.matches(selector)) {
          handler(evt);
          return;
        }
        targetElement = targetElement.parentElement;
      }
    },
    true,
  );
};

export const bindEvent = function (element, eventName, eventHandler) {
  if (element.addEventListener) {
    element.addEventListener(eventName, eventHandler, false);
  } else if (element.attachEvent) {
    element.attachEvent("on" + eventName, eventHandler);
  }
};

// Send a message to the child iframe
export const sendMessageToChildFrame = function (iframeEl, msg) {
  // Make sure you are sending a string, and to stringify JSON
  iframeEl.contentWindow.postMessage(msg, "*");
};

// Send a message to the parent
export const sendMessageToParent = function (msg) {
  // Make sure you are sending a string, and to stringify JSON
  // window.parent.postMessage(msg, `${config.domain_name}`);
  // let url = new URL(document.referrer);
  // let target = url.protocol + "//" + url.host;
  window.parent.postMessage(msg, "*");
};
