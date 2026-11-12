import { createRouter, createMemoryHistory } from 'vue-router'

import { errorLocation } from '@/router/errorLocation'

describe('errorLocation', () => {
  const component = { template: '<div />' }
  const routes = [
    { path: '/ds/:index/:id', name: 'document', component },
    { path: '/:pathMatch(.*)*', name: 'error', component }
  ]
  const router = createRouter({ history: createMemoryHistory(), routes })

  it('should point to the error route', () => {
    const route = router.resolve('/ds/project/document')
    const location = router.resolve(errorLocation(route))
    expect(location.name).toBe('error')
  })

  it('should keep the URL of the failed route', () => {
    const route = router.resolve('/ds/project/my%20document?tab=text#top')
    const location = router.resolve(errorLocation(route))
    expect(location.fullPath).toBe('/ds/project/my%20document?tab=text#top')
  })

  it('should replace the failed route in the history', () => {
    const route = router.resolve('/ds/project/document')
    expect(errorLocation(route).replace).toBe(true)
  })

  it('should pass the state to the error page', () => {
    const route = router.resolve('/ds/project/document')
    const state = { error: 'Not Found', code: 404 }
    expect(errorLocation(route, state).state).toEqual(state)
  })

  it('should blank the keys the state does not set', () => {
    const route = router.resolve('/ds/project/document')
    const { state } = errorLocation(route, { code: 500 })
    const blank = { title: undefined, description: undefined, error: undefined, details: undefined, reason: undefined }
    expect(state).toEqual({ ...blank, code: 500 })
    expect(Object.keys(state)).toEqual(expect.arrayContaining(Object.keys(blank)))
  })
})
