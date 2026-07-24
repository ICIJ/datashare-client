import { shallowMount } from '@vue/test-utils'

import BatchSearchCardDetails from '@/components/BatchSearch/BatchSeachCard/BatchSearchCardDetails'
import BatchSearchCardDetailsEntry from '@/components/BatchSearch/BatchSeachCard/BatchSearchCardDetailsEntry'
import CoreSetup from '~tests/unit/CoreSetup'

describe('BatchSearchCardDetails', () => {
  const batchSearch = {
    uuid: 'uuid',
    nbResults: 2,
    nbQueries: 3,
    nbQueriesWithoutResults: 1,
    phraseMatches: true,
    proximity: 2,
    fuzziness: 1,
    date: '2020-01-01',
    user: { id: 'user' },
    projects: ['local-datashare'],
    state: 'DONE',
    published: true,
    uri: '/#/search?q=foo'
  }

  function mountWith(overrides = {}) {
    const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()
    return shallowMount(BatchSearchCardDetails, {
      props: { batchSearch: { ...batchSearch, ...overrides } },
      global: { plugins }
    })
  }

  it('displays the proximity entry when phraseMatches is true', () => {
    const wrapper = mountWith({ phraseMatches: true })
    const labels = wrapper.findAllComponents(BatchSearchCardDetailsEntry).map(entry => entry.props('label'))
    expect(labels).toContain('Proximity - Sentence changes')
    expect(labels).not.toContain('Fuzziness - Spelling changes')
  })

  it('displays the fuzziness entry when phraseMatches is false', () => {
    const wrapper = mountWith({ phraseMatches: false })
    const labels = wrapper.findAllComponents(BatchSearchCardDetailsEntry).map(entry => entry.props('label'))
    expect(labels).toContain('Fuzziness - Spelling changes')
    expect(labels).not.toContain('Proximity - Sentence changes')
  })

  it('does not warn about an undefined "phraseMatch" property', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mountWith()
    const undefinedPropertyWarning = warnSpy.mock.calls.find(([message]) => {
      return typeof message === 'string' && message.includes('phraseMatch') && !message.includes('phraseMatches')
    })
    expect(undefinedPropertyWarning).toBeUndefined()
    warnSpy.mockRestore()
  })
})

describe.skip('BatchSearchCardDetails (legacy)', () => {
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
