import findPath from '@/utils/find-path'

describe('findPath', () => {
  const nestedObject = {
    foo: {
      bar: [{ id: 1 }, { id: 2 }],
      baz: {
        nested: { key: 'value' }
      }
    }
  }

  it('should return the correct path for a matching object in an array', () => {
    expect(findPath(nestedObject, { id: 1 })).toBe('foo.bar.0')
    expect(findPath(nestedObject, { id: 2 })).toBe('foo.bar.1')
  })

  it('should return the correct path for a nested key-value pair', () => {
    expect(findPath(nestedObject, { key: 'value' })).toBe('foo.baz.nested')
  })

  it('should return null if the value is not found', () => {
    expect(findPath(nestedObject, { id: 3 })).toBe(null)
    expect(findPath(nestedObject, { nonexistent: 'key' })).toBe(null)
  })

  it('should handle empty objects gracefully', () => {
    expect(findPath({}, { id: 1 })).toBe(null)
  })

  it('should handle deeply nested structures', () => {
    const complexObject = {
      level1: {
        level2: {
          level3: {
            level4: { target: 'found' }
          }
        }
      }
    }
    expect(findPath(complexObject, { target: 'found' })).toBe('level1.level2.level3.level4')
  })
})
