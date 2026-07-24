import { mount } from '@vue/test-utils'

import BatchSearchErrorModal from '@/components/BatchSearch/BatchSearchErrorModal'
import { useBatchSearchErrorModal } from '@/composables/useBatchSearchErrorModal'

const showMock = vi.fn()
const createMock = vi.fn(() => ({ show: showMock }))

vi.mock('bootstrap-vue-next', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useModal: () => ({ create: createMock, hide: vi.fn() }) }
})

describe('useBatchSearchErrorModal', () => {
  beforeEach(() => {
    createMock.mockClear()
    showMock.mockClear()
  })

  function mountComposable() {
    let composable
    mount({ setup() {
      composable = useBatchSearchErrorModal()
      return {}
    },
    template: '<div />' })
    return composable
  }

  it('calls create() with modelValue: true so the modal is visible on open', () => {
    const { show } = mountComposable()
    show({ errorMessage: 'oops', errorQuery: 'bad query' })
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ modelValue: true }))
  })

  it('passes errorMessage and errorQuery as props to BatchSearchErrorModal', () => {
    const { show } = mountComposable()
    show({ errorMessage: 'oops', errorQuery: 'bad query' })
    const { component } = createMock.mock.calls[0][0]
    expect(component.type).toBe(BatchSearchErrorModal)
    expect(component.props).toMatchObject({ errorMessage: 'oops', errorQuery: 'bad query' })
  })
})
