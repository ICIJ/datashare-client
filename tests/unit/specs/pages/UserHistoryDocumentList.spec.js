import { shallowMount, mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Document from '@/api/resources/Document'
import UserHistoryDocumentList from '@/pages/UserHistoryDocumentList'

describe('UserHistoryDocumentList.vue', () => {
  const props = {
    events: [
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
      },
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
      }
    ]
  }

  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouter()
    core.config.set('projects', [{ name: 'server-project1' }, { name: 'server-project2' }])
  })

  it('should NOT display a list of documents', () => {
    const props = { events: [] }
    const wrapper = shallowMount(UserHistoryDocumentList, { global: { plugins: core.plugins }, props })
    expect(wrapper.findAll('.user-history-document-list__list__item')).toHaveLength(0)
  })

  it('should display a list of two documents', () => {
    const wrapper = mount(UserHistoryDocumentList, { global: { plugins: core.plugins }, props })
    const elements = wrapper.findAll('.user-history-document-list__list__item')
    expect(elements).toHaveLength(2)
    expect(elements.at(0).find('.user-history-document-list__list__item__time').text()).toBe('23:09')
    expect(elements.at(1).find('.user-history-document-list__list__item__time').text()).toBe('12:16')
  })

  it('display the first row first cell containing date and time', () => {
    const wrapper = mount(UserHistoryDocumentList, { global: { plugins: core.plugins }, props })
    const firstRow = wrapper.find('.user-history-document-list__list__item')
    const date = firstRow.find('.user-history-document-list__list__item__date')
    expect(date.exists()).toBe(true)
    expect(date.text()).toBe('2023/02/15')
    const time = firstRow.find('.user-history-document-list__list__item__time')
    expect(time.exists()).toBe(true)
    expect(time.text()).toBe('23:09')
  })
  it('display the first row second cell containing document thumbnail, name, link, and action buttons', () => {
    const wrapper = mount(UserHistoryDocumentList, { global: { plugins: core.plugins }, props })
    const firstRow = wrapper.find('.user-history-document-list__list__item')
    const link = firstRow.find('.user-history-document-list__list__item__link')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('name_02')
    const actionButtons = firstRow.find('.user-history-document-list__list__item__actions')
    expect(actionButtons.exists()).toBe(true)
  })

  it('should convert an event uri to a Document instance', () => {
    const wrapper = shallowMount(UserHistoryDocumentList, { global: { plugins: core.plugins }, props })

    const uri = '/ds/local-datashare/foo/bar'
    const document = wrapper.vm.eventAsDocument({ uri })
    expect(document).toBeInstanceOf(Document)
    expect(document.index).toBe('local-datashare')
    expect(document.id).toBe('foo')
    expect(document.routing).toBe('bar')
  })

  it('should convert an event uri to a Document instance, ignore query params', () => {
    const wrapper = shallowMount(UserHistoryDocumentList, { global: { plugins: core.plugins }, props })

    const uri = '/ds/local-datashare/foo/bar?q=baz'
    const document = wrapper.vm.eventAsDocument({ uri })
    expect(document).toBeInstanceOf(Document)
    expect(document.index).toBe('local-datashare')
    expect(document.id).toBe('foo')
    expect(document.routing).toBe('bar')
  })
  describe('Server mode', () => {
    beforeEach(async () => {
      core.config.set('mode', 'SERVER')
      await flushPromises()
    })

    it('should display a third column containing project name', () => {
      const wrapper = shallowMount(UserHistoryDocumentList, { global: { plugins: core.plugins }, props })
      expect(wrapper.vm.fields).toHaveLength(3)
    })

    it('should display the project name based on the uri', () => {
      const wrapper = mount(UserHistoryDocumentList, { global: { plugins: core.plugins }, props })
      const projectLink = wrapper.find('.user-history-document-list__list__item__project')
      const projectDisplay = projectLink.find('.project-label__display')
      expect(projectDisplay.text()).toEqual('Server Project 2')
    })

    it('adds a link on the project name to create a search based on the project', () => {
      const wrapper = mount(UserHistoryDocumentList, { global: { plugins: core.plugins }, props })
      const projectLink = wrapper.find('.user-history-document-list__list__item__project')
      expect(projectLink.attributes('href')).toEqual('#/project/server-project2')
    })
  })
})
