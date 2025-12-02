export const flattenObject = (
  obj: Record<string, any>,
  prefix = ""
): Record<string, any> => {
  return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
    const pre = prefix.length ? `${prefix}.` : "";

    // Check if the value is an object and not null/array/date
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key]) &&
      !(obj[key] instanceof Date)
    ) {
      // Recursively flatten nested objects
      Object.assign(acc, flattenObject(obj[key], pre + key));
    } else {
      // Assign the value to the dot-notation key
      acc[pre + key] = obj[key];
    }

    return acc;
  }, {});
};
