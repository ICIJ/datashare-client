import map from 'lodash/map'
import noop from 'lodash/noop'
import elasticsearch from 'elasticsearch-browser'

import esMapping from '@/datashare_index_mappings.json'
import esSettings from '@/datashare_index_settings.json'

const es = new elasticsearch.Client({ host: process.env.VUE_APP_ES_HOST })
const indices = [process.env.VUE_APP_ES_INDEX, process.env.VUE_APP_ES_ANOTHER_INDEX]

const esConnectionHelper = function () {
  jest.setTimeout(1e4)

  beforeAll(async () => {
    await Promise.all(
      map(indices, async index => {
        if (!await es.indices.exists({ index })) {
          await es.indices.create({ index, body: { settings: esSettings, mappings: esMapping } })
        }
      })
    )
  })

  beforeEach(async () => {
    await Promise.all(
      map(indices, async index => {
        await es.deleteByQuery({ index, conflicts: 'proceed', refresh: true, body: { query: { match_all: {} } } })
      })
    )
    // Easy Tiger! Elasticsearch can hardly follow
    await setTimeout(noop, 5000)
  })

  afterAll(async () => {
    await Promise.all(
      map(indices, async index => {
        await es.indices.delete({ index, ignoreUnavailable: true })
      })
    )
  })
}

esConnectionHelper.es = es

export default esConnectionHelper
