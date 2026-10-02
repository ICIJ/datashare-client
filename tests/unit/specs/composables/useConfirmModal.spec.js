import { mount, flushPromises } from '@vue/test-utils'

import { useConfirmModal } from '@/composables/useConfirmModal'

const showMock = vi.fn()
const setMock = vi.fn()
const hideMock = vi.fn()
const createMock = vi.fn(() => ({ show: showMock, set: setMock, hide: hideMock }))

vi.mock('bootstrap-vue-next', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useModal: () => ({ create: createMock, hide: vi.fn() }) }
})

describe('useConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComposable() {
    let composable
    mount({
      setup() {
        composable = useConfirmModal()
        return {}
      },
      template: '<div />'
    })
    return composable
  }

  function lastModalListeners() {
    const { component } = createMock.mock.calls.at(-1)[0]
    return component.props
  }

  it('resolves true when the modal emits ok', async () => {
    const { confirm } = mountComposable()
    const promise = confirm({ title: 'Sure?' })
    lastModalListeners().onOk({ trigger: 'ok' })
    await expect(promise).resolves.toBe(true)
  })

  it('resolves false when the modal emits cancel', async () => {
    const { confirm } = mountComposable()
    const promise = confirm({ title: 'Sure?' })
    lastModalListeners().onCancel({ trigger: 'cancel' })
    await expect(promise).resolves.toBe(false)
  })

  describe('with an okCallback', () => {
    let resolveCallback
    let okCallback

    beforeEach(() => {
      okCallback = vi.fn(() => {
        return new Promise((resolve) => {
          resolveCallback = resolve
        })
      })
    })

    it('does not pass the okCallback to the modal props', () => {
      const { show } = mountComposable()
      show({ title: 'Sure?', okCallback })
      expect(createMock.mock.calls.at(-1)[0]).not.toHaveProperty('okCallback')
    })

    it('keeps the modal open with a loading ok button while the callback runs', async () => {
      const { confirm } = mountComposable()
      confirm({ title: 'Sure?', okCallback })
      const event = { trigger: 'ok', preventDefault: vi.fn() }
      lastModalListeners().onOk(event)
      await flushPromises()
      expect(event.preventDefault).toHaveBeenCalled()
      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ okLoading: true, cancelDisabled: true }))
      expect(hideMock).not.toHaveBeenCalled()
    })

    it('resolves true and hides the modal once the callback is done', async () => {
      const { confirm } = mountComposable()
      const promise = confirm({ title: 'Sure?', okCallback })
      lastModalListeners().onOk({ trigger: 'ok', preventDefault: vi.fn() })
      await flushPromises()
      resolveCallback()
      await expect(promise).resolves.toBe(true)
      expect(hideMock).toHaveBeenCalledWith('ok')
    })

    it('ignores the hide event emitted alongside the prevented ok event', async () => {
      const resolved = vi.fn()
      const { show } = mountComposable()
      const promise = show({ title: 'Sure?', okCallback }).then(resolved)
      const listeners = lastModalListeners()
      listeners.onOk({ trigger: 'ok', preventDefault: vi.fn() })
      listeners.onHide({ trigger: 'ok' })
      await flushPromises()
      expect(resolved).not.toHaveBeenCalled()
      resolveCallback()
      await promise
      expect(resolved).toHaveBeenCalled()
    })

    it('runs the callback only once when ok is emitted twice', async () => {
      const { confirm } = mountComposable()
      confirm({ title: 'Sure?', okCallback })
      lastModalListeners().onOk({ trigger: 'ok', preventDefault: vi.fn() })
      lastModalListeners().onOk({ trigger: 'ok', preventDefault: vi.fn() })
      await flushPromises()
      expect(okCallback).toHaveBeenCalledTimes(1)
    })
  })
})
