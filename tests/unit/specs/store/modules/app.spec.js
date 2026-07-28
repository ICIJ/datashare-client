import { setActivePinia, createPinia } from 'pinia'

import { useAppStore } from '@/store/modules'
import { SEARCH_OPERATORS } from '@/enums/searchOperators'

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

  it('should reset settings for projectList View view only', () => {
    const originalValue = store.getSettings('projectList', 'perPage')
    store.setSettings('view1', 'name', 'value')
    store.setSettings('projectList', 'perPage', '50')
    store.resetSettings('projectList')
    expect(store.getSettings('view1', 'name')).toBe('value')
    expect(store.getSettings('projectList', 'perPage')).toBe(originalValue)
  })

  it('should reset settings for array settings', () => {
    const originalValue = store.getSettings('search', 'orderBy')
    store.setSettings('search', 'orderBy', ['relevance', 'desc'])
    store.resetSettings('search')
    expect(store.getSettings('search', 'orderBy')).toEqual(originalValue)
  })

  it('should default search operator to OR', () => {
    expect(store.getSettings('search', 'searchOperator')).toBe(SEARCH_OPERATORS.OR)
  })

  it('should reset search operator to OR after change', () => {
    store.setSettings('search', 'searchOperator', SEARCH_OPERATORS.AND)
    store.resetSettings('search')
    expect(store.getSettings('search', 'searchOperator')).toBe(SEARCH_OPERATORS.OR)
  })

  it('should default searchHistoryList order to modification_date desc', () => {
    expect(store.getSettings('searchHistoryList', 'orderBy')).toEqual(['modification_date', 'desc'])
  })

  describe('redirectAfterLogin', () => {
    it('should be null initially', () => {
      expect(store.redirectAfterLogin).toBeNull()
    })

    it('setRedirectAfterLogin should store a path starting with a slash', () => {
      store.setRedirectAfterLogin('/settings/appearance')
      expect(store.redirectAfterLogin).toBe('/settings/appearance')
    })

    it('setRedirectAfterLogin should store a full path with query and hash', () => {
      store.setRedirectAfterLogin('/settings?foo=bar#appearance')
      expect(store.redirectAfterLogin).toBe('/settings?foo=bar#appearance')
    })

    it('setRedirectAfterLogin should ignore the login page', () => {
      store.setRedirectAfterLogin('/settings')
      store.setRedirectAfterLogin('/login')
      expect(store.redirectAfterLogin).toBe('/settings')
    })

    it('setRedirectAfterLogin should ignore values not starting with a slash', () => {
      store.setRedirectAfterLogin('/settings')
      store.setRedirectAfterLogin('https://evil.example.com/')
      expect(store.redirectAfterLogin).toBe('/settings')
    })

    it('setRedirectAfterLogin should ignore protocol-relative paths', () => {
      store.setRedirectAfterLogin('/settings')
      store.setRedirectAfterLogin('//evil.example.com/')
      expect(store.redirectAfterLogin).toBe('/settings')
    })

    it('setRedirectAfterLogin should ignore backslash-prefixed paths', () => {
      store.setRedirectAfterLogin('/settings')
      store.setRedirectAfterLogin('/\\evil.example.com/')
      expect(store.redirectAfterLogin).toBe('/settings')
    })

    it('setRedirectAfterLogin should clear the value when passed null', () => {
      store.setRedirectAfterLogin('/settings')
      store.setRedirectAfterLogin(null)
      expect(store.redirectAfterLogin).toBeNull()
    })

    it('popRedirectAfterLogin should return the value and clear it', () => {
      store.setRedirectAfterLogin('/settings?foo=bar')
      expect(store.popRedirectAfterLogin()).toBe('/settings?foo=bar')
      expect(store.redirectAfterLogin).toBeNull()
    })

    it('popRedirectAfterLogin should return null when nothing is stored', () => {
      expect(store.popRedirectAfterLogin()).toBeNull()
    })
  })
})
