document.addEventListener('DOMContentLoaded', async () => {
  
  const el = document.getElementById('review-section');
  if (!el) return;

  const productId = el.dataset.productId;
  const shop = Shopify.shop;

  try {
    // Fetch review HTML
    const res = await fetch(`https://be-gearo.vinetawp.com/api/review-box?product_id=${productId}&shop=${shop}`);
    const data = await res.json();
    el.innerHTML = data.html;

    // ------------------------------
    // Auto-fill product handle & title
    // ------------------------------
    let handle = null;
    let title = null;

    // Get handle
    if (window.ShopifyAnalytics?.meta?.product?.handle) {
      handle = window.ShopifyAnalytics.meta.product.handle;
    } else if (window.meta?.product?.handle) {
      handle = window.meta.product.handle;
    } else {
      const parts = window.location.pathname.split('/');
      const index = parts.indexOf('products');
      if (index !== -1 && parts[index + 1]) handle = parts[index + 1];
    }

    // Get title
    if (window.ShopifyAnalytics?.meta?.product?.title) {
      title = window.ShopifyAnalytics.meta.product.title;
    } else if (window.meta?.product?.title) {
      title = window.meta.product.title;
    } else {
      const elTitle = document.querySelector('h1.product__title, .product-title, [data-product-title]');
      if (elTitle) title = elTitle.textContent.trim();
    }

    // Assign values to form inputs
    const inputHandle = el.querySelector('input[name="handle"]');
    if (inputHandle && handle) inputHandle.value = handle;
    else console.warn('Input[name="handle"] not found or handle not detected');

    const inputTitle = el.querySelector('input[name="product_title"]');
    if (inputTitle && title) inputTitle.value = title;
    else console.warn('Input[name="product_title"] not found or title not detected');

  } catch (error) {
    console.error('Error loading reviews:', error);
  }
});
