import { mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import DocumentViewTabsMetadata from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata'

describe('DocumentViewTabsMetadata.vue', () => {
  const { index, es } = esConnectionHelper.build()
  let wrapper, core

  beforeAll(() => {
    const api = { elasticsearch: es }
    core = CoreSetup.init(api).useAll()
  })

  afterEach(() => {
    wrapper.unmount()
    core.store.commit('document/reset')
  })

  it('should display document with 7 metadata', async () => {
    const id = '/home/datashare/data/foo.txt'
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await core.store.dispatch('document/get', { id, index })

    wrapper = mount(DocumentViewTabsMetadata, {
      global: {
        plugins: core.plugins
      }
    })

    const inputs = wrapper.findAll('.document-view-tabs-metadata__entry')
    expect(inputs).toHaveLength(7)
  })

  it('should display document with 7 metadata (including language)', async () => {
    const id = '/home/datashare/data/foo.txt'
    const document = new IndexedDocument(id, index).withLanguage('FRENCH')
    await letData(es).have(document).commit()
    await core.store.dispatch('document/get', { id, index })

    wrapper = mount(DocumentViewTabsMetadata, {
      global: {
        plugins: core.plugins
      }
    })

    const inputs = wrapper.findAll('.document-metadata__value')
    const values = inputs.map((input) => input.text())
    expect(values).toContain('French')
  })

  it('should filter the list with a query', async () => {
    const id = '/home/datashare/data/foo.txt'
    const document = new IndexedDocument(id, index)
    await letData(es).have(document).commit()
    await core.store.dispatch('document/get', { id, index })

    wrapper = mount(DocumentViewTabsMetadata, {
      global: {
        plugins: core.plugins
      }
    })

    wrapper.vm.q = 'language'
    await wrapper.vm.$nextTick()
    const inputs = wrapper.findAll('.document-view-tabs-metadata__entry')
    expect(inputs).toHaveLength(7)
  })
})
