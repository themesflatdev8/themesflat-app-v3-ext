import {
  getLocalStorageNotExpire,
  setLocalStorageNotExpire,
} from "@/utils/storage";
import { STORAGE_BUNDLE_COUNTDOWN_TIMER } from "@/constants/storage";

export function mergeCountdownTimer({ productId = 0, bundle }) {
  if (bundle.countdownTimerActive) {
    let objStorage = getLocalStorageNotExpire(STORAGE_BUNDLE_COUNTDOWN_TIMER);
    let objProduct = objStorage ? objStorage[productId] : null;
    let timeValue = bundle.countdownTimerValue * 60 * 1000;
    let isNewTimer = false;
    let timerActive = true;
    if (objProduct) {
      let expirationDate = new Date(objProduct.end);
      if (expirationDate > new Date()) {
        timeValue = Math.floor(expirationDate - new Date());
      } else if (
        new Date() > new Date(objProduct.sessionEnd) ||
        bundle.countdownTimerValue != objProduct.value ||
        bundle.countdownTimerSession != objProduct.session
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
              ((bundle.countdownTimerSession || 0) +
                (bundle.countdownTimerValue || 0)), // time hết session
          session: bundle.countdownTimerSession,
          value: bundle.countdownTimerValue, // Số phút trong setting
        },
      };
      setLocalStorageNotExpire(
        STORAGE_BUNDLE_COUNTDOWN_TIMER,
        obj,
        8888888 * 100,
      );
    }
    let timerBundle = {
      time: (bundle.countdownTimerValue || 0) * 60 * 1000,
      timeRemaining: Math.floor(timeValue), // tính bằng ms
      active: timerActive,
      percentWarning: bundle.countdownTimerReaches,
    };
    return {
      useDiscount: timerActive,
      countdownTimer: timerBundle,
    };
  }
  return null;
}
