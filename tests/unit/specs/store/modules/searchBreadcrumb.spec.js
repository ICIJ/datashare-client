import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'

import { useSearchBreadcrumbStore } from '@/store/modules'

describe('SearchBreadcrumbStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useSearchBreadcrumbStore()
  })

  it('pushes a new query and processes one index correctly', () => {
    const params = 'indices=a'
    store.push(params)
    expect(store.steps).toHaveLength(1)
    // The "push" call should split the indices string into an array
    expect(store.steps[0][0][1]).toEqual('a')
  })

  it('pushes a new query and processes one index correctly, even with a "?" suffix', () => {
    const params = '?indices=a'
    store.push(params)
    expect(store.steps).toHaveLength(1)
    // The "push" call should split the indices string into an array
    expect(store.steps[0][0][1]).toEqual('a')
  })

  it('pushes a new query and processes one index correctly, even with a "#/?" suffix', () => {
    const params = '#/?indices=a'
    store.push(params)
    expect(store.steps).toHaveLength(1)
    // The "push" call should split the indices string into an array
    expect(store.steps[0][0][1]).toEqual('a')
  })

  it('pushes a new query and processes indices correctly', () => {
    const params = 'indices=a,b'
    store.push(params)
    expect(store.steps).toHaveLength(1)
    // The "push" call should split the indices string into an array
    expect(store.steps[0][0][1]).toEqual('a')
    expect(store.steps[0][1][1]).toEqual('b')
  })

  it('does not push duplicate queries if the last step is the same', () => {
    store.push('indices=a,b')
    store.push('indices=a,b')
    expect(store.steps).toHaveLength(1)
  })

  it('pushs duplicate queries if the last step is different', () => {
    store.push('indices=a,b')
    store.push('indices=a,b,filter=active')
    store.push('indices=a,b')
    expect(store.steps).toHaveLength(3)
  })

  it('computes the journey diffs correctly', () => {
    // Push two queries with different properties
    store.push('indices=a,b&filter=active')
    store.push('indices=c,d&filter=inactive')

    const journey = store.journey
    expect(journey).toHaveLength(2)

    // For the first step the diff is computed between {} and the first query.
    expect(journey[0].$additions).toHaveProperty('indices')
    expect(journey[0].$additions.indices).toEqual(['a', 'b'])
    expect(journey[0].$additions).toHaveProperty('filter')
    expect(journey[0].$additions.filter).toEqual(['active'])

    // For the second step, since 'filter' changes from 'active' to 'inactive'.
    expect(journey[1].$additions).toHaveProperty('indices')
    expect(journey[1].$additions.indices).toEqual(['c', 'd'])
    expect(journey[1].$additions).toHaveProperty('filter')
    expect(journey[1].$additions.filter).toEqual(['inactive'])
  })

  it('returns the correct paramLastIndex for the first param', () => {
    store.push('indices=a&category=books')
    store.push('indices=a&category=movies')
    expect(store.paramLastIndex('category', 'books')).toBe(0)
  })

  it('returns the correct paramLastIndex for the second param', () => {
    store.push('indices=a&category=books')
    store.push('indices=a&category=movies')
    expect(store.paramLastIndex('category', 'movies')).toBe(1)
  })

  it('preserves the order or addition in the end step', () => {
    store.push('indices=a')
    store.push('indices=a&category=books')
    store.push('indices=a&category=movies')
    store.push('indices=a&category=movies&category=books')
    store.push('indices=a&status=active&category=movies&category=books')
    expect(store.endSearchParams.toString()).toEqual('indices=a&category=movies&category=books&status=active')
  })

  it('preserves the order or addition of indices in the end step', () => {
    store.push('indices=a')
    store.push('indices=b,a')
    store.push('indices=b,a,c')
    expect(store.endSearchParams.toString()).toEqual('indices=a%2Cb%2Cc')
  })

  it('preserves the order or addition of indices in the end step as a query', () => {
    store.push('indices=a')
    store.push('indices=b,a')
    store.push('indices=b,a,c')
    expect(store.endSearchQuery).toEqual({ indices: 'a,b,c' })
  })
})
