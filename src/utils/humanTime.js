import moment from 'moment'

/**
 * Formats a date to a human-readable form: LT.
 *
 * @param {string|Date} date - The date to be formatted.
 * @param {string} locale - The locale code for formatting the date.
 * @returns {string} The formatted date.
 */
export function humanTime(date, locale) {
  return moment(date).locale(locale).format('LT')
}
