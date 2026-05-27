import { mount } from '@vue/test-utils'

import { useSearchExecution } from '@/composables/useSearchExecution'
import { useSearchStore } from '@/store/modules'
import CoreSetup from '~tests/unit/CoreSetup'

describe('useSearchExecution', () => {
  let plugins

  beforeEach(() => {
    plugins = CoreSetup.init().useAll().plugins
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mountComposable() {
    let result
    const TestComponent = {
      setup() {
        result = useSearchExecution()
        return result
      },
      template: '<div></div>'
    }
    const wrapper = mount(TestComponent, { global: { plugins } })
    return { wrapper, result }
  }

  it('cancels the active search when the component unmounts', () => {
    const { wrapper } = mountComposable()
    const spy = vi.spyOn(useSearchStore(), 'cancelActiveSearch')

    expect(spy).not.toHaveBeenCalled()

    wrapper.unmount()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('exposes a cancel handle that delegates to the store', () => {
    const { result } = mountComposable()
    const spy = vi.spyOn(useSearchStore(), 'cancelActiveSearch')

    result.cancel()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
