export default function humanSize(
  size,
  showBytes = false,
  { B = '% B', KB = '% KB', MB = '% MB', GB = '% GB', TB = '% TB' } = {}
) {
  if (size === -1 || size === '' || size === undefined || size === null) return 'unknown'
  const unitIndex = Math.floor(size === 0 ? 0 : Math.log(size) / Math.log(1024))
  const value = (size / Math.pow(1024, unitIndex)).toFixed(2)
  const addUnit = (v, i) => String([B, KB, MB, GB, TB][i]).replace('%', v)
  if (unitIndex === 0 || !showBytes) {
    return addUnit(value, unitIndex)
  } else {
    return `${addUnit(value, unitIndex)} (${addUnit(size, 0)})`
  }
}
