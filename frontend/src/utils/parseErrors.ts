export const parseError = (err: any) => {
  if (err.status === 400 && err.response?.data?.error) {
    const { message, details } = err.response.data.error;
    if (message !== "Validation errors") return { global: message };

    // If details is an object, it's field-specific; otherwise global
    return typeof details === "object"
      ? details
      : { global: details || "Invalid input." };
  }
  return { global: "Something went wrong!" };
};
