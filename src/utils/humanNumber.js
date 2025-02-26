import { identity } from 'lodash'

export default function humanNumber(value, { K = '%K', M = '%M', B = '%B' } = {}, n = identity) {
  switch (true) {
    case value < 1e3:
      return n(value)
    case value < 1e6:
      return K.replace('%', +(value / 1e3).toFixed(1))
    case value < 1e9:
      return M.replace('%', +(value / 1e6).toFixed(1))
    default:
      return B.replace('%', +(value / 1e9).toFixed(1))
  }
}
