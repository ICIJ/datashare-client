// Datashare's web server refuses to serve any path starting with "_".
export function chunkFileNames({ name }) {
  return `assets/${name.replace(/^_+/, '')}-[hash].js`
}
