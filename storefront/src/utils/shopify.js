export const convertWithFormatMoney = function ({ price, format }) {
  let newVal = 0;
  let placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  let formatName = format.match(placeholderRegex)[1];
  let decimalPoint = "comma";
  if (formatName === "amount" || formatName === "amount_no_decimals") {
    decimalPoint = "dot";
  }
  let priceArgs = String(price).match(/\d+(?:\.\d+)?/g);
  if (decimalPoint === "comma") {
    priceArgs = String(price).match(/\d+(?:,\d+)?/g);
  }
  if (priceArgs && priceArgs.length > 0) {
    priceArgs.forEach((value) => {
      if (decimalPoint === "comma") {
        value = value.replace(",", ".");
      }
      newVal += "" + value + "";
    });
    newVal = parseFloat(newVal);
  }
  return newVal;
};

export const formatMoney = function ({ price, format = "${{amount}}" }) {
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  return format.replace(placeholderRegex, price);
};

export const convertWithRate = function ({
  price,
  rate = 1,
  fee = 0,
  round = -1,
}) {
  let newValue = Number(price) * Number(rate);
  newValue = newValue + (newValue * fee) / 100;
  newValue =
    round == -1
      ? newValue
      : round == 0
        ? Math.floor(newValue)
        : Math.floor(newValue / Math.ceil(round)) * Math.ceil(round) + round;
  return newValue;
};

export const convertMoney = function ({
  price,
  format = "${{amount}}",
  thousands,
  decimal,
  precision,
  hasPrecision = true,
}) {
  if (typeof price == "string") {
    price = price.replace(".", "");
  }
  let placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  // let formatString = (format || this.money_format);

  function defaultOption(opt, def) {
    return typeof opt == "undefined" ? def : opt;
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    let newNumber = number;
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ",");
    decimal = defaultOption(decimal, ".");

    if (isNaN(newNumber) || newNumber == null) {
      return 0;
    }

    // newNumber = newNumber + ((newNumber * fee) / 100)
    // newNumber = (round == 0 ? Math.floor(newValue) : (Math.floor((newNumber/Math.ceil(round))) * Math.ceil(round)) + round).toFixed(precision);
    newNumber = newNumber.toFixed(precision);

    let parts = newNumber.split("."),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands),
      cents = parts[1]
        ? hasPrecision
          ? decimal + parts[1]
          : parts[1] == 0
            ? ""
            : decimal + parts[1]
        : "";

    return dollars + cents;
  }

  switch (format.match(placeholderRegex)[1]) {
    case "amount":
      return formatWithDelimiters(
        price,
        defaultOption(precision, 2),
        thousands,
        decimal,
      );
    case "amount_no_decimals":
      return formatWithDelimiters(
        price,
        defaultOption(precision, 0),
        thousands,
        decimal,
      );
    case "amount_with_comma_separator":
      return formatWithDelimiters(
        price,
        defaultOption(precision, 2),
        defaultOption(thousands, "."),
        defaultOption(decimal, ","),
      );
    case "amount_no_decimals_with_comma_separator":
      return formatWithDelimiters(
        price,
        defaultOption(precision, 0),
        defaultOption(thousands, "."),
        defaultOption(decimal, ","),
      );
    case "amount_with_apostrophe_separator":
      return formatWithDelimiters(
        price,
        defaultOption(precision, 2),
        defaultOption(thousands, "'"),
        defaultOption(decimal, "."),
      );
    default:
      return formatWithDelimiters(
        price,
        defaultOption(precision, 2),
        thousands,
        decimal,
      );
  }
};
