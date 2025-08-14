import {
  getLocalStorageNotExpire,
  setLocalStorageNotExpire,
} from "@/utils/storage";

export function getCountdownTimer({ productId = 0, settings, keyStorage = "" }) {
  let objStorage = getLocalStorageNotExpire(keyStorage);
  let objProduct = objStorage ? objStorage[productId] : null;
  let timeValue = (settings.timer || 0) * 60 * 1000;
  let isNewTimer = false;
  let timerActive = true;
  if (objProduct) {
    let expirationDate = new Date(objProduct.end);
    if (expirationDate > new Date()) {
      timeValue = Math.floor(expirationDate - new Date());
    } else if (
      (new Date() > new Date(objProduct.sessionEnd) && settings.timerType != "hide") ||
      settings.timerType != objProduct.type ||
      settings.timer != objProduct.value ||
      settings.timerSession != objProduct.session
    ) {
      isNewTimer = true;
    } else {
      timerActive = false;
    }
  } else {
    isNewTimer = true;
  }
  if (isNewTimer) {
    let obj = {
      ...objStorage,
      [productId]: {
        // timeStart: new Date().getTime(), // time run start
        end: new Date().getTime() + timeValue, // time run end
        sessionEnd:
          new Date().getTime() +
          1000 *
            60 *
            ((settings.timerSession || 0) +
              (settings.timer || 0)), // time hết session
        session: settings.timerSession,
        value: settings.timer, // Số phút trong setting
        type: settings.timerType,
      },
    };
    setLocalStorageNotExpire(
      keyStorage,
      obj,
      8888888 * 100,
    );
  }
  return {
    active: timerActive,
    time: (settings.timer || 0) * 60 * 1000,
    timeRemaining: Math.floor(timeValue), // tính bằng ms
  };
}
