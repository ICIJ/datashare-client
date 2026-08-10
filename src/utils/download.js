/**
 * Trigger a browser download of in-memory content under `filename`, with no
 * round-trip to the server: the content becomes a blob URL that a detached
 * anchor clicks.
 */
export function downloadBlob(content, filename, type) {
  const anchor = window.document.createElement('a')
  anchor.href = URL.createObjectURL(new Blob([content], { type }))
  anchor.download = filename
  anchor.click()
}
