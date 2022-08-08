export default function humanNumber (n, { K = '%K', M = '%M', B = '%B' } = { }) {
  switch (true) {
  case n < 1e3:
    return n
  case n < 1e6:
    return K.replace('%', +(n / 1e3).toFixed(1))
  case n < 1e9:
    return M.replace('%', +(n / 1e6).toFixed(1))
  default:
    return B.replace('%', +(n / 1e9).toFixed(1))
  }
}
