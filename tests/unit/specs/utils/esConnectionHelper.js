import elasticsearch from 'elasticsearch-browser'
import esMapping from '@/datashare_index_mappings.json'
import esSettings from '@/datashare_index_settings.json'
import noop from 'lodash/noop'

let es = new elasticsearch.Client({host: process.env.VUE_APP_ES_HOST})
let index = process.env.VUE_APP_ES_INDEX
let anotherIndex = 'another-index'

const esConnectionHelper = function () {
  jest.setTimeout(1e4)

  beforeAll(async () => {
    if (!await es.indices.exists({ index: index })) {
      await es.indices.create({ index: index, body: { settings: esSettings } })
      await es.indices.putMapping({ index: index, type: 'doc', body: esMapping })
    }
    if (!await es.indices.exists({ index: anotherIndex })) {
      await es.indices.create({ index: anotherIndex, body: { settings: esSettings } })
      await es.indices.putMapping({ index: anotherIndex, type: 'doc', body: esMapping })
    }
  })

  afterAll(async () => {
    await es.indices.delete({ index, ignoreUnavailable: true })
    await es.indices.delete({ index: anotherIndex, ignoreUnavailable: true })
  })

  beforeEach(async () => {
    await es.deleteByQuery({ index, conflicts: 'proceed', refresh: true, body: {query: {match_all: {}}} })
    await es.deleteByQuery({ index: anotherIndex, conflicts: 'proceed', refresh: true, body: {query: {match_all: {}}} })
    // Easy Tiger! Elasticsearch can hardly follow
    await setTimeout(noop, 5000)
  })
}

esConnectionHelper.es = es

export default esConnectionHelper
