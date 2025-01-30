import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchBarInputDropdownForProjects from '@/components/Search/SearchBar/SearchBarInputDropdownForProjects'

describe('SearchBarInputDropdownForProjects', () => {
  let plugins
  beforeAll(() => {
    const core = CoreSetup.init().useAll().useRouter()
    const config = core.config
    plugins = core.plugins
    config.set('defaultProject', 'default-project')
    config.set('projects', [{ name: 'default-project' }, { name: 'banana-papers' }])
  })
  it('renders correctly', () => {
    const wrapper = mount(SearchBarInputDropdownForProjects, {
      global: { plugins }
    })
    expect(wrapper.text()).toBe('')
  })
  it('fallbacks on default project if no selection', async () => {
    const wrapper = mount(SearchBarInputDropdownForProjects, {
      global: { plugins },
      props: { fallbackDefault: true }
    })
    expect(wrapper.text()).toBe('default-project')
  })
  it('selects existing project', async () => {
    const wrapper = mount(SearchBarInputDropdownForProjects, {
      global: { plugins },
      props: { modelValue: { name: 'banana-papers' } }
    })
    expect(wrapper.text()).toBe('banana-papers')
  })
  it('is empty if project does not exists', async () => {
    const wrapper = mount(SearchBarInputDropdownForProjects, {
      global: { plugins },
      props: { modelValue: { name: 'kiwi-papers' } }
    })
    expect(wrapper.text()).toBe('')
  })
  it('show default project if project does not exists when fallback is active', async () => {
    const wrapper = mount(SearchBarInputDropdownForProjects, {
      global: { plugins },
      props: { modelValue: { name: 'kiwi-papers' }, fallbackDefault: true }
    })
    expect(wrapper.text()).toBe('default-project')
  })
})
