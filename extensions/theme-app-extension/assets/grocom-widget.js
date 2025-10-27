// document.addEventListener('DOMContentLoaded', async () => {
  
//   const el = document.getElementById('review-section');
//   if (!el) return;

//   const productId = el.dataset.productId;
//   const shop = Shopify.shop;

//   try {
//     // Fetch review HTML
//     const res = await fetch(`https://be-gearo.vinetawp.com/api/review-box?product_id=${productId}&shop=${shop}`);
//     const data = await res.json();
//     el.innerHTML = data.html;

//     // ------------------------------
//     // Auto-fill product handle & title
//     // ------------------------------
//     let handle = null;
//     let title = null;

//     // Get handle
//     if (window.ShopifyAnalytics?.meta?.product?.handle) {
//       handle = window.ShopifyAnalytics.meta.product.handle;
//     } else if (window.meta?.product?.handle) {
//       handle = window.meta.product.handle;
//     } else {
//       const parts = window.location.pathname.split('/');
//       const index = parts.indexOf('products');
//       if (index !== -1 && parts[index + 1]) handle = parts[index + 1];
//     }

//     // Get title
//     if (window.ShopifyAnalytics?.meta?.product?.title) {
//       title = window.ShopifyAnalytics.meta.product.title;
//     } else if (window.meta?.product?.title) {
//       title = window.meta.product.title;
//     } else {
//       const elTitle = document.querySelector('h1.product__title, .product-title, [data-product-title]');
//       if (elTitle) title = elTitle.textContent.trim();
//     }

//     // Assign values to form inputs
//     const inputHandle = el.querySelector('input[name="handle"]');
//     if (inputHandle && handle) inputHandle.value = handle;
//     else console.warn('Input[name="handle"] not found or handle not detected');

//     const inputTitle = el.querySelector('input[name="product_title"]');
//     if (inputTitle && title) inputTitle.value = title;
//     else console.warn('Input[name="product_title"] not found or title not detected');

//   } catch (error) {
//     console.error('Error loading reviews:', error);
//   }
// });

document.addEventListener('DOMContentLoaded', async () => {
  const el = document.getElementById('review-section');
  if (!el) return;

  const productId = el.dataset.productId;
  const shop = Shopify.shop;
  const linkApp = 'https://be-gearo.vinetawp.com/api'; // your API base

  try {
    // ------------------------------
    // Load review HTML
    // ------------------------------
    const res = await fetch(`${linkApp}/review-box?product_id=${productId}&shop=${shop}`);
    const data = await res.json();
    el.innerHTML = data.html;

    // ------------------------------
    // Auto-fill product handle & title
    // ------------------------------
    let handle = null;
    let title = null;

    if (window.ShopifyAnalytics?.meta?.product?.handle) {
      handle = window.ShopifyAnalytics.meta.product.handle;
    } else if (window.meta?.product?.handle) {
      handle = window.meta.product.handle;
    } else {
      const parts = window.location.pathname.split('/');
      const index = parts.indexOf('products');
      if (index !== -1 && parts[index + 1]) handle = parts[index + 1];
    }

    if (window.ShopifyAnalytics?.meta?.product?.title) {
      title = window.ShopifyAnalytics.meta.product.title;
    } else if (window.meta?.product?.title) {
      title = window.meta.product.title;
    } else {
      const elTitle = document.querySelector('h1.product__title, .product-title, [data-product-title]');
      if (elTitle) title = elTitle.textContent.trim();
    }

    const inputHandle = el.querySelector('input[name="handle"]');
    if (inputHandle && handle) inputHandle.value = handle;

    const inputTitle = el.querySelector('input[name="product_title"]');
    if (inputTitle && title) inputTitle.value = title;

    // ------------------------------
    // Handle form submission
    // ------------------------------
    const form = el.querySelector('#review-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dataForm = {
          domain: shop,
          product_id: productId,
          handle: handle,
          title: title,
          rating: form.querySelector('input[name="rating"]:checked')?.value,
          review_title: form.querySelector('#review_title')?.value,
          review_text: form.querySelector('#review_text')?.value,
          user_name: form.querySelector('#user_name')?.value,
          user_email: form.querySelector('#user_email')?.value,
        };

        if (!dataForm.rating || !dataForm.review_text || !dataForm.user_email) {
          alert('Please fill in all required fields before submitting your review.');
          return;
        }

        try {
          const res = await fetch(`${linkApp}/submit-review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataForm),
          });
          const response = await res.json();

          if (response.status === 'success') {
            alert('Thank you! Your review has been submitted successfully.');
            form.reset();
            loadReviewSummary();
          } else {
            alert('Error: ' + (response.message || 'Unknown error.'));
          }
        } catch (err) {
          console.error('Submit failed:', err);
          alert('An error occurred. Please try again later.');
        }
      });
    }

    // ------------------------------
    // Load review summary
    // ------------------------------
    async function loadReviewSummary() {
      try {
        const res = await fetch(`${linkApp}/get-review-summary?domain=${shop}&product_id=${productId}`);
        const summary = await res.json();

        if (summary.status === 'success') {
          const container = el.querySelector('.lstSum');
          if (!container) return;
          container.innerHTML = '';

          const total = summary.total;
          const breakdown = summary.breakdown;

          [5, 4, 3, 2, 1].forEach(star => {
            const count = breakdown[star] || 0;
            const percent = total ? Math.round((count / total) * 100) : 0;
            const starsHtml = '★'.repeat(star) + '☆'.repeat(5 - star);
            container.innerHTML += `<div class="star-row">${starsHtml} — ${count} reviews (${percent}%)</div>`;
          });
        }
      } catch (err) {
        console.error('Failed to load review summary:', err);
      }
    }

    // ------------------------------
    // Load review list
    // ------------------------------
    async function loadReviewList() {
      try {
        const res = await fetch(`${linkApp}/get-reviews-full?domain=${shop}&product_id=${productId}&type=product`);
        const data = await res.json();

        const container = el.querySelector('.review-container');
        if (!container) return;
        container.innerHTML = '';

        if (data.status === 'success' && data.reviews.length) {
          data.reviews.forEach(review => {
            container.innerHTML += renderReviewRecursive(review);
          });
        } else {
          container.innerHTML = '<div class="no-comment">No comments</div>';
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      }
    }

    // Recursive render
    function renderReviewRecursive(review, level = 0) {
      const indent = level * 20;
      const stars = review.rating ? '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating) : '';
      const email = (review.user_email || '').trim().toLowerCase();
      const avatarUrl = `https://www.gravatar.com/avatar/${md5(email)}?s=200&d=mp`;

      let html = `
        <div class="review-item" style="margin-left:${indent}px;">
          <div class="infor">
            <div class="avatar"><img src="${avatarUrl}" loading="lazy"/></div>
            <div class="content">
              <h6 class="review-author">${review.user_name || 'Anonymous'} <span>${stars}</span></h6>
              <div class="review-date">${formatDate(review.created_at)}</div>
            </div>
          </div>
          <div class="review-text">${review.review_text}</div>
        </div>
      `;

      if (review.replies && review.replies.length > 0) {
        review.replies.forEach(reply => {
          html += renderReviewRecursive(reply, level + 1);
        });
      }
      return html;
    }

    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Initialize
    await loadReviewSummary();
    await loadReviewList();

  } catch (error) {
    console.error('Error loading reviews:', error);
  }
});
