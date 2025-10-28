 document.addEventListener('DOMContentLoaded', async () => {
  const el = document.getElementById('review-section');
  if (!el) return;
  console.log('Grocom Review Widget initialized');
  const productId = el.dataset.productId;
  const shop = Shopify.shop;
  const linkApp = 'https://be-gearo.vinetawp.com/api';

  try {
    const res = await fetch(`${linkApp}/review-box?product_id=${productId}&shop=${shop}`);
    const data = await res.json();
    el.innerHTML = data.html;

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

    // Wait a bit for title to render (in case of slow theme)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get title
    if (window.ShopifyAnalytics?.meta?.product?.title) {
      title = window.ShopifyAnalytics.meta.product.title;
    } else if (window.meta?.product?.title) {
      title = window.meta.product.title;
    } else {
      const elTitle = document.querySelector(
        'h1.product__title, .product-title, h1.product__name, h1.title, [data-product-title]'
      );
      if (elTitle) {
        title = elTitle.textContent.trim();
        console.log('Detected title:', title);
      } else {
        console.warn('Title element not found in DOM');
      }
    }

    // Assign values to form inputs
    const inputHandle = el.querySelector('input[name="handle"]');
    if (inputHandle && handle) inputHandle.value = handle;
    else console.warn('Input[name="handle"] not found or handle not detected');

    const inputTitle = el.querySelector('input[name="product_title"]');
    if (inputTitle && title) inputTitle.value = title;
    else console.warn('Input[name="product_title"] not found or title not detected', title);

  } catch (error) {
    console.error('Error loading reviews:', error);
  }

 

  const form = el.querySelector('#review-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let handle = null;
    let title = null;

    try {

      // Lấy handle sản phẩm
      if (window.ShopifyAnalytics?.meta?.product?.handle) {
        handle = window.ShopifyAnalytics.meta.product.handle;
      } else if (window.meta?.product?.handle) {
        handle = window.meta.product.handle;
      } else {
        const parts = window.location.pathname.split('/');
        const index = parts.indexOf('products');
        if (index !== -1 && parts[index + 1]) handle = parts[index + 1];
      }

      // Đợi 300ms để tiêu đề render
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Lấy title sản phẩm
      const elTitle = document.querySelector(
        'h1.product__title, .product-title, h1.product__name, h1.title, [data-product-title]'
      );
      if (elTitle) {
        title = elTitle.textContent.trim();
      } 
    
      // Thu thập dữ liệu review
      const rating = el.querySelector('input[name="rating"]:checked')?.value;
      const review_title = el.querySelector('#review_title')?.value.trim();
      const review_text = el.querySelector('#review_text')?.value.trim();
      const user_name = el.querySelector('#user_name')?.value.trim();
      const user_email = el.querySelector('#user_email')?.value.trim();

      if (!rating || !review_text || !user_email) {
        const notif = el.querySelector('.text-notification');
        if (notif) notif.textContent = 'Please fill in rating, review text and email fields before submitting your review.';
        return;
      }

      // Gửi dữ liệu lên server
      const apiUrl = `${linkApp}/submit-review`;
      const postData = {
        domain: shop,
        product_id: productId,
        title,
        handle,
        rating,
        review_title,
        review_text,
        user_name,
        user_email
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      const result = await response.json();

      const notif = el.querySelector('.text-notification');
      if (result.status === 'success') {
        if (notif) {
          notif.classList.add('success');
          notif.textContent = 'Thank you! Your review has been submitted successfully.';
        }
        form.reset();
        reloadReviewSummary();
      } else {
        alert('Error: ' + (result.message || 'Unknown error occurred.'));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const notif = el.querySelector('.text-notification');
      if (notif) notif.textContent = 'An error occurred while submitting your review.';
    }
  });

  // ==== FUNCTION: Reload review summary ====
  async function reloadReviewSummary() {
    try {
      const url = new URL(`${linkApp}/get-review-summary`);
      url.searchParams.append('domain', shop);
      url.searchParams.append('product_id', productId);

      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'success') {
        const total = data.total;
        const breakdown = data.breakdown;
        const container = el.querySelector('.lstSum');
        if (!container) return;

        container.innerHTML = '';
        [5, 4, 3, 2, 1].forEach((star) => {
          const count = breakdown[star] || 0;
          const percent = total ? Math.round((count / total) * 100) : 0;
          const starsHtml = '★'.repeat(star) + '☆'.repeat(5 - star);
          const line = document.createElement('div');
          line.className = 'star-row';
          line.innerHTML = `${starsHtml} — ${count} reviews (${percent}%)`;
          container.appendChild(line);
        });
      }
    } catch (error) {
      console.error('Error reloading review summary:', error);
    }
  }

  // ==== FUNCTION: Fetch list reviews ====
  async function getListReviews() {
    try {
      const url = new URL(`${linkApp}/get-reviews-full`);
      url.searchParams.append('domain', shop);
      url.searchParams.append('product_id', productId);
      url.searchParams.append('type', 'product');

      const res = await fetch(url);
      const data = await res.json();

      const container = el.querySelector('.review-container');
      if (!container) return;
      container.innerHTML = '';

      if (data.status === 'success') {
        if (!data.reviews.length) {
          container.innerHTML = '<div class="no-comment">No comments</div>';
        } else {
          data.reviews.forEach((review) => {
            container.insertAdjacentHTML('beforeend', renderReviewRecursive(review));
          });
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  }

  // ==== FUNCTION: Recursive render review ====
  function renderReviewRecursive(review, level = 0) {
    const indent = level * 20;
    const stars = review.rating ? '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating) : '';
    const email = (review.user_email || '').trim().toLowerCase();
    const avatarUrl = `https://www.gravatar.com/avatar/${md5(email)}?s=200&d=mp`;

    let html = `
      <div class="review-item" style="margin-left: ${indent}px;">
        <div class="infor">
          <div class="avatar">
            <img src="${avatarUrl}" loading="lazy" />
          </div>
          <div class="content">
            <h6 class="review-author">${review.user_name || 'Anonymous'} <span>${stars}</span></h6>
            <div class="review-date">${formatDate(review.created_at)}</div>
          </div>
        </div>
        <div class="review-text">${review.review_text}</div>
      </div>
    `;

    if (review.replies?.length) {
      review.replies.forEach((reply) => {
        html += renderReviewRecursive(reply, level + 1);
      });
    }
    return html;
  }

  // ==== FUNCTION: Count review ====
  async function getCountReview() {
    try {
      const url = new URL(`${linkApp}/count-comments`);
      url.searchParams.append('domain', shop);
      url.searchParams.append('product_id', productId);
      url.searchParams.append('type', 'product');

      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'success') {
        const count = data.total || 0;
        const formatted = count > 0 ? String(count).padStart(1, '0') : '0';
        const countEl = document.getElementById('count-number');
        if (countEl) countEl.textContent = formatted;
      }
    } catch (error) {
      console.error('Error fetching review count:', error);
    }
  }

  // ==== Utility ====
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ==== Toggle form/list ====
  const btnReview = el.querySelector('.c-btnReview');
  const btnCancel = el.querySelector('.c-btnCancelReview');
  const formContainer = el.querySelector('.form');
  const listContainer = el.querySelector('.list');

  if (btnReview && btnCancel && formContainer && listContainer) {
    formContainer.style.display = 'none';
    btnCancel.style.display = 'none';

    btnReview.addEventListener('click', () => {
      listContainer.style.display = 'none';
      formContainer.style.display = 'block';
      btnReview.style.display = 'none';
      btnCancel.style.display = 'inline-block';
    });

    btnCancel.addEventListener('click', () => {
      listContainer.style.display = 'block';
      formContainer.style.display = 'none';
      btnReview.style.display = 'inline-block';
      btnCancel.style.display = 'none';
    });
  }

  // Initial load
  getListReviews();
  getCountReview();
  
});
