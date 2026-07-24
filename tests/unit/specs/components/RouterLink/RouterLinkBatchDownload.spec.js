import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import RouterLinkBatchDownload from '@/components/RouterLink/RouterLinkBatchDownload'

function itemWith({ uri = 'file:///tmp/archive.zip', exists } = {}) {
  const batchDownload = { filename: 'file:///tmp/archive.zip' }
  if (exists !== undefined) {
    batchDownload.exists = exists
  }
  return {
    id: 'task-1',
    result: uri ? { value: { uri } } : undefined,
    args: { batchDownload }
  }
}

describe('RouterLinkBatchDownload.vue', () => {
  let plugins

  beforeAll(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('renders an active link when the file exists', () => {
    const wrapper = mount(RouterLinkBatchDownload, {
      global: { plugins },
      props: { item: itemWith({ exists: true }) }
    })
    const link = wrapper.find('a.router-link-batch-download')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/api/task/task-1/result')
    expect(wrapper.find('.router-link-batch-download--disabled').exists()).toBe(false)
  })

  it('renders a disabled span when the file no longer exists', () => {
    const wrapper = mount(RouterLinkBatchDownload, {
      global: { plugins },
      props: { item: itemWith({ exists: false }) }
    })
    expect(wrapper.find('a').exists()).toBe(false)
    const span = wrapper.find('span.router-link-batch-download')
    expect(span.exists()).toBe(true)
    expect(span.classes()).toContain('router-link-batch-download--disabled')
  })

  it('renders an active link when the exists field is absent (backward compatible)', () => {
    const wrapper = mount(RouterLinkBatchDownload, {
      global: { plugins },
      props: { item: itemWith() }
    })
    expect(wrapper.find('a.router-link-batch-download').exists()).toBe(true)
  })

  it('renders a disabled span when there is no result', () => {
    const wrapper = mount(RouterLinkBatchDownload, {
      global: { plugins },
      props: { item: itemWith({ uri: null, exists: true }) }
    })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('.router-link-batch-download--disabled').exists()).toBe(true)
  })

  it('only treats a strict false as missing (a non-boolean falsy exists keeps the link active)', () => {
    const wrapper = mount(RouterLinkBatchDownload, {
      global: { plugins },
      props: { item: itemWith({ exists: null }) }
    })
    expect(wrapper.find('a.router-link-batch-download').exists()).toBe(true)
    expect(wrapper.find('.router-link-batch-download--disabled').exists()).toBe(false)
  })
})
