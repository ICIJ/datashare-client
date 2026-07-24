import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayEsDistribution from '@/components/Display/DisplayEsDistribution'
import { ES_DISTRIBUTION } from '@/enums/esDistributions'

describe('DisplayEsDistribution', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComponent(props = {}) {
    return mount(DisplayEsDistribution, {
      global: { plugins },
      props
    })
  }

  it('should render the component', () => {
    const wrapper = mountComponent({ value: ES_DISTRIBUTION.ELASTICSEARCH })
    expect(wrapper.find('.display-es-distribution').exists()).toBeTruthy()
  })

  it('should display "Elasticsearch" for elasticsearch distribution', () => {
    const wrapper = mountComponent({ value: ES_DISTRIBUTION.ELASTICSEARCH })
    expect(wrapper.text()).toBe('Elasticsearch')
  })

  it('should display "OpenSearch" for opensearch distribution', () => {
    const wrapper = mountComponent({ value: ES_DISTRIBUTION.OPENSEARCH })
    expect(wrapper.text()).toBe('OpenSearch')
  })

  it('should default to elasticsearch when no value provided', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toBe('Elasticsearch')
  })
})
