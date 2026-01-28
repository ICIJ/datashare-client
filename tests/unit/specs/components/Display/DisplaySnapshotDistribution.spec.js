import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplaySnapshotDistribution from '@/components/Display/DisplaySnapshotDistribution'

describe('DisplaySnapshotDistribution', () => {
  function mountComponent(props = {}) {
    const { plugins } = CoreSetup.init().useI18n()
    return mount(DisplaySnapshotDistribution, {
      global: { plugins },
      props
    })
  }

  it('should render the component', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-dist:opensearch-ver:2.11.0' })
    expect(wrapper.find('.display-snapshot-distribution').exists()).toBeTruthy()
  })

  it('should extract and display OpenSearch distribution', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-dist:opensearch-ver:2.11.0' })
    expect(wrapper.text()).toBe('OpenSearch')
  })

  it('should extract and display Elasticsearch distribution', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-dist:elasticsearch-ver:8.11.1' })
    expect(wrapper.text()).toBe('Elasticsearch')
  })

  it('should default to Elasticsearch when no distribution in snapshot name', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-ver:8.11.1' })
    expect(wrapper.text()).toBe('Elasticsearch')
  })

  it('should default to Elasticsearch when only name in snapshot', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox' })
    expect(wrapper.text()).toBe('Elasticsearch')
  })

  it('should use DisplayEsDistribution component under the hood', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-dist:opensearch-ver:2.11.0' })
    expect(wrapper.findComponent({ name: 'DisplayEsDistribution' }).exists()).toBeTruthy()
  })
})
