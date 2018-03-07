import elasticsearch from 'elasticsearch-browser'
import documentPlugin from './document'

const client = new elasticsearch.Client({
  host: process.env.CONFIG.es_host || window.location.hostname + ':9200',
  // Use the custom api
  plugins: [ documentPlugin ]
})

export default client
