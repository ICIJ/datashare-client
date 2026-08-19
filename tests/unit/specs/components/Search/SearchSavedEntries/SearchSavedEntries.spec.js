import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchSavedEntries from '@/components/Search/SearchSavedEntries/SearchSavedEntries'
import { isSavedSearchOpened, clearSavedSearchOpened } from '@/composables/useSearchFilter'

describe('SearchSavedEntries.vue', () => {
  let core, plugins

  const events = [
    {
      id: 'id_01',
      creationDate: 'creation_date_01',
      name: 'My saved search',
      uri: '/?q=hello&f%5BcontentType%5D=application%2Fpdf'
    }
  ]

  beforeEach(() => {
    clearSavedSearchOpened()
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
  })

  it('should keep every value of a multi-value filter in the saved search link', () => {
    const global = { plugins }
    const events = [
      {
        id: 'id_01',
        name: 'name_01',
        creationDate: 'creation_date_01',
        uri: '?q=*&f[language]=GERMAN&f[language]=VIETNAMESE'
      }
    ]
    const wrapper = mount(SearchSavedEntries, { props: { events }, global })
    const link = wrapper.findComponent({ name: 'RouterLink' })
    expect(link.props('to').query['f[language]']).toEqual(['GERMAN', 'VIETNAMESE'])
  })

  it('marks the navigation as opening a saved search before navigating (icij/datashare#2331)', async () => {
    const wrapper = mount(SearchSavedEntries, {
      props: { events },
      global: { plugins }
    })

    await wrapper.find('a.fw-medium').trigger('click')

    expect(isSavedSearchOpened()).toBe(true)
  })
})
