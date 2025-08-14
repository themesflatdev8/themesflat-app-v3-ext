import Handlebars from "handlebars/runtime";

Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

Handlebars.registerHelper("formatLogId", function (logId, key = "FA") {
  let strLogId = logId.toString();
  let temp = "";
  for (let i = strLogId.length; i < 5; i++) {
    temp += "0";
  }
  return key + temp + strLogId;
});

Handlebars.registerHelper("formatDate", function (value) {
  if (value) {
    let date = new Date(value);
    return date;
  }
  return "";
});

Handlebars.registerHelper("getValueOfElmInObj", function (obj, id, el) {
  let currObj = obj[id];
  if (currObj) {
    return currObj[el];
  }
  return "";
});

Handlebars.registerHelper("jsonStringify", function (obj) {
  return JSON.stringify(obj);
});

Handlebars.registerHelper("concat", function () {
  let outStr = "";
  for (let arg in arguments) {
    if (typeof arguments[arg] != "object") {
      outStr += arguments[arg];
    }
  }
  return outStr;
});
