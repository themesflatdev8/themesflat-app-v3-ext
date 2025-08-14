export default class SwiperComponent extends HTMLElement {

  constructor() {
    super();
    this.isDragging = false;
    this.startPos = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.isMobile = false;
    this.swiper = this.querySelector(".Msell-Swiper__List");
    this.swiperItems = this.querySelectorAll(".Msell-Swiper__Item");
    this.sliderSeparator = this.querySelector(".Msell-Swiper__Separator");
    this.enableSwiperLooping = false;
    this.buttons = this.querySelector(".Msell-Swiper-Buttons");
    this.currentPageElement = this.querySelector(
      ".Msell-Swiper-Counter--Current",
    );
    this.pageTotalElement = this.querySelector(".Msell-Swiper-Counter--Total");
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');
    this.slidesPerPage = 1;
    if (!this.swiper || !this.nextButton) return;
    this.init();
    const resizeObserver = new ResizeObserver(() => this.init());
    resizeObserver.observe(this.swiper);

    this.swiper.addEventListener("scroll", this.update.bind(this));
    this.prevButton.addEventListener("click", this.onButtonClick.bind(this));
    this.nextButton.addEventListener("click", this.onButtonClick.bind(this));
    // Touch events
    this.swiper.addEventListener("touchstart", this.touchStart.bind(this), {
      passive: false,
    });
    this.swiper.addEventListener("touchend", this.touchEnd.bind(this));
    this.swiper.addEventListener("touchmove", this.touchMove.bind(this));

    // Mouse events
    this.swiper.addEventListener("mousedown", this.touchStart.bind(this));
    this.swiper.addEventListener("mouseup", this.touchEnd.bind(this));
    this.swiper.addEventListener("mouseleave", this.touchEnd.bind(this));
    this.swiper.addEventListener("mousemove", this.touchMove.bind(this));
  }

  init() {
    this.isMobile = this.checkMobile();
    this.swiperItemsToShow = Array.from(this.swiperItems).filter(
      (element) => element.clientWidth > 0,
    );
    if (this.swiperItemsToShow.length < 2) {
      this.prevButton && this.prevButton.setAttribute("disabled", "disabled");
      this.nextButton && this.nextButton.setAttribute("disabled", "disabled");
      this.prevButton && (this.prevButton.style.display = "none");
      this.nextButton && (this.nextButton.style.display = "none");
      this.buttons && (this.buttons.style.display = "none");
      return;
    }
    let clientWidthSeparator = this.sliderSeparator?.clientWidth || 0;

    this.swiperItemOffset =
      this.swiperItemsToShow[1].offsetLeft -
      this.swiperItemsToShow[0].offsetLeft;
    this.slidesPerPage =
      Math.floor(
        (this.swiper.clientWidth +
          clientWidthSeparator -
          this.swiperItemsToShow[0].offsetLeft) /
          this.swiperItemOffset,
      ) || 1;
    this.totalPages =
      Math.ceil(this.swiperItemsToShow.length / this.slidesPerPage) || 1;
    this.update();
  }

  reset() {
    this.swiperItems = this.querySelectorAll(".Msell-Swiper__Item");
    this.sliderSeparator = this.querySelector(".Msell-Swiper__Separator");
    this.init();
  }

  update() {
    if (!this.swiper || !this.nextButton) return;
    const previousPage = this.currentPage;
    this.currentPage =
      Math.ceil(
        this.swiper.scrollLeft / (this.swiperItemOffset * this.slidesPerPage),
      ) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(
        new CustomEvent("slideChanged", {
          detail: {
            currentPage: this.currentPage,
            currentElement: this.swiperItemsToShow[this.currentPage - 1],
          },
        }),
      );
    }

    if (this.enableSwiperLooping) return;
    let isDisablePrev =
      this.isSlideVisible(this.swiperItemsToShow[0]) &&
      this.swiper.scrollLeft === 0;
    let isDisableNext = this.isSlideVisible(
      this.swiperItemsToShow[this.swiperItemsToShow.length - 1],
    );
    if (isDisableNext && isDisablePrev) {
      this.classList.add("Msell-Swiper--No");
      this.prevButton.style.display = "none";
      this.nextButton.style.display = "none";
      this.buttons && (this.buttons.style.display = "none");
    } else {
      this.classList.remove("Msell-Swiper--No");
      this.prevButton.style.display = "";
      this.nextButton.style.display = "";
      this.buttons && (this.buttons.style.display = "");
    }
    if (isDisablePrev) {
      this.prevButton.setAttribute("disabled", "disabled");
    } else {
      this.prevButton.removeAttribute("disabled");
    }

    if (isDisableNext) {
      this.nextButton.setAttribute("disabled", "disabled");
    } else {
      this.nextButton.removeAttribute("disabled");
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide =
      this.swiper.clientWidth + this.swiper.scrollLeft - offset;
    return (
      element.offsetLeft + element.clientWidth <= lastVisibleSlide &&
      element.offsetLeft >= this.swiper.scrollLeft
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    this.slideScrollPosition =
      event.currentTarget.name === "next"
        ? this.swiper.scrollLeft + this.slidesPerPage * this.swiperItemOffset
        : this.swiper.scrollLeft - this.slidesPerPage * this.swiperItemOffset;
    this.swiper.scrollTo({
      left: this.slideScrollPosition,
    });
  }

  slideNext() {
    this.slideScrollPosition =
      this.swiper.scrollLeft + this.slidesPerPage * this.swiperItemOffset;
    this.swiper.scrollTo({
      left: this.slideScrollPosition,
    });
  }

  slidePrev() {
    this.slideScrollPosition =
      this.swiper.scrollLeft - this.slidesPerPage * this.swiperItemOffset;
    this.swiper.scrollTo({
      left: this.slideScrollPosition,
    });
  }

  getPositionX(event) {
    return event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;
  }

  touchStart(event) {
    !this.isMobile && event.preventDefault();
    this.swiper.style.cursor = "grabbing";
    this.startPos = this.getPositionX(event);
    this.isDragging = true;
  }

  touchEnd() {
    this.swiper.style.cursor = "grab";
    this.isDragging = false;
    this.dragMove();
    this.prevTranslate = this.currentTranslate;
    // this.setTranslate(0)
  }

  touchMove(event) {
    if (this.isDragging) {
      const currentPosition = this.getPositionX(event);
      // let scrollLeft = this.startPos - currentPosition
      // if(scrollLeft > 10 || scrollLeft < -10){
      //   if(this.startPos > currentPosition){
      //     this.setTranslate(scrollLeft > -30 ? -30 : scrollLeft)
      //   }else {
      //     this.setTranslate(scrollLeft < -30 ? 30 : -scrollLeft)
      //   }
      // }
      this.currentTranslate =
        this.prevTranslate + currentPosition - this.startPos;
    }
  }

  dragMove() {
    if (!this.isMobile) {
      const movedBy = this.currentTranslate - this.prevTranslate;
      if (movedBy < -80) {
        this.slideNext();
      } else if (movedBy > 80) {
        this.slidePrev();
      }
    }
  }

  setTranslate(value) {
    if (!this.isMobile) {
      this.swiper.style.transform = `translateX(${value}px)`;
    }
  }

  checkMobile() {
    // Check if the user is accessing the page on a mobile device
    let isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    if (isMobile) {
      return true;
    } else {
      return false;
    }
  }
}
