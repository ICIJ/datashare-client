import { vi } from 'vitest'

import useMode from '@/composables/mode'
import { MODE_NAME } from '@/mode'

// Mock `useCore`
vi.mock('@/composables/core', () => ({
  useCore: vi.fn(() => ({
    core: {
      mode: { modeName: 'SERVER' }
    }
  }))
}))
describe('useMode', () => {
  it('should return correct computed values', () => {
    const { mode, isServer, isMode } = useMode()

    expect(mode.value.modeName).toBe(MODE_NAME.SERVER)
    expect(isServer.value).toBe(true)
    expect(isMode('SERVER')).toBe(true)
    expect(isMode('OTHER')).toBe(false)
  })
})
