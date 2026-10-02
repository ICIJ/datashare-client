import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchBarInputDropdownForProjects from '@/components/Search/SearchBar/SearchBarInputDropdownForProjects'

describe('SearchBarInputDropdownForProjects', () => {
  let plugins
  beforeAll(() => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    const config = core.config
    plugins = core.plugins
    config.set('defaultProject', 'default-project')
    config.set('projects', [{ name: 'default-project' }, { name: 'banana-papers' }])
  })
  it('renders the placeholder when nothing is selected', () => {
    const wrapper = mount(SearchBarInputDropdownForProjects, {
      global: { plugins }
    })
    expect(wrapper.text()).toBe('Select a project')
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
  it('renders the placeholder if project does not exists', async () => {
    const wrapper = mount(SearchBarInputDropdownForProjects, {
      global: { plugins },
      props: { modelValue: { name: 'kiwi-papers' } }
    })
    expect(wrapper.text()).toBe('Select a project')
  })
  it('show default project if project does not exists when fallback is active', async () => {
    const wrapper = mount(SearchBarInputDropdownForProjects, {
      global: { plugins },
      props: { modelValue: { name: 'kiwi-papers' }, fallbackDefault: true }
    })
    expect(wrapper.text()).toBe('default-project')
  })
})
