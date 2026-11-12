import { createRouter, createMemoryHistory } from 'vue-router'

import { isRedirectSource, recordRedirectSource } from '@/router/redirectSources'

describe('redirectSources', () => {
  const component = { template: '<div />' }
  const routes = [
    { path: '/', name: 'home', component },
    { path: '/target', name: 'target', component },
    { path: '/guarded', name: 'guarded', component, beforeEnter: () => ({ name: 'target' }) }
  ]
  let router

  beforeEach(async () => {
    window.sessionStorage.clear()
    router = createRouter({ history: createMemoryHistory(), routes })
    router.afterEach(recordRedirectSource)
    await router.push('/')
  })

  it('records a URL a guard redirected away from', async () => {
    await router.push('/guarded?q=1')
    expect(isRedirectSource('/guarded?q=1')).toBe(true)
  })

  it('does not record a URL reached without redirect', async () => {
    await router.push('/target')
    expect(isRedirectSource('/target')).toBe(false)
  })

  it('does not treat a missing path as a redirect source', () => {
    expect(isRedirectSource(undefined)).toBe(false)
  })
})
