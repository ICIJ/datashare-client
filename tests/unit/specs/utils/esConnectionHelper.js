import { castArray, join, map, noop } from 'lodash'
import elasticsearch from 'elasticsearch-browser'

import esMapping from '@/datashare_index_mappings.json'
import esSettings from '@/datashare_index_settings.json'

const es = new elasticsearch.Client({ host: process.env.VUE_APP_ES_HOST })

const esConnectionHelper = function (indexName = '') {
  jest.setTimeout(1e4)
  const indices = castArray(indexName)

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
    await es.deleteByQuery({ index: join(indices), conflicts: 'proceed', refresh: true, body: { query: { match_all: {} } } })
    // Easy Tiger! Elasticsearch can hardly follow
    await setTimeout(noop, 5000)
  })

  afterAll(async () => {
    await es.indices.delete({ index: join(indices), ignoreUnavailable: true })
  })
}

esConnectionHelper.es = es

export default esConnectionHelper
