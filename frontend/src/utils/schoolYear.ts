export const getSchoolYearOptions = () => {
  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  const endYear = currentYear + 5;
  const years = [];

  for (let year = startYear; year <= endYear; year++) {
    years.push(`${year}-${year + 1}`);
  }
  return years.reverse();
};

export const getCurrentSchoolYear = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();

  // School Year starts in June/August.
  // If we are in Jan-May, we are in the previous year's school year (e.g., May 2025 is AY 2024-2025)
  // If we are in June-Dec, we are in the current year's school year (e.g., June 2025 is AY 2025-2026)

  // Cutoff month: June (Month 5)
  if (month >= 5) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};
