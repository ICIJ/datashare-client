import { setActivePinia, createPinia } from 'pinia'

import { useAppStore } from '@/store/modules/app'

describe('AppStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAppStore()
  })

  it('should have an initial state with an empty projects array', () => {
    expect(store.pins.projects).toEqual([])
  })

  it('pinProject should add a project to the pins array', () => {
    store.pinProject('project-1')
    expect(store.pins.projects).toContain('project-1')
  })

  it('pinProject should not add a duplicate project to the pins array', () => {
    store.pinProject('project-1')
    store.pinProject('project-1')
    expect(store.pins.projects).toEqual(['project-1'])
  })

  it('unpinProject should remove a project from the pins array', () => {
    store.pinProject('project-1')
    store.unpinProject('project-1')
    expect(store.pins.projects).not.toContain('project-1')
  })

  it('unpinProject should not affect the array if the project is not pinned', () => {
    store.pinProject('project-1')
    store.unpinProject('project-2')
    expect(store.pins.projects).toEqual(['project-1'])
  })

  it('isProjectPinned should return true if the project is pinned', () => {
    store.pinProject('project-1')
    expect(store.isProjectPinned('project-1')).toBe(true)
  })

  it('isProjectPinned should return false if the project is not pinned', () => {
    expect(store.isProjectPinned('project-2')).toBe(false)
  })
})
