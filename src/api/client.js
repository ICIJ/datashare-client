import elasticsearch from 'elasticsearch-browser'
import docPlugin from './doc'

const client = new elasticsearch.Client({
  host: process.env.CONFIG.es_host || window.location.hostname + ':9200',
  // Use the custom api
  plugins: [ docPlugin ]
})

export default client
