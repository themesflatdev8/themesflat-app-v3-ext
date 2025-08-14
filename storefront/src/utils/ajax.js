import { API_URL } from "@/config/env";

const fetcher = (uri, options) => {
  const url = uri.startsWith("/") ? API_URL + uri : uri;
  options.headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  return fetch(url, options).then((response) => {
    if (response.url.includes("tc.cdnhub.co")) {
      return;
    } else {
      return response.ok ? response.json() : null; // parses JSON response into native JavaScript objects
    }
  });
};

const ajax = {
  get: (uri, { params = {}, headers = {} } = {}) => {
    let esc = encodeURIComponent;
    let query = Object.keys(params)
      .map((k) => {
        if (Array.isArray(params[k]) && params[k].length > 0) {
          return params[k].map((v) => `${esc(k)}[]` + "=" + esc(v)).join("&");
        }
        return esc(k) + "=" + esc(params[k]);
      })
      .join("&");
    return fetcher(`${uri}${query ? `?${query}` : ""}`, { headers });
  },
  post: (uri, { data = null, headers = {} }) => {
    return fetcher(uri, {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    });
  },
  put: (uri, { data = null, headers = {} }) => {
    return fetcher(uri, {
      method: "PUT",
      body: JSON.stringify(data),
      headers,
    });
  },
  delete: (uri, { data = null, headers = {} }) => {
    return fetcher(uri, {
      method: "DELETE",
      body: JSON.stringify(data),
      headers,
    });
  },
};

export default ajax;
