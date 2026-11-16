import { shallowRef } from 'vue'

import { useToolboxOffset } from '@/composables/useToolboxOffset'

describe('useToolboxOffset', () => {
  it('reads the height the toolbox exposes', () => {
    const toolbox = shallowRef({ height: 42 })
    const { toolboxHeight } = useToolboxOffset(toolbox)
    expect(toolboxHeight.value).toBe(42)
  })

  it('reads no height before the toolbox is mounted', () => {
    const toolbox = shallowRef(null)
    const { toolboxHeight } = useToolboxOffset(toolbox)
    expect(toolboxHeight.value).toBe(0)
  })

  it('exposes the height as a CSS variable', () => {
    const toolbox = shallowRef({ height: 42 })
    const { toolboxStyle } = useToolboxOffset(toolbox)
    expect(toolboxStyle.value).toEqual({ '--document-toolbox-height': '42px' })
  })
})
