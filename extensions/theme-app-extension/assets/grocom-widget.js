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
});
