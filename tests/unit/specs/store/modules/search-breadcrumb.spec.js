import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'

import { useSearchBreadcrumbStore } from '@/store/modules/search-breadcrumb'

describe('SearchBreadcrumbStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useSearchBreadcrumbStore()
  })

  it('pushes a new query and processes indices correctly', () => {
    const query = { indices: 'a,b' }
    store.push(query)
    expect(store.steps.length).toBe(1)
    // The "push" call should split the indices string into an array
    expect(store.steps[0].indices).toEqual(['a', 'b'])
  })

  it('does not push duplicate queries', () => {
    const query = { indices: 'a,b' }
    store.push(query)
    store.push(query)
    expect(store.steps.length).toBe(1)
  })

  it('computes the journey diffs correctly', () => {
    // Push two queries with different properties
    store.push({ indices: 'a,b', filter: 'active' })
    store.push({ indices: 'c,d', filter: 'inactive' })

    const journey = store.journey
    expect(journey.length).toBe(2)

    // For the first step the diff is computed between {} and the first query.
    // Our mocked diff will return $additions for properties that exist in the first query.
    expect(journey[0].$additions).toHaveProperty('indices')
    expect(journey[0].$additions).toHaveProperty('filter')

    // For the second step, since 'filter' changes from 'active' to 'inactive',
    // our mock returns a $updates object.
    expect(journey[1].$updates).toHaveProperty('filter')
  })

  it('returns the correct paramLastIndex for the first param', () => {
    store.push({ indices: 'a', category: 'books' })
    store.push({ indices: 'a', category: 'movies' })
    expect(store.paramLastIndex('category', 'books')).toBe(0)
  })

  it('returns the correct paramLastIndex for the second param', () => {
    store.push({ indices: 'a', category: 'books' })
    store.push({ indices: 'a', category: 'movies' })
    expect(store.paramLastIndex('category', 'movies')).toBe(1)
  })
})
