import { mount } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchBreadcrumbFormFooter from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormFooter'

describe('SearchBreadcrumbFormFooter', () => {
  let core, plugins

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountFooter(props = {}) {
    return mount(SearchBreadcrumbFormFooter, { global: { plugins }, props })
  }

  it('does not render the "Unlock all" button when there are no locked filters', () => {
    const wrapper = mountFooter({ lockedFiltersCount: 0 })

    expect(wrapper.text()).not.toContain('Unlock all')
  })

  it('renders "Unlock all (N)" with the current lock count', () => {
    const wrapper = mountFooter({ lockedFiltersCount: 3 })

    expect(wrapper.text()).toContain('Unlock all (3)')
  })

  it('emits unlock:all when the button is clicked', async () => {
    const wrapper = mountFooter({ lockedFiltersCount: 2 })

    const buttons = wrapper.findAllComponents(ButtonIcon)
    const unlockButton = buttons.find(button => button.text().includes('Unlock all'))
    await unlockButton.trigger('click')

    expect(wrapper.emitted('unlock:all')).toHaveLength(1)
  })
})
