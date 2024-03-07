import { castArray, join, noop, uniqueId } from 'lodash'
import elasticsearch from 'elasticsearch-browser'

import esMapping from './datashare_index_mappings.json'
import esSettings from './datashare_index_settings.json'
import esSettingsWindows from './datashare_index_settings_windows.json'

import { datasharePlugin } from '@/api/elasticsearch'

function slugger(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
    .replace(/\s/g, '-')
}

function esConnectionHelper(indexOrIndices = [], ifWindows = false) {
  vi.setConfig({ testTimeout: 1e4 })
  const indices = castArray(indexOrIndices)

  beforeAll(async () => {
    const settings = ifWindows ? esSettingsWindows : esSettings
    const body = { settings, mappings: esMapping }
    for (const index of indices) {
      if (!(await es.indices.exists({ index }))) {
        await es.indices.create({ index, body })
      }
    }
  })

  afterEach(async () => {
    // Empty all documents from the indices
    await es.deleteByQuery({
      index: join(indices),
      conflicts: 'proceed',
      refresh: true,
      body: { query: { match_all: {} } }
    })
    // Easy Tiger! Elasticsearch can hardly follow
    setTimeout(noop, 1e3 * indices.length)
  })

  afterAll(async () => {
    await es.indices.delete({ index: join(indices), ignoreUnavailable: true })
  })

  return indices
}

function build(prefix = 'spec', isWindows = false) {
  const randomKey = Math.random().toString(36).slice(2)
  const randomIndex = [prefix, randomKey, uniqueId()].map(slugger).join('-')
  const [index] = esConnectionHelper(randomIndex, isWindows)
  return { index, es }
}

export default esConnectionHelper
// The default Elasticsearch client, shared between tests
const es = new elasticsearch.Client({ host: process.env.VITE_ES_HOST, plugins: [datasharePlugin] })
esConnectionHelper.es = es
esConnectionHelper.build = build
