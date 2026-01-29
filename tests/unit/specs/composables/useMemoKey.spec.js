import { ref, nextTick } from 'vue'

import { useMemoKey } from '@/composables/useMemoKey'

describe('useMemoKey', () => {
  describe('add', () => {
    it('should register a static dependency with a getter', () => {
      const { add, has, get } = useMemoKey()
      add('theme', () => 'dark')

      expect(has('theme')).toBe(true)
      expect(get('theme')).toBe('dark')
    })

    it('should register a static dependency with a ref', () => {
      const theme = ref('dark')
      const { add, get } = useMemoKey()
      add('theme', theme)

      expect(get('theme')).toBe('dark')
    })

    it('should handle reactive ref updates', async () => {
      const theme = ref('light')
      const { add, get } = useMemoKey()
      add('theme', theme)

      expect(get('theme')).toBe('light')

      theme.value = 'dark'
      await nextTick()

      expect(get('theme')).toBe('dark')
    })

    it('should handle reactive getter updates', async () => {
      const count = ref(0)
      const { add, get } = useMemoKey()
      add('count', () => count.value)

      expect(get('count')).toBe(0)

      count.value = 5
      await nextTick()

      expect(get('count')).toBe(5)
    })

    it('should overwrite existing dependency with same name', () => {
      const { add, get } = useMemoKey()
      add('value', () => 'first')
      add('value', () => 'second')

      expect(get('value')).toBe('second')
    })
  })

  describe('remove', () => {
    it('should remove an existing dependency', () => {
      const { add, remove, has } = useMemoKey()
      add('theme', () => 'dark')

      expect(has('theme')).toBe(true)

      const result = remove('theme')

      expect(result).toBe(true)
      expect(has('theme')).toBe(false)
    })

    it('should return false when removing non-existing dependency', () => {
      const { remove } = useMemoKey()

      const result = remove('doesNotExist')

      expect(result).toBe(false)
    })
  })

  describe('has', () => {
    it('should return true for existing dependency', () => {
      const { add, has } = useMemoKey()
      add('exists', () => true)

      expect(has('exists')).toBe(true)
    })

    it('should return false for non-existing dependency', () => {
      const { has } = useMemoKey()

      expect(has('doesNotExist')).toBe(false)
    })
  })

  describe('get', () => {
    it('should return undefined for non-existing dependency', () => {
      const { get } = useMemoKey()

      expect(get('doesNotExist')).toBeUndefined()
    })

    it('should return the computed value', () => {
      const { add, get } = useMemoKey()
      add('array', () => JSON.stringify([1, 2, 3]))

      expect(get('array')).toBe('[1,2,3]')
    })
  })

  describe('getAll', () => {
    it('should return empty array when no dependencies', () => {
      const { getAll } = useMemoKey()

      expect(getAll()).toEqual([])
    })

    it('should return all static dependency values', () => {
      const { add, getAll } = useMemoKey()
      add('a', () => 1)
      add('b', () => 2)
      add('c', () => 3)

      const keys = getAll()
      expect(keys).toHaveLength(3)
      expect(keys).toContain(1)
      expect(keys).toContain(2)
      expect(keys).toContain(3)
    })

    it('should reflect changes in reactive dependencies', async () => {
      const value = ref('initial')
      const { add, getAll } = useMemoKey()
      add('value', value)

      expect(getAll()).toEqual(['initial'])

      value.value = 'updated'
      await nextTick()

      expect(getAll()).toEqual(['updated'])
    })
  })

  describe('build', () => {
    it('should return only static keys when no dynamic values', () => {
      const { add, build } = useMemoKey()
      add('a', () => 1)
      add('b', () => 2)

      const key = build()
      expect(key).toEqual([1, 2])
    })

    it('should combine dynamic object values with static keys', () => {
      const { add, build } = useMemoKey()
      add('static1', () => 'S1')
      add('static2', () => 'S2')

      const key = build({ id: 'doc-123', selected: true })

      expect(key).toHaveLength(4)
      expect(key[0]).toBe('doc-123')
      expect(key[1]).toBe(true)
      expect(key[2]).toBe('S1')
      expect(key[3]).toBe('S2')
    })

    it('should combine dynamic array values with static keys', () => {
      const { add, build } = useMemoKey()
      add('static1', () => 'S1')

      const key = build(['id-1', true, false])

      expect(key).toEqual(['id-1', true, false, 'S1'])
    })

    it('should handle empty dynamic values', () => {
      const { add, build } = useMemoKey()
      add('only', () => 'static')

      expect(build({})).toEqual(['static'])
      expect(build([])).toEqual(['static'])
    })

    it('should preserve order: dynamic first, then static', () => {
      const { add, build } = useMemoKey()
      add('s1', () => 'static-1')
      add('s2', () => 'static-2')

      const key = build({ d1: 'dynamic-1', d2: 'dynamic-2' })

      expect(key).toEqual(['dynamic-1', 'dynamic-2', 'static-1', 'static-2'])
    })

    it('should handle complex dynamic values', () => {
      const { add, build } = useMemoKey()
      add('config', () => JSON.stringify({ a: 1 }))

      const entry = { id: 'e1', nested: { value: 42 } }
      const key = build({
        id: entry.id,
        nested: entry.nested.value,
        computed: entry.id + '-suffix'
      })

      expect(key).toEqual(['e1', 42, 'e1-suffix', '{"a":1}'])
    })
  })

  describe('real-world usage patterns', () => {
    it('should work with properties array serialization', async () => {
      const properties = ref(['title', 'date'])
      const { add, build } = useMemoKey()
      add('propertiesKey', () => JSON.stringify(properties.value))

      const key1 = build({ id: 'doc-1' })
      expect(key1).toEqual(['doc-1', '["title","date"]'])

      properties.value = ['title', 'date', 'author']
      await nextTick()

      const key2 = build({ id: 'doc-1' })
      expect(key2).toEqual(['doc-1', '["title","date","author"]'])

      // Keys should be different when properties change
      expect(key1[1]).not.toBe(key2[1])
    })

    it('should work with boolean flags', async () => {
      const selectMode = ref(false)
      const editMode = ref(false)

      const { add, build } = useMemoKey()
      add('selectMode', selectMode)
      add('editMode', editMode)

      expect(build({ id: 1 })).toEqual([1, false, false])

      selectMode.value = true
      await nextTick()

      expect(build({ id: 1 })).toEqual([1, true, false])

      editMode.value = true
      await nextTick()

      expect(build({ id: 1 })).toEqual([1, true, true])
    })

    it('should handle multiple items with same static deps', () => {
      const { add, build } = useMemoKey()
      add('config', () => 'shared')

      const items = [
        { id: 1, selected: true },
        { id: 2, selected: false },
        { id: 3, selected: true }
      ]

      const keys = items.map(item => build({ id: item.id, selected: item.selected }))

      expect(keys[0]).toEqual([1, true, 'shared'])
      expect(keys[1]).toEqual([2, false, 'shared'])
      expect(keys[2]).toEqual([3, true, 'shared'])

      // Static part should be identical
      expect(keys[0][2]).toBe(keys[1][2])
      expect(keys[1][2]).toBe(keys[2][2])
    })

    it('should support creating specialized builders', () => {
      // Base builder factory
      const createBaseBuilder = (props) => {
        const { add, build } = useMemoKey()
        add('properties', () => JSON.stringify(props.properties))
        return { add, build }
      }

      // Grid-specific builder
      const createGridBuilder = (props) => {
        const { add, build } = createBaseBuilder(props)
        add('gridSize', () => props.gridSize)
        return { build }
      }

      // List-specific builder
      const createListBuilder = (props) => {
        const { add, build } = createBaseBuilder(props)
        add('compact', () => props.compact)
        return { build }
      }

      const gridProps = { properties: ['a', 'b'], gridSize: 'large' }
      const listProps = { properties: ['a', 'b'], compact: true }

      const gridBuilder = createGridBuilder(gridProps)
      const listBuilder = createListBuilder(listProps)

      expect(gridBuilder.build({ id: 1 })).toEqual([1, '["a","b"]', 'large'])
      expect(listBuilder.build({ id: 1 })).toEqual([1, '["a","b"]', true])
    })
  })
})
