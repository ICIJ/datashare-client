import { createLocalVue, shallowMount, mount } from '@vue/test-utils'

import { Core } from '@/core'
import Document from '@/api/resources/Document'
import UserHistoryDocument from '@/pages/UserHistoryDocument'

describe('UserHistoryDocument.vue', () => {
  const { i18n, localVue, router } = Core.init(createLocalVue()).useAll()
  const propsData = {
    events: [
      {
        id: 'id_01',
        user: {
          id: 'user',
          name: null,
          email: null,
          provider: 'local'
        },
        creationDate: '2023-02-14T11:00:32.683+00:00',
        modificationDate: '2023-02-15T12:16:32.683+00:00',
        type: 'DOCUMENT',
        name: 'name_01',
        uri: '/ds/server-project1/uri_01'
      },
      {
        id: 'id_02',
        user: {
          id: 'user',
          name: null,
          email: null,
          provider: 'local'
        },
        creationDate: '2023-02-14T14:00:32.683+00:00',
        modificationDate: '2023-02-15T23:09:32.683+00:00',
        type: 'DOCUMENT',
        name: 'name_02',
        uri: '/ds/server-project2/uri_02'
      }
    ]
  }
  let wrapper

  it('should NOT display a list of documents', async () => {
    const propsData = { events: [] }
    wrapper = await shallowMount(UserHistoryDocument, { i18n, localVue, propsData, router })
    expect(wrapper.findAll('.user-history__list__item')).toHaveLength(0)
  })

  it('should display a list of documents sorted by descendant date and time', async () => {
    wrapper = await mount(UserHistoryDocument, { i18n, localVue, propsData, router })
    const elements = wrapper.findAll('.user-history__list__item')
    expect(elements).toHaveLength(2)
    expect(elements.at(0).find('.user-history__list__item__time').text()).toBe('23:09')
    expect(elements.at(1).find('.user-history__list__item__time').text()).toBe('12:16')
  })

  it('display the first row first cell containing date and time', async () => {
    wrapper = await mount(UserHistoryDocument, { i18n, localVue, propsData, router })
    const firstRow = wrapper.find('.user-history__list__item')
    const date = firstRow.find('.user-history__list__item__date')
    expect(date.exists()).toBe(true)
    expect(date.text()).toBe('2023/02/15')
    const time = firstRow.find('.user-history__list__item__time')
    expect(time.exists()).toBe(true)
    expect(time.text()).toBe('23:09')
  })
  it('display the first row second cell containing document thumbnail, name, link, external open button and haptic copy of the link', async () => {
    wrapper = await mount(UserHistoryDocument, { i18n, localVue, propsData, router })
    const firstRow = wrapper.find('.user-history__list__item')
    const link = firstRow.find('.user-history__list__item__link')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('name_02')
    const externalLink = firstRow.find('.user-history__list__item__external-link')
    expect(externalLink.exists()).toBe(true)
    expect(externalLink.vm.to.path).toBe('/ds/server-project2/uri_02')
    const hapticCopy = firstRow.find('.haptic-copy')
    expect(hapticCopy.exists()).toBe(true)
    expect(hapticCopy.vm.text).toBe('http://localhost:9009/#/ds/server-project2/uri_02')
  })

  it('should convert an event uri to a Document instance', async () => {
    wrapper = await shallowMount(UserHistoryDocument, { i18n, localVue, propsData, router })

    const uri = '/ds/local-datashare/foo/bar'
    const document = wrapper.vm.eventAsDocument({ uri })
    expect(document).toBeInstanceOf(Document)
    expect(document.index).toBe('local-datashare')
    expect(document.id).toBe('foo')
    expect(document.routing).toBe('bar')
  })

  it('should convert an event uri to a Document instance, ignore query params', async () => {
    wrapper = await shallowMount(UserHistoryDocument, { i18n, localVue, propsData, router })

    const uri = '/ds/local-datashare/foo/bar?q=baz'
    const document = wrapper.vm.eventAsDocument({ uri })
    expect(document).toBeInstanceOf(Document)
    expect(document.index).toBe('local-datashare')
    expect(document.id).toBe('foo')
    expect(document.routing).toBe('bar')
  })
  describe('Server mode', () => {
    it('should display a third column containing project name', async () => {
      wrapper = await shallowMount(UserHistoryDocument, { i18n, localVue, propsData, router })
      expect(wrapper.vm.displayedFields).toHaveLength(2)
      const computed = { isServer: () => true }
      wrapper = await shallowMount(UserHistoryDocument, { i18n, localVue, propsData, router, computed })
      expect(wrapper.vm.displayedFields).toHaveLength(3)
    })

    it('should display the project name based on the uri', async () => {
      const computed = { isServer: () => true }
      wrapper = await mount(UserHistoryDocument, { i18n, localVue, propsData, router, computed })
      const projectLink = wrapper.find('.user-history__list__item__project')
      expect(projectLink.text()).toEqual('server-project2')
    })

    it('adds a link on the project name to create a search based on the project', async () => {
      const computed = { isServer: () => true }
      wrapper = await mount(UserHistoryDocument, { i18n, localVue, propsData, router, computed })
      const projectLink = wrapper.find('.user-history__list__item__project')
      expect(projectLink.attributes().href).toEqual('#/?q=%2a&indices=server-project2')
    })
  })
})
