import moment from 'moment'

export function humanTime(date) {
  return moment(date).format('HH:mm')
}
