export const replaceTextToVariable = (text) => {
  if (!text) return "";
  let result = text.replace(/\s/gi, "_");
  return result.toLowerCase();
};
