import { nextTick, ref } from 'vue'

import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'

describe('useDocumentLocalSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // The debounced term is updated by a timer, and the search it triggers is a
  // promise chain: both have to be drained for the state to settle.
  async function settle(ms = 300) {
    await vi.advanceTimersByTimeAsync(ms)
    await nextTick()
  }

  it('calls findMatches once for a settled term', async () => {
    const findMatches = vi.fn().mockResolvedValue([])
    const { term } = useDocumentLocalSearch({ findMatches })
    term.value = 'f'
    term.value = 'fo'
    term.value = 'foo'
    await settle()
    expect(findMatches).toHaveBeenCalledOnce()
    expect(findMatches).toHaveBeenCalledWith('foo')
  })

  it('does not call findMatches before the debounce elapses', async () => {
    const findMatches = vi.fn().mockResolvedValue([])
    const { term } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle(299)
    expect(findMatches).not.toHaveBeenCalled()
  })

  it('activates the first occurrence of a non-empty result', async () => {
    const findMatches = vi.fn().mockResolvedValue([{ page: 2 }, { page: 5 }])
    const { term, activeIndex, occurrences } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    expect(occurrences.value).toBe(2)
    expect(activeIndex.value).toBe(1)
  })

  it('activates nothing when the result is empty', async () => {
    const findMatches = vi.fn().mockResolvedValue([])
    const { term, activeIndex, occurrences } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    expect(occurrences.value).toBe(0)
    expect(activeIndex.value).toBe(0)
  })

  it('reports the page of the active match', async () => {
    const findMatches = vi.fn().mockResolvedValue([{ page: 2 }, { page: 5 }])
    const { term, activeIndex, activePage } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    expect(activePage.value).toBe(2)
    activeIndex.value = 2
    expect(activePage.value).toBe(5)
  })

  it('clears matches as soon as the term is emptied', async () => {
    const findMatches = vi.fn().mockResolvedValue([{ page: 2 }])
    const { term, activeIndex, occurrences } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    findMatches.mockClear()
    term.value = ''
    await nextTick()
    expect(occurrences.value).toBe(0)
    expect(activeIndex.value).toBe(0)
    await settle()
    expect(findMatches).not.toHaveBeenCalled()
  })

  it('keeps the newest result when an older search resolves last', async () => {
    const deferred = []
    const findMatches = vi.fn(() => new Promise(resolve => deferred.push(resolve)))
    const { term, matches } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    term.value = 'bar'
    await settle()
    expect(deferred).toHaveLength(2)
    deferred[1]([{ page: 9 }])
    await nextTick()
    deferred[0]([{ page: 1 }, { page: 2 }])
    await nextTick()
    expect(matches.value).toEqual([{ page: 9 }])
  })

  it('drops the previous matches when the search rejects', async () => {
    const findMatches = vi.fn().mockResolvedValue([{ page: 2 }])
    const { term, matches, occurrences, isLoading } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    expect(occurrences.value).toBe(1)
    findMatches.mockRejectedValue(new Error('backend is down'))
    term.value = 'bar'
    await settle()
    expect(matches.value).toEqual([])
    expect(isLoading.value).toBe(false)
  })

  it('is loading while the term is settling and while the search runs', async () => {
    let resolveMatches
    const findMatches = vi.fn(() => new Promise((resolve) => {
      resolveMatches = resolve
    }))
    const { term, isLoading } = useDocumentLocalSearch({ findMatches })
    expect(isLoading.value).toBe(false)
    term.value = 'foo'
    await nextTick()
    expect(isLoading.value).toBe(true)
    await settle()
    expect(isLoading.value).toBe(true)
    resolveMatches([])
    await nextTick()
    expect(isLoading.value).toBe(false)
  })

  it('accepts a reactive-free findMatches that reads fresh state each call', async () => {
    const source = ref([{ page: 1 }])
    const findMatches = vi.fn(async () => source.value)
    const { term, matches } = useDocumentLocalSearch({ findMatches })
    term.value = 'foo'
    await settle()
    expect(matches.value).toEqual([{ page: 1 }])
    source.value = [{ page: 3 }]
    term.value = 'bar'
    await settle()
    expect(matches.value).toEqual([{ page: 3 }])
  })
})
