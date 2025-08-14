export const clone = (val) => {
  return JSON.parse(JSON.stringify(val));
};

export const includes = (arr, value) => {
  if (!arr) return false;
  return arr.some((v) => v == value);
};

export const isEqual = (val1, val2) => {
  let newVal1 = JSON.stringify(val1);
  let newVal2 = JSON.stringify(val2);
  return newVal1 == newVal2 ? true : false;
};

export const isEmpty = (val) => {
  if (!val) return true;
  if (typeof val == "object") {
    return !Object.keys(val).length;
  }
  if (typeof val == "string") {
    return !val;
  }
  return !val;
};

export const disorder = function (preserve) {
  let array = [...preserve];
  let disordered = [];

  while (array.length > 0) {
    let index = Math.round(Math.random() * (array.length - 1));
    disordered.push(array[index]);
    array.splice(index, 1);
  }

  if (!preserve) {
    Array.prototype.push.apply(this, disordered);
  }

  return disordered;
};

export default {
  clone,
  includes,
  isEqual,
  isEmpty,
  disorder,
};
