import { shallowMount } from '@vue/test-utils'
import { RouterLinkStub } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentThreadEntryHeaderCreationDate from '@/components/Document/DocumentThread/DocumentThreadEntryHeaderCreationDate'

describe('DocumentThreadEntryHeaderCreationDate.vue', () => {
  let core

  const mockEmail = {
    id: 'email_01',
    creationDate: new Date('2020-12-04T00:00:01Z'),
    creationDateHuman: 'December 4, 2020',
    routerParams: { id: 'email_01', index: 'test-index', routing: 'email_01' }
  }

  function createWrapper(props = {}) {
    return shallowMount(DocumentThreadEntryHeaderCreationDate, {
      global: {
        plugins: core.plugins,
        stubs: {
          RouterLink: RouterLinkStub
        }
      },
      props: {
        email: mockEmail,
        ...props
      }
    })
  }

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('should render a router-link when creationDate exists', () => {
    const wrapper = createWrapper()
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(true)
  })

  it('should not render a router-link when creationDate is missing', () => {
    const wrapper = createWrapper({
      email: { id: 'email_01', routerParams: {} }
    })
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false)
  })

  it('should render DisplayDatetimeLong with the creation date', () => {
    const wrapper = createWrapper()
    const display = wrapper.findComponent({ name: 'DisplayDatetimeLong' })
    expect(display.exists()).toBe(true)
    expect(display.props('value')).toEqual(mockEmail.creationDate)
  })

  it('should link to the document route with correct params', () => {
    const wrapper = createWrapper()
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.props('to')).toEqual({
      name: 'document',
      params: { id: 'email_01', index: 'test-index', routing: 'email_01' }
    })
  })
})
