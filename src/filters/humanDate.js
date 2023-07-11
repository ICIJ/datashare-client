import moment from 'moment'

export function humanDate(date, locale) {
  return moment(date).locale(locale).format('Y/MM/DD')
}
export function humanLongDate(date, locale) {
  return moment(date).locale(locale).format('LLL')
}

export function humanShortDate(date, locale) {
  return moment(date).locale(locale).format('LLL')
}
