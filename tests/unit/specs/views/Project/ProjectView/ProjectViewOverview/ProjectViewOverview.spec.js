import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectViewOverview from '@/views/Project/ProjectView/ProjectViewOverview/ProjectViewOverview'

describe('ProjectViewOverview.vue', () => {
  const name = 'local-datashare'

  async function build(routeName) {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    const { plugins, config } = core
    config.merge({ projects: [{ name, label: name }] })
    core.api.elasticsearch = {
      count: vi.fn().mockResolvedValue({ count: 1 }),
      maxExtractionDateByProject: vi.fn().mockResolvedValue({ aggregations: {} })
    }
    await core.router.push({ name: routeName, params: { name } })
    const wrapper = mount(ProjectViewOverview, {
      props: { name },
      global: { plugins, stubs: { RouterView: true, SearchBar: true, ProjectJumbotron: true } }
    })
    await flushPromises()
    return wrapper
  }

  // Insights sits on the bare project URL, which vue-router resolves through the
  // shared parent record, so its link reports itself active on every sibling tab
  // unless the entry opts out of the automatic class.
  // Mirrors the underline rule in main.scss:237-241: an automatic entry is
  // underlined by router-link's own classes, a manual one only by --active.
  // RouterLink still stamps router-link-active on a manual entry, so asserting
  // on that class alone would not reflect what the user sees.
  const isUnderlined = (entry) => {
    const manual = entry.classes('tab-group-navigation-entry--manual')
    if (manual) {
      return entry.classes('tab-group-navigation-entry--active')
    }
    return entry.find('.nav-link.router-link-active, .nav-link.active').exists()
  }

  const underlined = wrapper => wrapper
    .findAll('.tab-group-navigation-entry')
    .filter(isUnderlined)
    .map(entry => entry.text())

  it('underlines only Insights on the insights tab', async () => {
    const wrapper = await build('project.view.overview.insights')
    expect(underlined(wrapper)).toEqual(['Insights'])
  })

  it('underlines only Paths on the paths tab', async () => {
    const wrapper = await build('project.view.overview.paths')
    expect(underlined(wrapper)).toEqual(['Paths'])
  })

  it('underlines only Details on the details tab', async () => {
    const wrapper = await build('project.view.overview.details')
    expect(underlined(wrapper)).toEqual(['Details'])
  })
})
