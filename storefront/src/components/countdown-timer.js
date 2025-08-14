import viewCountdownTimer from "@/views/components/countdown-timer/index.handlebars";

export default class CountdownTimerComponent extends HTMLElement {

  constructor() {
    super();
    this.timerInterval = null;
    this.elTimer = null;
    this.elDays = null;
    this.elHours = null;
    this.elDaysRotorFirst = null;
    this.elDaysRotorSecond = null;
    this.elHoursRotorFirst = null;
    this.elHoursRotorSecond = null;
    this.elMinutes = null;
    this.elMinutesRotorFirst = null;
    this.elMinutesRotorSecond = null;
    this.elSeconds = null;
    this.elSecondsRotorFirst = null;
    this.elSecondsRotorSecond = null;
    this.time = 0;
    this.timeRemaining = 0;
    this.percentWarning = 30;
    this.callbackOutOfTime = null;
  }

  init(payload) {
    const self = this;
    self.time = payload?.time || self.time;
    self.timeRemaining = payload?.timeRemaining || self.timeRemaining;
    self.percentWarning = payload?.percentWarning || self.percentWarning;
    self.callbackOutOfTime = payload.cb;
    self.insertAdjacentHTML("beforeend", viewCountdownTimer());
    const countdown = new Date(Date.parse(new Date()) + self.timeRemaining);

    self.elTimer = self.querySelector(".Msell-CountdownTimer");
    self.elDays = self.querySelector(".Msell-CountdownTimer-Days");
    self.elDaysRotorFirst = self.elDays?.querySelector(
      ".Msell-CountdownTimer-FlipCard:nth-child(1)",
    );
    self.elDaysRotorSecond = self.elDays?.querySelector(
      ".Msell-CountdownTimer-FlipCard:nth-child(2)",
    );
    self.elHours = self.querySelector(".Msell-CountdownTimer-Hours");
    self.elHoursRotorFirst = self.elHours?.querySelector(
      ".Msell-CountdownTimer-FlipCard:nth-child(1)",
    );
    self.elHoursRotorSecond = self.elHours?.querySelector(
      ".Msell-CountdownTimer-FlipCard:nth-child(2)",
    );
    self.elMinutes = self.querySelector(".Msell-CountdownTimer-Minutes");
    self.elMinutesRotorFirst = self.elMinutes?.querySelector(
      ".Msell-CountdownTimer-FlipCard:nth-child(1)",
    );
    self.elMinutesRotorSecond = self.elMinutes?.querySelector(
      ".Msell-CountdownTimer-FlipCard:nth-child(2)",
    );
    self.elSeconds = self.querySelector(".Msell-CountdownTimer-Seconds");
    self.elSecondsRotorFirst = self.elSeconds?.querySelector(
      ".Msell-CountdownTimer-FlipCard:nth-child(1)",
    );
    self.elSecondsRotorSecond = self.elSeconds?.querySelector(
      ".Msell-CountdownTimer-FlipCard:nth-child(2)",
    );

    self.initializeClock(countdown);
  }

  reset() {
    this.init();
  }

  initializeClock(countdown) {
    const self = this;
    self.updateClock(countdown);
    self.timerInterval = setInterval(() => {
      self.updateClock(countdown);
    }, 1000);
  }

  updateClock(countdown) {
    const self = this;
    const now = new Date();
    const t = self.getTimeRemaining(countdown);
    if (t.days > 0) {
      if (self.elDays) {
        self.elDays.innerText = `${t.days} days`;
      }
      // self.addFlip(self.elDaysRotorFirst, t.days > 9 ? `${t.days}`.substring(0, 1) : `0`);
      // self.addFlip(self.elDaysRotorSecond, t.days > 9 ? `${t.days}`.substring(1) : `${t.days > 0 ? t.days : 0}`);
    } else {
      self.elDays && self.elDays.remove();
    }
    self.addFlip(
      self.elHoursRotorFirst,
      t.hours > 9 ? `${t.hours}`.substring(0, 1) : `0`,
    );
    self.addFlip(
      self.elHoursRotorSecond,
      t.hours > 9 ? `${t.hours}`.substring(1) : `${t.hours > 0 ? t.hours : 0}`,
    );
    self.addFlip(
      self.elHoursRotorFirst,
      t.hours > 9 ? `${t.hours}`.substring(0, 1) : `0`,
    );
    self.addFlip(
      self.elHoursRotorSecond,
      t.hours > 9 ? `${t.hours}`.substring(1) : `${t.hours > 0 ? t.hours : 0}`,
    );
    self.addFlip(
      self.elMinutesRotorFirst,
      t.minutes > 9 ? `${t.minutes}`.substring(0, 1) : `0`,
    );
    self.addFlip(
      self.elMinutesRotorSecond,
      t.minutes > 9
        ? `${t.minutes}`.substring(1)
        : `${t.minutes > 0 ? t.minutes : 0}`,
    );
    self.addFlip(
      self.elSecondsRotorFirst,
      t.seconds > 9 ? `${t.seconds}`.substring(0, 1) : `0`,
    );
    self.addFlip(
      self.elSecondsRotorSecond,
      t.seconds > 9
        ? `${t.seconds}`.substring(1)
        : `${t.seconds > 0 ? t.seconds : 0}`,
    );

    if ((self.time / 100) * self.percentWarning > countdown - now) {
      self.elTimer.classList.add("Msell-CountdownTimer--Expire");
    } else {
      self.elTimer.classList.remove("Msell-CountdownTimer--Expire");
    }

    if (t.diff <= 0) {
      setTimeout(() => {
        self.callbackOutOfTime?.();
      }, 2000);
      clearInterval(self.timerInterval);
    }
  }

  getTimeRemaining(countdown) {
    const now = new Date();
    const diff = countdown - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
      diff,
      days,
      hours,
      minutes,
      seconds,
    };
  }

  addFlip(card, time) {
    if (!card) return;
    // ** confirm time has changed
    const topHalf = card.querySelector(".Msell-CountdownTimer-Top");
    const currTime = topHalf.innerText;

    if (currTime && time == currTime) return;
    // const leaf = card.querySelector(".Msell-CountdownTimer-Half");
    const bottomHalf = card.querySelector(".Msell-CountdownTimer-Bottom");
    bottomHalf?.classList.add("Msell-CountdownTimer-Flipped");
    topHalf?.classList.add("Msell-CountdownTimer-Flipped");

    // const leafRear = card.querySelector(".Msell-CountdownTimer-HalfFirst");
    // const leafFront = card.querySelector(".Msell-CountdownTimer-HalfLast");

    // ** add animation, populate with current time
    // leafRear.innerText = time;

    bottomHalf.innerText = time;
    setTimeout(() => {
      topHalf.innerText = time;
      bottomHalf?.classList.remove("Msell-CountdownTimer-Flipped");
      topHalf?.classList.remove("Msell-CountdownTimer-Flipped");
      // leafFront.innerText = time;
    }, 800);
  }
}
