export const getProduct = async (handle) => {
  try {
    let url = `${window.Shopify.routes.root}products/${handle}.js`;
    let res = await fetch(url).then((response) => response.json());
    return res;
  } catch (error) {
    return null;
  }
};

export const getRecommendationsProducts = async ({
  productId,
  intent = "related",
  limit = 10,
}) => {
  try {
    let params = `product_id=${productId}`;
    if (limit) {
      params += `&limit=${limit}`;
    }
    if (intent) {
      params += `&intent=${intent}`;
    }
    let url = `${window.Shopify.routes.root}recommendations/products.json?${params}`;
    let res = await fetch(url).then((response) => response.json());
    return res;
  } catch (error) {
    return null;
  }
};

export const getSearchProducts = async ({
  keyword = "",
  resourceType,
  limit = 10,
}) => {
  try {
    let params = `q=${keyword}`;
    if (resourceType) {
      params += `&resources[type]=${resourceType}`;
    }
    if (limit) {
      params += `&resources[limit]=${limit}`;
    }
    let url = `${window.Shopify.routes.root}search/suggest.json?${params}`;
    let res = await fetch(url).then((response) => response.json());
    return res?.resources?.results || null;
  } catch (error) {
    return null;
  }
};

export const getCartProducts = async () => {
  try {
    let res = await fetch(window.Shopify.routes.root + "cart.js").then(
      (response) => response.json(),
    );
    return res;
  } catch (error) {
    return null;
  }
};

export const getProductShopifySyncApp = (item) => {
  let obj = {
    id: item.id,
    store_id: "",
    title: item.title || "",
    handle: item.handle || "",
    image:
      item.featured_image?.src ||
      (typeof item.featured_image == "object" ? "" : item.featured_image || ""),
    price: item.price / 100,
    compare_at_price: item.compare_at_price
      ? item.compare_at_price / 100
      : null,
    available: item.available,
    inventory_management: "shopify",
    status: "active",
    variants: [],
    options: item.options,
  };
  let variants = [];
  item.variants.forEach((variant) => {
    let newVariant = {
      id: variant.id,
      image:
        variant.featured_image?.src ||
        (typeof variant.featured_image == "object"
          ? ""
          : variant.featured_image || ""),
      title: variant.title,
      inventory: variant.quantity_rule?.max ?? 999999,
      inventory_management: variant.inventory_management,
      option1: variant.option1,
      option2: variant.option2,
      option3: variant.option3,
      options: variant.options,
      price: variant.price / 100,
      product_id: item.id,
      store_id: "",
      compare_at_price: variant.compare_at_price
        ? variant.compare_at_price / 100
        : null,
      available: !!variant.available,
    };
    if (!newVariant.inventory_management) {
      newVariant.inventory = 999999;
    }
    if (newVariant.inventory > 0 && newVariant.available) {
      variants.push(newVariant);
    }
  });
  obj.variants = variants;
  return obj;
};
