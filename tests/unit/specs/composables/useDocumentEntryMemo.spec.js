import { ref, nextTick } from 'vue'

import { useDocumentEntryMemo } from '@/composables/useDocumentEntryMemo'

describe('useDocumentEntryMemo', () => {
  describe('addProperties', () => {
    it('should add properties as a memo dependency', () => {
      const properties = ref(['title', 'thumbnail'])
      const { addProperties, getMemoKey } = useDocumentEntryMemo()

      addProperties(() => properties.value)

      const entry = { id: 'doc-123' }
      const result = getMemoKey(entry, false)

      expect(result).toContain(JSON.stringify(['title', 'thumbnail']))
    })

    it('should react to properties changes', async () => {
      const properties = ref(['title'])
      const { addProperties, getMemoKey } = useDocumentEntryMemo()

      addProperties(() => properties.value)

      const entry = { id: 'doc-123' }
      const result1 = getMemoKey(entry, false)

      properties.value = ['title', 'thumbnail']
      await nextTick()

      const result2 = getMemoKey(entry, false)

      expect(result1).not.toEqual(result2)
    })

    it('should accept a ref directly', async () => {
      const properties = ref(['title'])
      const { addProperties, getMemoKey } = useDocumentEntryMemo()

      addProperties(properties)

      const entry = { id: 'doc-123' }
      const result1 = getMemoKey(entry, false)

      properties.value = ['title', 'date']
      await nextTick()

      const result2 = getMemoKey(entry, false)

      expect(result1).not.toEqual(result2)
    })
  })

  describe('addSelectMode', () => {
    it('should add select mode as a memo dependency', () => {
      const selectMode = ref(true)
      const { addSelectMode, getMemoKey } = useDocumentEntryMemo()

      addSelectMode(() => selectMode.value)

      const entry = { id: 'doc-123' }
      const result = getMemoKey(entry, false)

      expect(result).toContain(true)
    })

    it('should react to select mode changes', async () => {
      const selectMode = ref(false)
      const { addSelectMode, getMemoKey } = useDocumentEntryMemo()

      addSelectMode(() => selectMode.value)

      const entry = { id: 'doc-123' }
      const result1 = getMemoKey(entry, false)

      selectMode.value = true
      await nextTick()

      const result2 = getMemoKey(entry, false)

      expect(result1).not.toEqual(result2)
    })

    it('should accept a ref directly', async () => {
      const selectMode = ref(false)
      const { addSelectMode, getMemoKey } = useDocumentEntryMemo()

      addSelectMode(selectMode)

      const entry = { id: 'doc-123' }
      const result1 = getMemoKey(entry, false)

      selectMode.value = true
      await nextTick()

      const result2 = getMemoKey(entry, false)

      expect(result1).not.toEqual(result2)
    })
  })

  describe('getMemoKey', () => {
    it('should return entry id, selection state, and active state', () => {
      const { getMemoKey } = useDocumentEntryMemo()

      const entry = { id: 'doc-123' }
      const result = getMemoKey(entry, true, false)

      expect(result[0]).toBe('doc-123')
      expect(result[1]).toBe(true)
      expect(result[2]).toBe(false)
    })

    it('should default active state to false', () => {
      const { getMemoKey } = useDocumentEntryMemo()

      const entry = { id: 'doc-123' }
      const result = getMemoKey(entry, true)

      expect(result[2]).toBe(false)
    })

    it('should include all registered dependencies', () => {
      const properties = ref(['title'])
      const selectMode = ref(false)
      const { addProperties, addSelectMode, getMemoKey } = useDocumentEntryMemo()

      addProperties(() => properties.value)
      addSelectMode(() => selectMode.value)

      const entry = { id: 'doc-123' }
      const result = getMemoKey(entry, true, false)

      expect(result).toHaveLength(5)
      expect(result[0]).toBe('doc-123')
      expect(result[1]).toBe(true)
      expect(result[2]).toBe(false)
      expect(result[3]).toBe('["title"]')
      expect(result[4]).toBe(false)
    })
  })

  describe('add', () => {
    it('should allow adding custom dependencies', () => {
      const viewMode = ref('grid')
      const { add, getMemoKey } = useDocumentEntryMemo()

      add('viewMode', viewMode)

      const entry = { id: 'doc-123' }
      const result = getMemoKey(entry, false)

      expect(result).toContain('grid')
    })

    it('should allow adding with getter function', () => {
      const { add, getMemoKey } = useDocumentEntryMemo()

      add('custom', () => 'custom-value')

      const entry = { id: 'doc-123' }
      const result = getMemoKey(entry, false)

      expect(result).toContain('custom-value')
    })
  })

  describe('integration scenarios', () => {
    it('should work with array of entries', () => {
      const properties = ref(['title', 'date'])
      const { addProperties, getMemoKey } = useDocumentEntryMemo()

      addProperties(() => properties.value)

      const entries = [
        { id: 'doc-1' },
        { id: 'doc-2' },
        { id: 'doc-3' }
      ]

      const selectionValues = {
        'doc-1': true,
        'doc-2': false,
        'doc-3': true
      }

      const keys = entries.map(entry => getMemoKey(entry, selectionValues[entry.id]))

      // Each key should have unique id
      expect(keys[0][0]).toBe('doc-1')
      expect(keys[1][0]).toBe('doc-2')
      expect(keys[2][0]).toBe('doc-3')

      // Selection values should differ
      expect(keys[0][1]).toBe(true)
      expect(keys[1][1]).toBe(false)
      expect(keys[2][1]).toBe(true)

      // Static keys should be identical
      expect(keys[0][3]).toBe(keys[1][3])
      expect(keys[1][3]).toBe(keys[2][3])
    })

    it('should detect changes correctly for v-memo comparison', async () => {
      const properties = ref(['title'])
      const selectMode = ref(false)
      const { addProperties, addSelectMode, getMemoKey } = useDocumentEntryMemo()

      addProperties(() => properties.value)
      addSelectMode(() => selectMode.value)

      const entry = { id: 'doc-1' }

      // Initial key
      const key1 = getMemoKey(entry, false, false)

      // Same values should produce same key
      const key2 = getMemoKey(entry, false, false)
      expect(key1).toEqual(key2)

      // Selection change should produce different key
      const key3 = getMemoKey(entry, true, false)
      expect(key1).not.toEqual(key3)

      // Properties change should produce different key
      properties.value = ['title', 'author']
      await nextTick()
      const key4 = getMemoKey(entry, true, false)
      expect(key3).not.toEqual(key4)

      // Select mode change should produce different key
      selectMode.value = true
      await nextTick()
      const key5 = getMemoKey(entry, true, false)
      expect(key4).not.toEqual(key5)
    })

    it('should work without any dependencies added', () => {
      const { getMemoKey } = useDocumentEntryMemo()

      const entry = { id: 'doc-1' }
      const result = getMemoKey(entry, false)

      expect(result).toHaveLength(3)
      expect(result[0]).toBe('doc-1')
      expect(result[1]).toBe(false)
      expect(result[2]).toBe(false)
    })
  })
})
