import { useDataDir } from '@/composables/useDataDir'

// Mock `useCore`
vi.mock('@/composables/useCore', () => ({
  useCore: vi.fn(() => ({
    core: {
      getDefaultDataDir: vi.fn(() => '/data/datashare'),
      getMountedDataDir: vi.fn(() => '/mounted/datashare')
    }
  }))
}))

describe('useDataDir', () => {
  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('dataDir', () => {
    it('should return the default data directory', () => {
      const { dataDir } = useDataDir()
      expect(dataDir.value).toBe('/data/datashare')
    })
  })

  describe('mountedDataDir', () => {
    it('should return the mounted data directory', () => {
      const { mountedDataDir } = useDataDir()
      expect(mountedDataDir.value).toBe('/mounted/datashare')
    })
  })

  describe('getMountedPath', () => {
    it('should replace dataDir with mountedDataDir when path starts with dataDir', () => {
      const { getMountedPath } = useDataDir()
      const internalPath = '/data/datashare/documents/file.pdf'
      const mountedPath = getMountedPath(internalPath)
      expect(mountedPath).toBe('/mounted/datashare/documents/file.pdf')
    })

    it('should return the original path when it does not start with dataDir', () => {
      const { getMountedPath } = useDataDir()
      const externalPath = '/other/path/documents/file.pdf'
      const mountedPath = getMountedPath(externalPath)
      expect(mountedPath).toBe('/other/path/documents/file.pdf')
    })

    it('should only replace the first occurrence of dataDir', () => {
      const { getMountedPath } = useDataDir()
      const pathWithDuplicate = '/data/datashare/data/datashare/file.pdf'
      const mountedPath = getMountedPath(pathWithDuplicate)
      expect(mountedPath).toBe('/mounted/datashare/data/datashare/file.pdf')
    })

    it('should handle paths with special characters', () => {
      const { getMountedPath } = useDataDir()
      const specialPath = '/data/datashare/documents/file with spaces.pdf'
      const mountedPath = getMountedPath(specialPath)
      expect(mountedPath).toBe('/mounted/datashare/documents/file with spaces.pdf')
    })

    it('should handle paths that are exactly equal to dataDir', () => {
      const { getMountedPath } = useDataDir()
      const exactPath = '/data/datashare'
      const mountedPath = getMountedPath(exactPath)
      expect(mountedPath).toBe('/mounted/datashare')
    })

    it('should handle empty paths', () => {
      const { getMountedPath } = useDataDir()
      const emptyPath = ''
      const mountedPath = getMountedPath(emptyPath)
      expect(mountedPath).toBe('')
    })

    it('should handle paths with trailing slashes', () => {
      const { getMountedPath } = useDataDir()
      const pathWithSlash = '/data/datashare/documents/'
      const mountedPath = getMountedPath(pathWithSlash)
      expect(mountedPath).toBe('/mounted/datashare/documents/')
    })
  })
})
