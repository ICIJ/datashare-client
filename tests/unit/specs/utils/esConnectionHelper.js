import elasticsearch from 'elasticsearch-browser'
import esMapping from '@/datashare_index_mappings.json'
import esSettings from '@/datashare_index_settings.json'
import noop from 'lodash/noop'
import map from 'lodash/map'

let es = new elasticsearch.Client({host: process.env.VUE_APP_ES_HOST})
let indices = [process.env.VUE_APP_ES_INDEX, process.env.VUE_APP_ES_ANOTHER_INDEX]

const esConnectionHelper = function () {
  jest.setTimeout(1e4)

  beforeAll(async () => {
    await Promise.all(
      map(indices, async index => {
        if (!await es.indices.exists({ index: index })) {
          await es.indices.create({ index: index, body: { settings: esSettings, mappings: esMapping } })
        }
      })
    )
  })

  beforeEach(async () => {
    await Promise.all(
      map(indices, async index => {
        await es.deleteByQuery({ index: index, conflicts: 'proceed', refresh: true, body: {query: {match_all: {}}} })
      })
    )
    // Easy Tiger! Elasticsearch can hardly follow
    await setTimeout(noop, 5000)
  })

  afterAll(async () => {
    await Promise.all(
      map(indices, async index => {
        await es.indices.delete({ index: index, ignoreUnavailable: true })
      })
    )
  })
}

esConnectionHelper.es = es

export default esConnectionHelper
