import { mount } from '@vue/test-utils'

import { useSearchProperties } from '@/composables/useSearchProperties'
import CoreSetup from '~tests/unit/CoreSetup'

describe('useSearchProperties', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComposable() {
    let result
    const TestComponent = {
      setup() {
        result = useSearchProperties()
        return result
      },
      template: '<div></div>'
    }
    mount(TestComponent, { global: { plugins } })
    return result
  }

  it('always orders the project field last', () => {
    const { fields } = mountComposable()

    expect(fields.at(-1).key).toBe('project')
  })
})
