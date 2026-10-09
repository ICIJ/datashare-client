import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'

describe('RouterLinkDocument.vue', () => {
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
  })

  function mountLink(attrs = {}) {
    return mount(RouterLinkDocument, {
      global: { plugins: core.plugins },
      props: { index: 'local-datashare', id: 'doc-id', name: 'document' },
      attrs
    })
  }

  it('navigates with the router so the history entry gets a router position', async () => {
    const push = vi.spyOn(core.router, 'push')
    const wrapper = mountLink()

    await wrapper.find('a').trigger('click')

    expect(push).toHaveBeenCalledTimes(1)
  })

  it('lets the browser open the link when it targets another window', async () => {
    const push = vi.spyOn(core.router, 'push')
    const wrapper = mountLink({ target: '_blank' })

    await wrapper.find('a').trigger('click')

    expect(push).not.toHaveBeenCalled()
  })
})
