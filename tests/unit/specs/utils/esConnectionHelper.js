import elasticsearch from 'elasticsearch-browser'
import esMapping from '@/datashare_index_mappings.json'
import noop from 'lodash/noop'

let es = new elasticsearch.Client({host: process.env.VUE_APP_ES_HOST})
let index = process.env.VUE_APP_ES_INDEX

const esConnectionHelper = () => {
  beforeAll(async () => {
    if (!await es.indices.exists({ index })) {
      await es.indices.create({ index })
      await es.indices.putMapping({ index, type: 'doc', body: esMapping })
    }
  })

  afterAll(async () => {
    // await es.indices.delete({ index, ignoreUnavailable: true })
    await es.deleteByQuery({ index, conflicts: 'proceed', refresh: true, body: {query: {match_all: {}}} })
  })

  beforeEach(async () => {
    await es.deleteByQuery({ index, conflicts: 'proceed', refresh: true, body: {query: {match_all: {}}} })
    // Easy Tiger! Elasticsearch can hardly follow
    await setTimeout(noop, 5000)
  })
}

esConnectionHelper.es = es

export default esConnectionHelper
