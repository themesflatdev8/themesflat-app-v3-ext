export function removeProtocol(path) {
  // removeProtocol - TEST DONE
  return path
    .replace(/^(url\(['"]http(s)?:)|^(http(s)?:)/, "")
    .replace(/(\)\;"\))$|("\))$/, "");
}

export function checkValidUrl(url) {
  var regexp =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
  return regexp.test(url);
}

export const getParamsUrl = function (param) {
  //transcy_getParamsUrl
  var url_string = window.location.href;
  var url = new URL(url_string);
  return url.searchParams.get(param);
};

export const getQueryParams = function (url, params) {
  let href = url;
  let regexp = new RegExp("[?&]" + params + "=([^&#]*)", "i");
  let qString = regexp.exec(href);
  return qString ? qString[1] : null;
};

export const removeParamsUrl = function (key) {
  let href = window.location.href,
    rtn = href.split("?")[0],
    param,
    params_arr = [],
    queryString = href.indexOf("?") !== -1 ? href.split("?")[1] : "";
  if (queryString !== "") {
    params_arr = queryString.split("&");
    for (let i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split("=")[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
    if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
  }
  return rtn;
};
