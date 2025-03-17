import diff from '@/utils/diff'

describe('diff', () => {
  test('returns correct additions and deletions for simple objects', () => {
    const previousEntries = [
      ['name', 'Alice'],
      ['age', 25],
      ['city', 'New York']
    ]
    const newEntries = [
      ['age', 25],
      ['city', 'Los Angeles'],
      ['country', 'USA']
    ]

    const result = diff(previousEntries, newEntries)

    expect(result).toEqual({
      $additions: { city: ['Los Angeles'], country: ['USA'] },
      $deletions: { name: ['Alice'], city: ['New York'] }
    })
  })

  test('handles array differences correctly', () => {
    const previousEntries = [['tags', ['javascript', 'react', 'node']]]
    const newEntries = [['tags', ['react', 'node', 'typescript']]]

    const result = diff(previousEntries, newEntries)

    expect(result).toEqual({
      $additions: { tags: [['react', 'node', 'typescript']] },
      $deletions: { tags: [['javascript', 'react', 'node']] }
    })
  })

  test('handles additions of values to existing keys as additions', () => {
    const previousEntries = [['a', 'foo']]
    const newEntries = [['a', ['foo', 'bar']]]

    const result = diff(previousEntries, newEntries)

    expect(result).toEqual({
      $additions: { a: [['foo', 'bar']] },
      $deletions: { a: ['foo'] }
    })
  })

  test('returns empty differences for identical objects', () => {
    const previousEntries = [
      ['name', 'Alice'],
      ['city', 'New York']
    ]
    const newEntries = [
      ['name', 'Alice'],
      ['city', 'New York']
    ]

    const result = diff(previousEntries, newEntries)

    expect(result).toEqual({ $additions: {}, $deletions: {} })
  })

  test('handles objects with no overlapping keys', () => {
    const previousEntries = [
      ['name', 'Alice'],
      ['age', 25]
    ]
    const newEntries = [
      ['job', 'developer'],
      ['location', 'USA']
    ]

    const result = diff(previousEntries, newEntries)

    expect(result).toEqual({
      $additions: { job: ['developer'], location: ['USA'] },
      $deletions: { name: ['Alice'], age: [25] }
    })
  })

  test('handles key with one additional value', () => {
    const previousEntries = [
      ['name', 'Alice'],
      ['age', 25]
    ]
    const newEntries = [
      ['name', 'Bob'],
      ['name', 'Alice'],
      ['age', 25]
    ]

    const result = diff(previousEntries, newEntries)

    expect(result).toEqual({
      $additions: { name: ['Bob'] },
      $deletions: {}
    })
  })

  test('handles nested objects with additions and deletions', () => {
    const previousEntries = [
      ['user', { name: 'Alice', age: 25 }],
      ['settings', { theme: 'dark' }]
    ]
    const newEntries = [
      ['user', { name: 'Alice', age: 25, gender: 'female' }],
      ['settings', {}]
    ]

    const result = diff(previousEntries, newEntries)

    expect(result).toEqual({
      $additions: { user: [{ name: 'Alice', age: 25, gender: 'female' }], settings: [{}] },
      $deletions: { user: [{ name: 'Alice', age: 25 }], settings: [{ theme: 'dark' }] }
    })
  })
})
