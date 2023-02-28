import moment from 'moment'

export function humanDate(date) {
  return moment(date).format('Y/MM/DD')
}
