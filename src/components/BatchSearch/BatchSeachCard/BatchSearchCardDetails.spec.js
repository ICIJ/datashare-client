import { shallowMount } from '@vue/test-utils'

import BatchSearchCardDetails from '@/components/BatchSearch/BatchSeachCard/BatchSearchCardDetails'
import CoreSetup from '~tests/unit/CoreSetup'

describe.skip('BatchSearchCardDetails', () => {
  let plugins
  beforeAll(() => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
  })

  const props = { batchSearch: {} }
  it('should display a button to download queries', () => {
    const wrapper = shallowMount(BatchSearchCardDetails, { props, global: { plugins } })
    expect(wrapper.find('.batch-search-actions__item--download-queries').exists()).toBeTruthy()
  })

  it('should build a link to download queries without results', () => {
    const wrapper = shallowMount(BatchSearchCardDetails, { props, global: { plugins } })
    expect(wrapper.vm.downloadQueriesWithoutResultsUrl).toContain('maxResults=0')
  })

  it('should display a button to download results', async () => {
    const wrapper = shallowMount(BatchSearchCardDetails, { props, global: { plugins } })
    expect(wrapper.find('.batch-search-actions__item--download-results').exists()).toBeTruthy()
  })
})
