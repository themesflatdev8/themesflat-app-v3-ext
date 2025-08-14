import {
  _buttonsAddToCart,
  _buttonsBuyNow,
  _elementQuantity,
} from "@/constants/selectors";

const isDescendant = (parent, child) => {
  if (!parent) {
    return false;
  }
  let node = child.parentNode;
  while (node != null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

export const getFormNode = () => {
  //Unwanted forms as child/parent/form
  let formsException = [
    ".sticky-cart-form",
    "#form-sticky",
    ".container-sticky_addtocart",
    ".sticky-barre-content",
    "#shopify-section-header",
    ".product-recommendations-placeholder",
    ".sticky-atc-title",
    ".search-form",
    ".sticky-dropdownvar",
    "header.site-header",
    "#popUps .cart_upsell_popup",
    "#popUps .cart_downsell_popup",
    ".product-upsell-holder",
    "#product-form-installment",
    ".sticky_addcart",
    ".product-upsell__holder",
    "#ShippingModal",
    ".collection .card-wrapper .card__content",
    "#featured-product-scroll .product--variant",
    "product-sticky-form",
    "#rio-upsell",
    ".t4s-product-tabs-wrapper",
    'div[data-extraclass="sticky-atc"]',
    "#shopify-section-pr_description",
    ".cu-upsell",
    "#CartDrawer",
    "cart-drawer.cart-drawer",
    "#product-form-main-sticky-atc",
    "gp-sticky",
    ".pupsdreams_popup_sticky-product-details-container",
    ".product-item--has-quick-add",
    ".related_products",
    "mini-cart .minicart-content",
    ".dbtfy-sticky-addtocart__bar .dbtfy-sticky-addtocart__container",
    ".card .dbtfy-collection-addtocart",
    ".tabs__recommendation quick-add-product .quick-add__holder",
    "main .shopify-section > #sticky-add-to-cart",
    "product-recommendations motion-list .quick-add",
    ".swiper-wrapper div[class*='ss_shoppable_video']",
    ".product-recommendations .product-loop .js-product-listing",
    ".cart-upsell-wrapper #cart-upsell",
    "section#sticky-atc.fixed-bottom .container",
    ".product--addtocart--sticky .right-side",
    "div[id$='__cart-upsell'] .dbtfy-cart-upsell .dbtfy-cart-upsell-item",
    ".cart-flyout .cart-drawer-products",
    "#cart-drawer .cart-upselling",
    "div[hidden] .dbtfy-upsell-bundles__form-wrapper",
  ];

  //Forms we want to check
  let forms = [
    ".w-commerce-commerceaddtocartform.default-state-2",
    ".product-form",
    ".productForm",
    'product-form form[data-type="add-to-cart-form"]',
    ".product-form__buy-buttons .shopify-product-form",
    ".shopify-product-form",
    "#addToCartFormId1",
    ".t4s-product__info-wrapper form.t4s-form__product",
    "#AddToCartForm--product-template",
    ".product-form-product-template",
    ".product-form.hidedropdown",
    ".addToCartForm",
    ".product-single__meta .product-single__meta-info .product-single__form",
    ".ProductForm",
    ".product-single__form",
    ".prod_form",
    "#addToCartForm-product-template-optimised",
    ".shg-product-atc-btn-wrapper",
    'form[data-type="add-to-cart-form"].form',
    "form[action=\\'/cart/add\\']",
    "#addToCartForm",
    ".form-vertical",
    "#prodForm",
    "form[data-product-form]",
    "#add-to-cart-form",
    "form[action$='/cart/add']",
    ".product-single__form:nth-child(2)",
  ];

  let allForms = 0;

  forms.forEach((form) => {
    allForms += document.querySelectorAll(form).length;
  });

  //To detect and get the product form node in the page
  for (let i = 0; i < forms.length; i++) {
    let formLength = document.querySelectorAll(forms[i]).length;
    //For all the forms found in the page
    formNumber: for (let j = 0; j < formLength; j++) {
      let form = document.querySelectorAll(forms[i])[j];
      let formID = forms[i];
      //If the form is found and is not .product-form (because we can't use it)
      if (
        typeof form !== "undefined" &&
        form != null &&
        formID != ".product-form"
      ) {
        //For all the exceptions classes
        for (let x = 0; x < formsException.length; x++) {
          let exceptionAll = document.querySelectorAll(formsException[x]);
          for (let z = 0; z < exceptionAll.length; z++) {
            let exception = exceptionAll[z];
            //If the form is an exception then check next form found in the page
            if (
              exception == form ||
              isDescendant(exception, form) ||
              isDescendant(form, exception)
            ) {
              // console.log('form is an exception...');
              continue formNumber;
            }
          }
        }
        //Check forms we don't wants (those with only hidden elements)
        let childElementsWB = form.querySelectorAll("*");
        let good = 0;
        for (let x = 0; x < childElementsWB.length; x++) {
          if (
            typeof childElementsWB[x] == "object" &&
            typeof childElementsWB[x].type != "undefined" &&
            childElementsWB[x].type != "hidden"
          ) {
            good = 1;
          }
        }
        if (
          good == 0 &&
          (allForms >= 2 ||
            childElementsWB.length == 0 ||
            form.tagName == "BUTTON")
        ) {
          // console.log('form is another exception');
          continue formNumber;
        }
        //If form exists and has passed the exceptions then we can choose it to display the Widget
        if (form !== "undefined" && form != null) {
          return {
            element: form,
            id: formID,
          };
        }
      }
    }
  }
  return {
    element: null,
    id: null,
  };
};

export function getForm() {
  let productForm = document.querySelector("form[action$='/cart/add']");
  if (
    typeof window.shopifyMSell != "undefined" &&
    window.shopifyMSell?.product?.variants?.length
  ) {
    window.shopifyMSell.product.variants.length.forEach((itemVariant) => {
      let elVariant = document.querySelector(
        `input[name="id"][value="${itemVariant.id}"]`,
      );
      if (elVariant) {
        let elForm = elVariant.closest("form");
        if (elForm) {
          productForm = elForm;
        }
      }
    });
  }
  return productForm;
}

export function getButtonAddToCart() {
  let btn = null;
  for (let i = 0; i < _buttonsAddToCart.length; i++) {
    let arrButtonFound = document.querySelectorAll(_buttonsAddToCart[i]);
    let buttonFound = Array.from(arrButtonFound).find((item) => {
      return (
        item &&
        (!item.style ||
          (item.style && item.style.display != "none") ||
          (item.style && item.style.opacity != "0"))
      );
    });
    if (buttonFound) {
      btn = buttonFound;
      break;
    }
  }
  return btn;
}

export function getButtonBuyNow() {
  let btn = null;
  for (let i = 0; i < _buttonsBuyNow.length; i++) {
    let arrButtonFound = document.querySelectorAll(_buttonsBuyNow[i]);
    let buttonFound = Array.from(arrButtonFound).find((item) => {
      return item;
    });
    if (buttonFound) {
      btn = buttonFound;
      break;
    }
  }
  return btn;
}

export function getElementQuantity() {
  let btn = null;
  for (let i = 0; i < _elementQuantity.length; i++) {
    let buttonFound = document.querySelector(_elementQuantity[i]);
    if (buttonFound) {
      btn = buttonFound;
      break;
    }
  }
  return btn;
}
