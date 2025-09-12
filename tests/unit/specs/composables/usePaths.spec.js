import { ref } from 'vue'

import { usePath } from '@/composables/usePath'
import { useConfig } from '@/composables/useConfig'

describe('usePath', () => {
  beforeEach(() => {
    useConfig().set('pathSeparator', '/')
  })

  it('returns the same ref instance passed in', () => {
    const selected = ref([])
    const { selectedPaths } = usePath(selected)
    expect(selectedPaths).toBe(selected)
  })

  it('exposes default path separator from config ("/")', () => {
    const { pathSeparator } = usePath(ref([]))
    expect(pathSeparator.value).toBe('/')
  })

  it('supports custom path separator from config (e.g., "\\\\")', () => {
    useConfig().set('pathSeparator', '\\')
    const { pathSeparator } = usePath(ref([]))
    expect(pathSeparator.value).toBe('\\')
  })

  describe('getBasename', () => {
    it('returns last segment for POSIX paths', () => {
      const { getBasename } = usePath(ref([]))
      expect(getBasename('/a/b/c.txt')).toBe('c.txt')
      expect(getBasename('/a/b/')).toBe('b')
      expect(getBasename('/')).toBe('')
      expect(getBasename('')).toBe('')
      expect(getBasename('notes.md')).toBe('notes.md')
    })

    it('returns last segment for Windows-style paths', () => {
      useConfig().set('pathSeparator', '\\')
      const { getBasename } = usePath(ref([]))
      expect(getBasename('C:\\foo\\bar\\readme.md')).toBe('readme.md')
      expect(getBasename('C:\\foo\\bar\\')).toBe('bar')
    })
  })

  describe('normalizeDirectory', () => {
    it('ensures a single trailing "/" and removes duplicates', () => {
      const { normalizeDirectory } = usePath(ref([]))
      expect(normalizeDirectory('/a/b')).toBe('/a/b/')
      expect(normalizeDirectory('/a/b///')).toBe('/a/b/')
      expect(normalizeDirectory('/')).toBe('/') // root stays single slash
    })

    it('ensures a single trailing "\\" on Windows paths', () => {
      useConfig().set('pathSeparator', '\\')
      const { normalizeDirectory } = usePath(ref([]))
      expect(normalizeDirectory('C:\\a\\b')).toBe('C:\\a\\b\\')
      expect(normalizeDirectory('C:\\a\\b\\\\\\\\')).toBe('C:\\a\\b\\')
      expect(normalizeDirectory('C:\\')).toBe('C:\\')
    })
  })

  describe('isSelectedPath', () => {
    it('matches regardless of trailing slash (POSIX)', () => {
      const selected = ref(['/docs/'])
      const { isSelectedPath } = usePath(selected)
      expect(isSelectedPath('/docs')).toBe(true)
      expect(isSelectedPath('/docs/')).toBe(true)
      expect(isSelectedPath('/docs/readme')).toBe(false)
    })

    it('works with Windows separator', () => {
      useConfig().set('pathSeparator', '\\')
      const selected = ref(['C:\\data\\'])
      const { isSelectedPath } = usePath(selected)
      expect(isSelectedPath('C:\\data')).toBe(true)
      expect(isSelectedPath('C:\\data\\')).toBe(true)
      expect(isSelectedPath('C:\\datax')).toBe(false)
    })
  })

  describe('isIndeterminateDirectory', () => {
    it('is true when some (but not all) children are selected and dir is not selected', () => {
      const selected = ref(['/a/b', '/a/c']) // mixed trailing slashes are fine
      const { isIndeterminateDirectory } = usePath(selected)
      expect(isIndeterminateDirectory('/a')).toBe(true)
    })

    it('is false when directory itself is selected (even if children are too)', () => {
      const selected = ref(['/a/', '/a/b/', '/a/c/'])
      const { isIndeterminateDirectory } = usePath(selected)
      expect(isIndeterminateDirectory('/a')).toBe(false)
    })

    it('is false when no children are selected', () => {
      const selected = ref([])
      const { isIndeterminateDirectory } = usePath(selected)
      expect(isIndeterminateDirectory('/a')).toBe(false)
    })

    it('is true for deeper nesting when parent not selected', () => {
      const selected = ref(['/a/b/d'])
      const { isIndeterminateDirectory } = usePath(selected)
      expect(isIndeterminateDirectory('/a/b')).toBe(true)
      expect(isIndeterminateDirectory('/a')).toBe(true)
    })
  })

  describe('selectPath', () => {
    it('replaces selection when multiple=false (default)', () => {
      const selected = ref(['/prev/'])
      const { selectPath } = usePath(selected)
      selectPath('/new')
      expect(selected.value).toEqual(['/new/'])
      selectPath('/another/')
      expect(selected.value).toEqual(['/another/'])
    })

    it('appends when multiple=true', () => {
      const selected = ref([])
      const { selectPath } = usePath(selected, { multiple: true })
      selectPath('/one')
      selectPath('/two/')
      expect(selected.value).toEqual(['/one/', '/two/'])
    })

    it('allows duplicates when multiple=true (current behavior)', () => {
      const selected = ref([])
      const { selectPath } = usePath(selected, { multiple: true })
      selectPath('/one')
      selectPath('/one/')
      expect(selected.value).toEqual(['/one/', '/one/'])
    })
  })

  describe('unselectPath', () => {
    it('removes an existing normalized path', () => {
      const selected = ref(['/one/', '/two/'])
      const { unselectPath } = usePath(selected)
      unselectPath('/two')
      expect(selected.value).toEqual(['/one/'])
    })

    it('does nothing when path is not selected (documented expected behavior)', () => {
      const selected = ref(['/one/', '/two/'])
      const { unselectPath } = usePath(selected)
      unselectPath('/absent')
      expect(selected.value).toEqual(['/one/', '/two/'])
    })
  })

  describe('togglePath', () => {
    it('selects when not selected, unselects when selected (single mode)', () => {
      const selected = ref([])
      const { togglePath } = usePath(selected)

      togglePath('/docs')
      expect(selected.value).toEqual(['/docs/'])

      togglePath('/docs/')
      expect(selected.value).toEqual([])
    })

    it('works with multiple=true', () => {
      const selected = ref([])
      const { togglePath } = usePath(selected, { multiple: true })

      togglePath('/a')
      togglePath('/b')
      expect(selected.value).toEqual(['/a/', '/b/'])

      togglePath('/a/')
      expect(selected.value).toEqual(['/b/'])
    })
  })
})
