import moment from 'moment'

export function humanDate(date, locale) {
  return moment(date).locale(locale).format('Y/MM/DD')
}
