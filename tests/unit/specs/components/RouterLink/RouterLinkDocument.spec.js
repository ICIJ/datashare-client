import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'

const { showDocumentModal } = vi.hoisted(() => ({ showDocumentModal: vi.fn() }))

vi.mock('@/composables/useDocumentModal', () => ({
  useDocumentModal: () => ({ show: showDocumentModal })
}))

describe('RouterLinkDocument.vue', () => {
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
  })

  function mountLink({ props = {}, attrs = {} } = {}) {
    return mount(RouterLinkDocument, {
      global: { plugins: core.plugins },
      props: { index: 'local-datashare', id: 'doc-id', name: 'document', q: 'foo', ...props },
      attrs
    })
  }

  it('navigates with the router so the history entry gets a router position', async () => {
    const push = vi.spyOn(core.router, 'push')
    const wrapper = mountLink()

    await wrapper.find('a').trigger('click')

    expect(push).toHaveBeenCalledWith({
      name: 'document',
      params: { index: 'local-datashare', id: 'doc-id', routing: undefined },
      query: { q: 'foo' }
    })
  })

  it('opens the modal without navigating when modal is set', async () => {
    const push = vi.spyOn(core.router, 'push')
    const wrapper = mountLink({ props: { modal: true } })

    await wrapper.find('a').trigger('click')

    expect(showDocumentModal).toHaveBeenCalledWith('local-datashare', 'doc-id', undefined, 'foo')
    expect(push).not.toHaveBeenCalled()
  })

  it.each(['_blank', '_top', 'datashare-doc'])('lets the browser open the link when it targets %s', async (target) => {
    const push = vi.spyOn(core.router, 'push')
    const wrapper = mountLink({ attrs: { target } })

    await wrapper.find('a').trigger('click')

    expect(push).not.toHaveBeenCalled()
  })
})
