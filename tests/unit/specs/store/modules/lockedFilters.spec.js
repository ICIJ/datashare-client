import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'

import { useLockedFiltersStore } from '@/store/modules'

describe('LockedFiltersStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useLockedFiltersStore()
  })

  it('is not locked by default', () => {
    expect(store.isLocked({ name: 'tag', value: 'confidential' })).toBe(false)
  })

  it('reports a value as locked after locking it', () => {
    store.lock({ name: 'tag', value: 'confidential', label: 'Confidential' })
    expect(store.isLocked({ name: 'tag', value: 'confidential' })).toBe(true)
  })

  it('adds a locked value to entries with its label, and no project/index field', () => {
    store.lock({ name: 'tag', value: 'confidential', label: 'Confidential' })
    expect(store.entries).toHaveLength(1)
    expect(store.entries[0]).toEqual({ name: 'tag', value: 'confidential', label: 'Confidential' })
    expect(Object.keys(store.entries[0]).sort()).toEqual(['label', 'name', 'value'])
  })

  it('normalizes the value to a string', () => {
    store.lock({ name: 'contentLength', value: 1024, label: '1024' })
    expect(store.entries[0].value).toBe('1024')
    expect(store.isLocked({ name: 'contentLength', value: '1024' })).toBe(true)
    expect(store.isLocked({ name: 'contentLength', value: 1024 })).toBe(true)
  })

  it('does not duplicate an entry when locking the same value twice', () => {
    store.lock({ name: 'tag', value: 'confidential', label: 'Confidential' })
    store.lock({ name: 'tag', value: 'confidential', label: 'Confidential' })
    expect(store.entries).toHaveLength(1)
  })

  it('updates the label when relocking an already-locked value', () => {
    store.lock({ name: 'tag', value: 'confidential', label: 'Confidential' })
    store.lock({ name: 'tag', value: 'confidential', label: 'CONFIDENTIAL (renamed)' })
    expect(store.entries).toHaveLength(1)
    expect(store.entries[0].label).toBe('CONFIDENTIAL (renamed)')
  })

  it('treats included and excluded modes of the same filter as distinct locks', () => {
    store.lock({ name: 'tag', value: 'confidential', label: 'Confidential' })
    store.lock({ name: '-tag', value: 'confidential', label: 'Confidential' })
    expect(store.entries).toHaveLength(2)
    expect(store.isLocked({ name: 'tag', value: 'confidential' })).toBe(true)
    expect(store.isLocked({ name: '-tag', value: 'confidential' })).toBe(true)
  })

  it('unlocks a previously locked value', () => {
    store.lock({ name: 'tag', value: 'confidential', label: 'Confidential' })
    store.unlock({ name: 'tag', value: 'confidential' })
    expect(store.isLocked({ name: 'tag', value: 'confidential' })).toBe(false)
    expect(store.entries).toHaveLength(0)
  })

  it('does nothing when unlocking a value that was never locked', () => {
    expect(() => store.unlock({ name: 'tag', value: 'confidential' })).not.toThrow()
    expect(store.entries).toHaveLength(0)
  })

  it('clears every lock via unlockAll', () => {
    store.lock({ name: 'tag', value: 'confidential', label: 'Confidential' })
    store.lock({ name: 'contentType', value: 'application/pdf', label: 'PDF' })
    store.unlockAll()
    expect(store.entries).toHaveLength(0)
    expect(store.count).toBe(0)
  })

  it('exposes the number of locked entries via count', () => {
    store.lock({ name: 'tag', value: 'confidential', label: 'Confidential' })
    store.lock({ name: 'contentType', value: 'application/pdf', label: 'PDF' })
    expect(store.count).toBe(2)
  })
})
