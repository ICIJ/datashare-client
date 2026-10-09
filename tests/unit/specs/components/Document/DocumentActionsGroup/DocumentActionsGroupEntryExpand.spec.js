import { mount } from '@vue/test-utils'
import { routeLocationKey, routerKey } from 'vue-router'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentActionsGroupEntryExpand from '@/components/Document/DocumentActionsGroup/DocumentActionsGroupEntryExpand'

describe('DocumentActionsGroupEntryExpand.vue', () => {
  const document = { index: 'local-datashare', id: 'doc-id', routerParams: { index: 'local-datashare', id: 'doc-id' } }
  let core, router

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    router = { resolve: () => ({ href: '#/ds/local-datashare/doc-id' }), push: vi.fn() }
  })

  function mountExpand(routeName) {
    return mount(DocumentActionsGroupEntryExpand, {
      global: {
        plugins: core.plugins,
        provide: {
          [routerKey]: router,
          [routeLocationKey]: { matched: [{ name: routeName }], query: {} }
        },
        stubs: { DocumentActionsGroupEntry: { template: '<a />' } }
      },
      props: { document }
    })
  }

  it('opens the document through the router on the search route', () => {
    const wrapper = mountExpand('search')
    const event = new MouseEvent('click', { cancelable: true })

    wrapper.find('a').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(router.push).toHaveBeenCalledWith({ name: 'document', params: document.routerParams, query: { modal: true } })
  })
})
