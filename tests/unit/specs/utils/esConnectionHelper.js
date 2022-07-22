import { castArray, join, map, noop, uniqueId } from 'lodash'
import elasticsearch from 'elasticsearch-browser'

import esMapping from './datashare_index_mappings.json'
import esSettings from './datashare_index_settings.json'

function slugger (value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
    .replace(/\s/g, '-')
}

function esConnectionHelper (indexOrIndices = []) {
  jest.setTimeout(1e4)
  const indices = castArray(indexOrIndices)

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

  return indices
}

function build (prefix = 'spec') {
  const randomKey = Math.random().toString(36).slice(2)
  const randomIndex = [prefix, randomKey, uniqueId()].map(slugger).join('-')
  const [index] = esConnectionHelper(randomIndex)
  return { index, es }
}

export default esConnectionHelper
// The default Elasticsearch client, shared between tests
export const es = new elasticsearch.Client({ host: process.env.VUE_APP_ES_HOST })
esConnectionHelper.es = es
esConnectionHelper.build = build
