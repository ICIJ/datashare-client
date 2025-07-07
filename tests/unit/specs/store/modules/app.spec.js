import { setActivePinia, createPinia } from 'pinia'

import { useAppStore } from '@/store/modules'

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

  it('should set settings using an object', () => {
    store.setSettings('view1', { name: 'value' })
    expect(store.getSettings('view1', 'name')).toBe('value')
  })

  it('should set settings using a string and value', () => {
    store.setSettings('view1', 'name', 'value')
    expect(store.getSettings('view1', 'name')).toBe('value')
  })

  it('should reset settings to default settings', () => {
    const originalValue = store.getSettings('projectList', 'perPage')
    store.setSettings('view1', 'name', 'value')
    store.setSettings('projectList', 'perPage', '50')
    store.resetSettings()
    expect(store.getSettings('view1', 'name')).toBe(undefined)
    expect(store.getSettings('projectList', 'perPage')).toBe(originalValue)
  })

  it('should reset settings for projectListView view only', () => {
    const originalValue = store.getSettings('projectList', 'perPage')
    store.setSettings('view1', 'name', 'value')
    store.setSettings('projectList', 'perPage', '50')
    store.resetSettings('projectList')
    expect(store.getSettings('view1', 'name')).toBe('value')
    expect(store.getSettings('projectList', 'perPage')).toBe(originalValue)
  })
})
