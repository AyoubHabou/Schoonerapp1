/**
 * Date Filtering Utility Functions
 * These functions help to correctly filter time entries by date
 */

/**
 * Normalizes a date by setting the time to 00:00:00
 * This allows for date comparison without time consideration
 * @param {Date|string} date - Date to normalize
 * @returns {Date|null} Normalized date or null if invalid
 */
export const normalizeDate = (date) => {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  } catch (e) {
    console.error('Error normalizing date:', e);
    return null;
  }
};

/**
 * Formats a date to YYYY-MM-DD for date inputs
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (e) {
    console.error('Error formatting date for input:', e);
    return '';
  }
};

/**
 * Filters time entries by date range
 * @param {Array} entries - Array of time entries
 * @param {Object} filter - Filter object with dateFrom and dateTo
 * @returns {Array} Filtered entries
 */
export const filterEntriesByDate = (entries, filter) => {
  if (!entries || !Array.isArray(entries)) return [];
  
  return entries.filter(entry => {
    if (!entry.clockInTime) return false;
    
    const entryDate = normalizeDate(entry.clockInTime);
    const dateFrom = filter.dateFrom ? normalizeDate(filter.dateFrom) : null;
    const dateTo = filter.dateTo ? normalizeDate(filter.dateTo) : null;
    
    return (
      (!dateFrom || entryDate >= dateFrom) &&
      (!dateTo || entryDate <= dateTo)
    );
  });
};

/**
 * Filters time entries by date, employee, and status
 * @param {Array} entries - Array of time entries
 * @param {Object} filter - Filter object with employee, status, dateFrom, dateTo
 * @returns {Array} Filtered entries
 */
export const filterTimeEntries = (entries, filter) => {
  if (!entries || !Array.isArray(entries)) return [];
  
  return entries.filter(entry => {
    if (!entry.clockInTime) return false;
    
    const entryDate = normalizeDate(entry.clockInTime);
    const dateFrom = filter.dateFrom ? normalizeDate(filter.dateFrom) : null;
    const dateTo = filter.dateTo ? normalizeDate(filter.dateTo) : null;
    
    return (
      (!filter.employee || (entry.User && entry.User.id === filter.employee) || entry.UserId === filter.employee) &&
      (!filter.status || entry.status === filter.status) &&
      (!dateFrom || entryDate >= dateFrom) &&
      (!dateTo || entryDate <= dateTo)
    );
  });
};

/**
 * Gets the current date as YYYY-MM-DD
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  const today = new Date();
  return formatDateForInput(today);
};

/**
 * Gets the date for 7 days ago
 * @returns {string} Date 7 days ago in YYYY-MM-DD format
 */
export const getLastWeekDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return formatDateForInput(date);
};

const dateUtils = {
  normalizeDate,
  formatDateForInput,
  filterEntriesByDate,
  filterTimeEntries,
  getCurrentDate,
  getLastWeekDate
};

export default dateUtils;