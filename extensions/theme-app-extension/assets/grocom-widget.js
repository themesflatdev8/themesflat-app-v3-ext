 document.addEventListener('DOMContentLoaded', async () => {
    const el = document.getElementById('review-section');
    if (!el) return;

    const productId = el.dataset.productId;
    const shop = Shopify.shop;
    const linkApp = 'https://be-gearo.vinetawp.com/api';

    try {
      const res = await fetch(`${linkApp}/review-box?product_id=${productId}&shop=${shop}`);
      const data = await res.json();
      el.innerHTML = data.html;
    
      //     // ------------------------------
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
  
 $(document).ready(function () {  
    const el = document.getElementById('review-section');
    if (!el) return;
    const productId = el.dataset.productId;
    const linkApp = 'https://be-gearo.vinetawp.com/api'; // your API base
  $('#review-section #review-form').on('submit', function (e) {
    e.preventDefault();
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

    const domain = Shopify.shop;
    const apiUrl = `${linkApp}/submit-review`;

    const data = {
      domain: domain,
      product_id: productId,
      title: title,
      handle: handle,          
      rating: $('#review-section #review-form input[name="rating"]:checked').val(),
      review_title: $('#review-section #review-form #review_title').val(),
      review_text: $('#review-section #review-form #review_text').val(),
      user_name: $('#review-section #review-form #user_name').val(),
      user_email: $('#review-section #review-form #user_email').val()
    };

    if (!data.rating || !data.review_text || !data.user_email) {
      $('.text-notification').html('Please fill in rating,review test and email fields before submitting your review.');
      return;
    }

    $.ajax({
      type: 'POST',
      url: apiUrl,
      data: data,
      success: function (response) {
        if (response.status === 'success') {
          $('.text-notification').addClass('success').html('Thank you! Your review has been submitted successfully.');

          $('#review-form')[0].reset();

          reloadReviewSummary(); 
        } else {
          alert('Error: ' + (response.message || 'Unknown error occurred.'));
        }
      },
      error: function (xhr, status, error) {
        console.error('Review submission failed:', error);
        // $('.text-notification').html('An error occurred while submitting your review. Please try again later.');            
        $('.text-notification').html('message');            
      }
    });
  });

  function reloadReviewSummary() {
    const url = new URL(`${linkApp}/get-review-summary`);
    url.searchParams.append('domain', Shopify.shop);
    url.searchParams.append('product_id', productId);
    

    fetch(url.toString())
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        const summary = data;
        const total = summary.total;
        const breakdown = summary.breakdown;

        const container = $('#review-section .lstSum');
        container.html('');

        [5, 4, 3, 2, 1].forEach(star => {
          const count = breakdown[star] || 0;
          const percent = total ? Math.round((count / total) * 100) : 0;

          const starsHtml = '★'.repeat(star) + '☆'.repeat(5 - star);
          const line = `<div class="star-row">
                          ${starsHtml} — ${count} reviews (${percent}%)
                        </div>`;
          container.append(line);
        });
      } else {
        console.error('Failed to fetch review summary:', data.message);
      }
    })
    .catch(error => {
      console.error('Review summary request failed:', error);
    });
  }

  function getListReviews() {
    const url = new URL(`${linkApp}/get-reviews-full`);
    url.searchParams.append('domain', Shopify.shop);
    url.searchParams.append('product_id', productId); 
    url.searchParams.append('type','product');

    fetch(url.toString())
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const container = $('#review-section .review-container');
          container.html('');

          if (data.reviews.length === 0) {
            container.append('<div class="no-comment">No comments</div>');
          } else {
            data.reviews.forEach(review => {
              const html = renderReviewRecursive(review);
              container.append(html);
            });
          }

        } else {
          console.error('Error loading reviews:', data.message);
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
      });
  }
  

  function renderReviewRecursive(review, level = 0) {
    const indent = level * 20;
    const stars = review.rating ? '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating) : '';
    const email = (review.user_email || '').trim().toLowerCase();
    let avatarUrl = `https://www.gravatar.com/avatar/${md5(email)}?s=200&d=mp`;

    const html = `         
      <div class="review-item" style="margin-left: ${indent}px;">
        <div class="infor">
          <div class="avatar">
            <img src="${avatarUrl}" width="" height="" loading="lazy" />
          </div>
          <div class="content">
            <h6 class="review-author">${review.user_name || 'Anonymous'} <span>${stars}</span></h6>
            <div class="review-date">${formatDate(review.created_at)}</div>              
          </div>
        </div>
        <div class="review-text">${review.review_text}</div>
        </div>
      `;

    let repliesHtml = '';
    if (review.replies && review.replies.length > 0) {
      review.replies.forEach(reply => {
        repliesHtml += renderReviewRecursive(reply, level + 1);
      });
    }

    return html + repliesHtml;
  }
  getListReviews();

  function getCountReview() {
    const domain = Shopify.shop;
    const getUrl = `${linkApp}/count-comments`;

    const url = new URL(getUrl);
    url.searchParams.append('domain', domain);
    url.searchParams.append('product_id', productId);
    url.searchParams.append('type', 'product');

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const count = data.total || 0;
          const formatted = count > 0 ? String(count).padStart(1, '0') : '0';
          const el = document.getElementById('count-number');
          if (el) el.textContent = formatted;
        }
      })
    .catch(err => console.error('Failed to fetch comment count:', err));
  }

  getCountReview();

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  $('.c-productReview .form').hide();
  $('.c-productReview .c-btnCancelReview').hide();

  $('.c-productReview .c-btnReview').click(function() {        
    $('.c-productReview .list').hide();
    $('.c-productReview .form').show();

    $('.c-productReview .c-btnReview').hide();
    $('.c-productReview .c-btnCancelReview').show();
  });

  $('.c-productReview .c-btnCancelReview').click(function() {
    $('.c-productReview .list').show();
    $('.c-productReview .form').hide();

    $('.c-productReview .c-btnReview').show();
    $('.c-productReview .c-btnCancelReview').hide();
  });
});
