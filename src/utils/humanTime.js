import moment from 'moment'

export function humanTime(date, locale) {
  return moment(date).locale(locale).format('HH:mm')
}
