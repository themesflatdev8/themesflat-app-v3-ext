// expire: 1p
// Local
export const getLocalStorage = (key) => {
  try {
    let stringValue = localStorage.getItem(key);
    if (stringValue !== null) {
      let obj = JSON.parse(stringValue);
      let expirationDate = new Date(obj.expire);
      if (expirationDate > new Date()) {
        return obj.value;
      } else {
        localStorage.removeItem(key);
      }
    }
    return null;
  } catch (err) {
    console.log("error", err);
  }
};

export const setLocalStorage = (key, value, expire = 9999999) => {
  try {
    let expirationDate = new Date(new Date().getTime() + 60000 * expire);
    let newValue = {
      value: value,
      expire: expirationDate.toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(newValue));
  } catch (err) {
    console.log("error", err);
  }
};

export const getLocalStorageNotExpire = (key) => {
  try {
    let stringValue = localStorage.getItem(key);
    if (stringValue !== null) {
      let obj = JSON.parse(stringValue);
      return obj;
    }
    return null;
  } catch (err) {
    console.log("error", err);
  }
};

export const setLocalStorageNotExpire = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.log("error", err);
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.log("error", err);
  }
};

// Session
export const getSessionStorage = (key) => {
  try {
    let stringValue = sessionStorage.getItem(key);
    if (stringValue !== null) {
      let obj = JSON.parse(stringValue);
      let expirationDate = new Date(obj.expire);
      if (expirationDate > new Date()) {
        return obj.value;
      } else {
        sessionStorage.removeItem(key);
      }
    }
    return null;
  } catch (err) {
    console.log("error", err);
  }
};

export const setSessionStorage = (key, value, expire = 9999999) => {
  try {
    let expirationDate = new Date(new Date().getTime() + 60000 * expire);
    let newValue = {
      value: value,
      expire: expirationDate.toISOString(),
    };
    sessionStorage.setItem(key, JSON.stringify(newValue));
  } catch (err) {
    console.log("error", err);
  }
};

export const removeSessionStorage = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    console.log("error", err);
  }
};

export const setCookie = function (name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

export const getCookie = function (name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const eraseCookie = function (name) {
  document.cookie = name + "=; Max-Age=-99999999;";
};
