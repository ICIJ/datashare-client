import { createStore } from 'vuex'
import { describe, it, expect, beforeEach } from 'vitest'

import app from '@/store/modules/app'

// Create a new store instance using the provided module
const createVuexStore = () => {
  return createStore({
    state: app.state,
    mutations: app.mutations,
    getters: app.getters
  })
}

describe('AppStore', () => {
  let store

  beforeEach(() => {
    store = createVuexStore()
  })

  describe('state', () => {
    it('should have an initial state with an empty projects array', () => {
      expect(store.state.pins.projects).toEqual([])
    })
  })

  describe('mutations', () => {
    it('pinProject should add a project to the pins array', () => {
      store.commit('pinProject', 'project-1')
      expect(store.state.pins.projects).toContain('project-1')
    })

    it('pinProject should not add a duplicate project to the pins array', () => {
      store.commit('pinProject', 'project-1')
      store.commit('pinProject', 'project-1')
      expect(store.state.pins.projects).toEqual(['project-1'])
    })

    it('unpinProject should remove a project from the pins array', () => {
      store.commit('pinProject', 'project-1')
      store.commit('unpinProject', 'project-1')
      expect(store.state.pins.projects).not.toContain('project-1')
    })

    it('unpinProject should not affect the array if the project is not pinned', () => {
      store.commit('pinProject', 'project-1')
      store.commit('unpinProject', 'project-2')
      expect(store.state.pins.projects).toEqual(['project-1'])
    })
  })

  describe('getters', () => {
    it('isProjectPinned should return true if the project is pinned', () => {
      store.commit('pinProject', 'project-1')
      expect(store.getters.isProjectPinned('project-1')).toBe(true)
    })

    it('isProjectPinned should return false if the project is not pinned', () => {
      expect(store.getters.isProjectPinned('project-2')).toBe(false)
    })
  })
})
