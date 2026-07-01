import { mount } from '@vue/test-utils'
import { ref, computed, defineComponent } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSearchSuggestions } from '@/composables/useSearchSuggestions'

function withComposable(queryInit = '', fieldInit = 'all') {
  let api
  const Host = defineComponent({
    setup() {
      const query = ref(queryInit)
      const field = ref(fieldInit)
      const formIndices = computed(() => ['local-datashare'])
      const focused = ref(true)
      api = { query, field, ...useSearchSuggestions({ query, field, formIndices, focused }) }
      return () => null
    }
  })
  const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()
  mount(Host, { global: { plugins } })
  return api
}

describe('useSearchSuggestions', () => {
  it('extracts implicit term candidates from the query', () => {
    const { query, termCandidates } = withComposable('hello')
    query.value = 'hello'
    const candidates = termCandidates()
    expect(candidates.map(candidate => candidate.term)).toContain('hello')
  })

  it('injects a selected term in place of the last candidate', () => {
    const { query, injectTermInQuery } = withComposable('hel')
    query.value = 'hel'
    expect(injectTermInQuery('hello')).toBe('hello')
  })

  it('returns the original query when injection cannot parse', () => {
    const { query, injectTermInQuery } = withComposable('')
    query.value = ''
    expect(injectTermInQuery('hello')).toBe('')
  })
})
