export default function (size, showBytes = false) {
  if (size === -1 || size === '') return 'unknown'
  const unitIndex = Math.floor(size === 0 ? 0 : Math.log(size) / Math.log(1024))
  const value = (size / Math.pow(1024, unitIndex)).toFixed(2)
  const unit = ['B', 'kB', 'MB', 'GB', 'TB'][unitIndex]
  return unitIndex === 0 || !showBytes ? `${size} B` : `${value} ${unit} (${size} B)`
}
