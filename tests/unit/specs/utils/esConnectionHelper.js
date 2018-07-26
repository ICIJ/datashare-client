import elasticsearch from 'elasticsearch-browser'
import esMapping from '@/datashare_index_mappings.json'

let es = new elasticsearch.Client({host: process.env.VUE_APP_ES_HOST})
let esIndex = process.env.VUE_APP_ES_INDEX

const esConnectionHelper = () => {
  before(async () => {
    if (await es.indices.exists({index: esIndex})) {
      await es.indices.delete({index: esIndex})
    }
    await es.indices.create({index: esIndex})
    await es.indices.putMapping({index: esIndex, type: 'doc', body: esMapping})
  })

  after(async () => {
    await es.indices.delete({index: esIndex})
  })

  beforeEach(async () => {
    await es.deleteByQuery({index: esIndex, conflicts: 'proceed', refresh: true, body: {query: {match_all: {}}}})
  })
}

esConnectionHelper.es = es

export default esConnectionHelper
