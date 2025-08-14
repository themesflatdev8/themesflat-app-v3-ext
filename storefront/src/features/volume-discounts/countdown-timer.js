import {
  getLocalStorageNotExpire,
  setLocalStorageNotExpire,
} from "@/utils/storage";
import { STORAGE_VOLUME_DISCOUNT_COUNTDOWN_TIMER } from "@/constants/storage";

export function mergeCountdownTimer({ productId = 0, offer }) {
  if (offer.countdownTimerActive) {
    let objStorage = getLocalStorageNotExpire(
      STORAGE_VOLUME_DISCOUNT_COUNTDOWN_TIMER,
    );
    let objProduct = objStorage ? objStorage[productId] : null;
    let timeValue = offer.countdownTimerValue * 60 * 1000;
    let isNewTimer = false;
    let timerActive = true;
    if (objProduct) {
      let expirationDate = new Date(objProduct.end);
      if (expirationDate > new Date()) {
        timeValue = Math.floor(expirationDate - new Date());
      } else if (
        new Date() > new Date(objProduct.sessionEnd) ||
        offer.countdownTimerValue != objProduct.value ||
        offer.countdownTimerSession != objProduct.session
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
              ((offer.countdownTimerSession || 0) +
                (offer.countdownTimerValue || 0)), // time hết session
          session: offer.countdownTimerSession,
          value: offer.countdownTimerValue, // Số phút trong setting
        },
      };
      setLocalStorageNotExpire(
        STORAGE_VOLUME_DISCOUNT_COUNTDOWN_TIMER,
        obj,
        8888888 * 100,
      );
    }
    let timerOffer = {
      time: (offer.countdownTimerValue || 0) * 60 * 1000,
      timeRemaining: Math.floor(timeValue), // tính bằng ms
      active: timerActive,
      percentWarning: offer.countdownTimerReaches,
    };
    return {
      useDiscount: timerActive,
      countdownTimer: timerOffer,
    };
  }
  return null;
}
