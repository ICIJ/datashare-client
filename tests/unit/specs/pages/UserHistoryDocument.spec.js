import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import Document from '@/api/resources/Document'
import UserHistoryDocument from '@/pages/UserHistoryDocument'

describe('UserHistoryDocument.vue', () => {
  const { i18n, localVue, router } = Core.init(createLocalVue()).useAll()
  const propsData = {
    events: [{
      id: 'id_01',
      user: {
        id: 'user',
        name: null,
        email: null,
        provider: 'local'
      },
      creationDate: 'creation_date_01',
      modificationDate: 'modification_date_01',
      type: 'DOCUMENT',
      name: 'name_01',
      uri: 'uri_01'
    }, {
      id: 'id_02',
      user: {
        id: 'user',
        name: null,
        email: null,
        provider: 'local'
      },
      creationDate: 'creation_date_02',
      modificationDate: 'modification_date_02',
      type: 'DOCUMENT',
      name: 'name_02',
      uri: 'uri_02'
    }]
  }
  let wrapper = null

  beforeEach(async () => {
    wrapper = await shallowMount(UserHistoryDocument, { i18n, localVue, propsData, router })
  })

  it('should NOT display a list of documents', async () => {
    const propsData = { events: [] }
    wrapper = await shallowMount(UserHistoryDocument, { i18n, localVue, propsData, router })
    expect(wrapper.findAll('.user-history__list__item')).toHaveLength(0)
  })

  it('should display a list of documents', async () => {
    expect(wrapper.findAll('.user-history__list__item')).toHaveLength(2)
  })

  it('should convert an event uri to a Document instance', async () => {
    const uri = '/ds/local-datashare/foo/bar'
    const document = wrapper.vm.eventAsDocument({ uri })
    expect(document).toBeInstanceOf(Document)
    expect(document.index).toBe('local-datashare')
    expect(document.id).toBe('foo')
    expect(document.routing).toBe('bar')
  })

  it('should convert an event uri to a Document instance, ignore query params', async () => {
    const uri = '/ds/local-datashare/foo/bar?q=baz'
    const document = wrapper.vm.eventAsDocument({ uri })
    expect(document).toBeInstanceOf(Document)
    expect(document.index).toBe('local-datashare')
    expect(document.id).toBe('foo')
    expect(document.routing).toBe('bar')
  })
})
