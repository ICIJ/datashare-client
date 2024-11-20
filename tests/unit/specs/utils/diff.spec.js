import diff from '@/utils/diff'

describe('diff', () => {
  test('returns correct additions, deletions, and updates for simple objects', () => {
    const previousObj = { name: 'Alice', age: 25, city: 'New York' }
    const newObj = { age: 25, city: 'Los Angeles', country: 'USA' }

    const result = diff(previousObj, newObj)

    expect(result).toEqual({
      $additions: { country: 'USA' },
      $deletions: { name: 'Alice' },
      $updates: { city: { oldValue: 'New York', newValue: 'Los Angeles' } }
    })
  })

  test('returns correct differences for nested objects', () => {
    const previousObj = { user: { name: 'Alice', age: 25 }, status: 'active' }
    const newObj = { user: { name: 'Alice', age: 26 }, status: 'active', role: 'admin' }

    const result = diff(previousObj, newObj)

    expect(result).toEqual({
      $additions: { role: 'admin' },
      $deletions: {},
      $updates: { user: { $additions: {}, $deletions: {}, $updates: { age: { oldValue: 25, newValue: 26 } } } }
    })
  })

  test('handles array differences correctly', () => {
    const previousObj = { tags: ['javascript', 'react', 'node'] }
    const newObj = { tags: ['react', 'node', 'typescript'] }

    const result = diff(previousObj, newObj)

    expect(result).toEqual({
      $additions: {},
      $deletions: {},
      $updates: {
        tags: {
          $additions: ['typescript'],
          $deletions: ['javascript']
        }
      }
    })
  })

  test('returns empty differences for identical objects', () => {
    const previousObj = {
      name: 'Alice',
      address: { city: 'New York', zip: '10001' },
      hobbies: ['reading', 'traveling']
    }
    const newObj = { name: 'Alice', address: { city: 'New York', zip: '10001' }, hobbies: ['reading', 'traveling'] }

    const result = diff(previousObj, newObj)

    expect(result).toEqual({ $additions: {}, $deletions: {}, $updates: {} })
  })

  test('handles objects with no overlapping keys', () => {
    const previousObj = { name: 'Alice', age: 25 }
    const newObj = { job: 'developer', location: 'USA' }

    const result = diff(previousObj, newObj)

    expect(result).toEqual({
      $additions: { job: 'developer', location: 'USA' },
      $deletions: { name: 'Alice', age: 25 },
      $updates: {}
    })
  })

  test('handles nested objects with additions and deletions', () => {
    const previousObj = { user: { name: 'Alice', age: 25 }, settings: { theme: 'dark' } }
    const newObj = { user: { name: 'Alice', age: 25, gender: 'female' }, settings: {} }

    const result = diff(previousObj, newObj)

    expect(result).toEqual({
      $additions: {},
      $deletions: {},
      $updates: {
        user: { $additions: { gender: 'female' }, $deletions: {}, $updates: {} },
        settings: { $additions: {}, $deletions: { theme: 'dark' }, $updates: {} }
      }
    })
  })

  test('handles deeply nested objects correctly', () => {
    const previousObj = { company: { department: { team: { leader: 'Alice' } } } }
    const newObj = { company: { department: { team: { leader: 'Bob', assistant: 'Charlie' } } } }

    const result = diff(previousObj, newObj)

    expect(result).toEqual({
      $additions: {},
      $deletions: {},
      $updates: {
        company: {
          $additions: {},
          $deletions: {},
          $updates: {
            department: {
              $additions: {},
              $deletions: {},
              $updates: {
                team: {
                  $additions: { assistant: 'Charlie' },
                  $deletions: {},
                  $updates: {
                    leader: { oldValue: 'Alice', newValue: 'Bob' }
                  }
                }
              }
            }
          }
        }
      }
    })
  })

  test('handles arrays with nested objects correctly', () => {
    const previousObj = { users: [{ name: 'Alice' }, { name: 'Bob' }] }
    const newObj = { users: [{ name: 'Charlie' }, { name: 'David' }] }

    const result = diff(previousObj, newObj)

    expect(result).toEqual({
      $additions: {},
      $deletions: {},
      $updates: {
        users: {
          $additions: [{ name: 'Charlie' }, { name: 'David' }],
          $deletions: [{ name: 'Alice' }, { name: 'Bob' }]
        }
      }
    })
  })

  test('handles objects with multiple types of values', () => {
    const previousObj = { name: 'Alice', age: 25, isActive: true, address: null, skills: undefined }
    const newObj = { name: 'Alice', age: 26, isActive: false, address: '123 Main St', skills: ['javascript', 'react'] }

    const result = diff(previousObj, newObj)

    expect(result).toEqual({
      $additions: {},
      $deletions: {},
      $updates: {
        age: { oldValue: 25, newValue: 26 },
        isActive: { oldValue: true, newValue: false },
        address: { oldValue: null, newValue: '123 Main St' },
        skills: { oldValue: undefined, newValue: ['javascript', 'react'] }
      }
    })
  })

  test('handles empty objects', () => {
    const previousObj = {}
    const newObj = {}

    const result = diff(previousObj, newObj)

    expect(result).toEqual({ $additions: {}, $deletions: {}, $updates: {} })
  })

  test('handles large objects with many keys', () => {
    const previousObj = {
      name: 'Alice',
      age: 25,
      city: 'New York',
      country: 'USA',
      job: 'developer',
      salary: 50000,
      level: 'mid',
      department: 'engineering',
      contract: 'full-time',
      active: true
    }
    const newObj = {
      name: 'Alice',
      age: 26,
      city: 'San Francisco',
      country: 'USA',
      job: 'developer',
      salary: 60000,
      level: 'senior',
      department: 'engineering',
      contract: 'full-time',
      active: false
    }

    const result = diff(previousObj, newObj)

    expect(result).toEqual({
      $additions: {},
      $deletions: {},
      $updates: {
        age: { oldValue: 25, newValue: 26 },
        city: { oldValue: 'New York', newValue: 'San Francisco' },
        salary: { oldValue: 50000, newValue: 60000 },
        level: { oldValue: 'mid', newValue: 'senior' },
        active: { oldValue: true, newValue: false }
      }
    })
  })
})
