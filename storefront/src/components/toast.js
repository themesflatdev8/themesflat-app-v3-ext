// import viewToast from '@/views/components/toast/index.handlebars';
const viewToast = function () {
  return "";
};

class Toast {
  timer = null;
  autoCloseDefault = 5000;
  elToast = null;

  constructor() {}

  get container() {
    return this.elToast;
  }

  success = ({ title = "Success", content = "", link = "", autoClose }) => {
    this.show({ title, content, link, autoClose, type: "success" });
  };

  error = ({ title = "Error!", content = "", link = "", autoClose }) => {
    this.show({ title, content, link, autoClose, type: "error" });
  };

  warning = ({ title = "Warning!", content = "", link = "", autoClose }) => {
    this.show({ title, content, link, autoClose, type: "warning" });
  };

  info = ({ title = "Info!", content = "", link = "", autoClose }) => {
    this.show({ title, content, link, autoClose, type: "info" });
  };

  show = ({ title, content, link, autoClose, type = "success" }) => {
    let self = this;
    document.body.insertAdjacentHTML(
      "beforeend",
      viewToast({ title, content, link, type }),
    );
    let elToast = document.getElementById("Msell-Toast");
    self.elToast = elToast;

    self.timer = setTimeout(() => {
      self.destroy();
    }, autoClose || self.autoCloseDefault);

    let btnClose = elToast.querySelector(".Msell-Toast__Close");
    btnClose.addEventListener("click", function () {
      clearTimeout(this.timer);
      self.destroy();
    });
  };

  destroy = () => {
    let self = this;
    self.elToast && self.elToast.remove();
  };
}

export default Toast;
