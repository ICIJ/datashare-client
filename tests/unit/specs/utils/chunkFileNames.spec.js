import { chunkFileNames } from '@/utils/chunkFileNames'

describe('chunkFileNames', () => {
  it('strips leading underscores from chunk names', () => {
    expect(chunkFileNames({ name: '_commonjs-dynamic-modules' })).toBe('assets/commonjs-dynamic-modules-[hash].js')
  })

  it('keeps other chunk names untouched', () => {
    expect(chunkFileNames({ name: 'DocumentViewerDocx' })).toBe('assets/DocumentViewerDocx-[hash].js')
  })
})
