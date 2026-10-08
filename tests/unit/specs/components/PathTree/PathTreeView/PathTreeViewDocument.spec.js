import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import PathTreeViewDocument from '@/components/PathTree/PathTreeView/PathTreeViewDocument'

const show = vi.fn()
vi.mock('@/composables/useDocumentModal', () => ({
  useDocumentModal: () => ({ show, hide: vi.fn() })
}))

describe('PathTreeViewDocument.vue', () => {
  const core = CoreSetup.init().useAll().useRouterWithoutGuards()

  const mountDocument = (props = {}) => mount(PathTreeViewDocument, {
    props: {
      entry: { _id: 'foo', _index: 'local-datashare', _source: { path: '/data/foo.txt', contentType: 'text/plain' } },
      ...props
    },
    global: { plugins: core.plugins }
  })

  const findName = wrapper => wrapper.find('[data-entry-name]')

  beforeEach(() => show.mockClear())
  afterEach(() => vi.restoreAllMocks())

  it('opens the document in a modal, once, when its name is clicked', async () => {
    const push = vi.spyOn(core.router, 'push')

    await findName(mountDocument()).trigger('click')

    expect(show).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it('does not open the document when a highlight of its name is released', async () => {
    const wrapper = mountDocument()
    vi.spyOn(window, 'getSelection').mockReturnValue({
      isCollapsed: false,
      anchorNode: findName(wrapper).element,
      focusNode: findName(wrapper).element
    })

    await findName(wrapper).trigger('click')

    expect(show).not.toHaveBeenCalled()
  })

  it('opens the document in a modal when the row is clicked', async () => {
    const push = vi.spyOn(core.router, 'push')

    await mountDocument().find('.path-tree-view-entry__link').trigger('click')

    expect(show).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it('selects the row from its name in select mode, where nothing else opens it', async () => {
    const wrapper = mountDocument({ selectMode: true })

    await findName(wrapper).trigger('click')

    expect(show).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:selected')).toHaveLength(1)
  })
})
