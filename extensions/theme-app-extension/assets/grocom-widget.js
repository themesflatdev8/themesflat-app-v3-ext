document.addEventListener('DOMContentLoaded', async () => {

  const el = document.getElementById('review-section');
  if (!el) return;

  const productId = el.dataset.productId;
  const shop = Shopify.shop;

  try {
    const res = await fetch(`https://be-gearo.vinetawp.com/api/review-box?product_id=${productId}&shop=${shop}`);
    const data = await res.json();
    el.innerHTML = data.html;
  } catch (e) {
    console.error('Error loading reviews:', e);
  }

  // // 🔹 Sau khi HTML được render, tự động điền handle vào input form
  //   let handle = null;

  //   if (window.ShopifyAnalytics?.meta?.product?.handle) {
  //     handle = window.ShopifyAnalytics.meta.product.handle;
  //   } else if (window.meta?.product?.handle) {
  //     handle = window.meta.product.handle;
  //   } else {
  //     const parts = window.location.pathname.split('/');
  //     const index = parts.indexOf('products');
  //     if (index !== -1 && parts[index + 1]) {
  //       handle = parts[index + 1];
  //     }
  //   }

  //   if (handle) {
  //     const input = el.querySelector('input[name="handle"]');
  //     if (input) input.value = handle;
  //     else console.warn('do not find input handle in review form');
  //   } else {
  //     console.warn('do not get product handle');
  //   }
});
