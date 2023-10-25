import moment from 'moment'

/**
 * Formats a date to a human-readable form: Y/MM/DD.
 *
 * @param {string|Date} date - The date to be formatted.
 * @param {string} locale - The locale code for formatting the date.
 * @returns {string} The formatted date.
 */
export function humanDate(date, locale) {
  return moment(date).locale(locale).format('Y/MM/DD')
}

/**
 * Formats a date to a more verbose human-readable form, including the day of the week, month, day, and year.
 *
 * @param {string|Date} date - The date to be formatted.
 * @param {string} locale - The locale code for formatting the date.
 * @returns {string} The formatted date.
 */
export function humanLongDate(date, locale) {
  return moment(date).locale(locale).format('LLL')
}

/**
 * Formats a date to a shorter human-readable form, including the month, day, and year.
 *
 * @param {string|Date} date - The date to be formatted.
 * @param {string} locale - The locale code for formatting the date.
 * @returns {string} The formatted date.
 */
export function humanShortDate(date, locale) {
  return moment(date).locale(locale).format('LL')
}

/**
 * Checks if a date is valid.
 *
 * @param {string|Date} date - The date to be validated.
 * @returns {boolean} True if the date is valid, false otherwise.
 */
export function isDateValid(date) {
  return moment(date).isValid()
}
