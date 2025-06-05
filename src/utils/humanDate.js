import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import 'dayjs/locale/fr'
import 'dayjs/locale/es'
import 'dayjs/locale/ja'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

export const FORMAT_SHORT = 'short'
export const FORMAT_MONTH = 'month'
export const FORMAT_LONG = 'long'
export const FORMAT_FROM_NOW = 'fromNow'

/**
 * Formats a date to a human-readable form: Y/MM/DD.
 *
 * @param {string|Date} date - The date to be formatted.
 * @param {string} locale - The locale code for formatting the date.
 * @returns {string} The formatted date.
 */
export function humanDate(date, locale) {
  return dayjs(date).locale(locale).format('Y/MM/DD')
}

/**
 * Formats a date to only show the month and the year
 *
 * @param {string|Date} date - The date to be formatted.
 * @param {string} locale - The locale code for formatting the date.
 * @returns {string} The formatted date.
 */
export function humanMonthDate(date, locale) {
  return dayjs(date).locale(locale).format('MMM YYYY')
}

/**
 * Formats a date to a more verbose human-readable form, including the day of the week, month, day, and year.
 *
 * @param {string|Date} date - The date to be formatted.
 * @param {string} locale - The locale code for formatting the date.
 * @returns {string} The formatted date.
 */
export function humanLongDate(date, locale) {
  return dayjs(date).locale(locale).format('LLL')
}

/**
 * Formats a date to a shorter human-readable form, including the month, day, and year.
 *
 * @param {string|Date} date - The date to be formatted.
 * @param {string} locale - The locale code for formatting the date.
 * @returns {string} The formatted date.
 */
export function humanShortDate(date, locale) {
  return dayjs(date).locale(locale).format('ll')
}

/**
 * Formats a date to a human-readable form: LT.
 *
 * @param {string|Date} date - The date to be formatted.
 * @param {string} locale - The locale code for formatting the date.
 * @returns {string} The formatted date.
 */
export function humanTime(date, locale) {
  return dayjs(date).locale(locale).format('LT')
}

/**
 * Checks if a date is valid.
 *
 * @param {string|Date} date - The date to be validated.
 * @returns {boolean} True if the date is valid, false otherwise.
 */
export function isDateValid(date) {
  return dayjs(date).isValid()
}

/**
 * Returns a string representing the time from now to the given date.
 *
 * @param {string|Date} date - The date to be compared with now.
 * @param {string} locale - The locale code for formatting the string.
 * @param {boolean} [ago=false] - If true, includes the word 'ago' in the returned string.
 * @returns {string} The formatted string representing the time from now to the given date.
 */
export function fromNow(date, locale, ago = false) {
  return dayjs(date).locale(locale).fromNow(ago)
}
