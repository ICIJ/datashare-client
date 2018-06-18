import elasticsearch from 'elasticsearch-browser'
import esMapping from '@/datashare_index_mappings.json'

let es = new elasticsearch.Client({host: process.env.CONFIG.es_host})

const esConnectionHelper = () => {
  before(async () => {
    await es.indices.create({index: process.env.CONFIG.es_index})
    await es.indices.putMapping({index: process.env.CONFIG.es_index, type: 'doc', body: esMapping})
  })

  after(async () => {
    await es.indices.delete({index: process.env.CONFIG.es_index})
  })

  beforeEach(async () => {
    await es.deleteByQuery({index: process.env.CONFIG.es_index, conflicts: 'proceed', refresh: true, body: {query: {match_all: {}}}})
  })
}

esConnectionHelper.es = es

export default esConnectionHelper
