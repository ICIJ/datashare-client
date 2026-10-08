import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import PathTreeViewDocument from '@/components/PathTree/PathTreeView/PathTreeViewDocument'

const show = vi.fn()
vi.mock('@/composables/useDocumentModal', () => ({
  useDocumentModal: () => ({ show, hide: vi.fn() })
}))

describe('PathTreeViewDocument.vue', () => {
  const core = CoreSetup.init().useAll()

  const mountDocument = () => {
    return mount(PathTreeViewDocument, {
      props: {
        entry: { _id: 'foo', _index: 'local-datashare', _source: { path: '/data/foo.txt', contentType: 'text/plain' } }
      },
      global: { plugins: core.plugins }
    })
  }

  const findLabel = wrapper => wrapper.find('.path-tree-view-entry-name__value__label')

  beforeEach(() => show.mockClear())
  afterEach(() => vi.restoreAllMocks())

  it('opens the document modal when the name is clicked without a selection', async () => {
    await findLabel(mountDocument()).trigger('click')

    expect(show).toHaveBeenCalledTimes(1)
  })

  it('does not open the document modal when the click ends a selection of the name', async () => {
    const wrapper = mountDocument()
    const label = findLabel(wrapper)
    vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false, anchorNode: label.element })

    await label.trigger('click')

    expect(show).not.toHaveBeenCalled()
  })
})
