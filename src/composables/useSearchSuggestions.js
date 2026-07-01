import { ref, unref } from 'vue'
import bodybuilder from 'bodybuilder'
import lucene from 'lucene'
import { castArray, escapeRegExp, get, last, orderBy, some, throttle } from 'lodash'

import { useCore } from '@/composables/useCore'
import settings from '@/utils/settings'

// Quote a term when it contains characters Lucene would otherwise interpret.
function escapeLuceneChars(str) {
  const escapable = [' ', '+', '-', '&&', '||', '!', '(', ')', '{', '}', '[', ']', '^', '~', '?', ':', '\\', '/']
  return some(escapable, char => str.indexOf(char) > -1) ? JSON.stringify(str) : str
}

/**
 * Search-bar term suggestions: parse the Lucene query for candidate terms,
 * fetch matching terms from Elasticsearch, and inject a chosen term back.
 *
 * @param {Object} sources reactive sources
 * @param {import('vue').Ref<String>} sources.query the current query string
 * @param {import('vue').Ref<String>} sources.field the current field key
 * @param {import('vue').Ref<Array>} sources.formIndices indices to search in
 * @param {import('vue').Ref<Boolean>} sources.focused whether the input is focused
 */
export function useSearchSuggestions({ query, field, formIndices, focused }) {
  const core = useCore()
  const suggestions = ref([])
  const activeSuggestions = ref([])

  // Recursively collect readable term candidates from the parsed query AST.
  function termCandidates(ast = null) {
    try {
      let terms = []
      ast = ast === null ? lucene.parse(unref(query)) : ast
      if (ast.left) {
        terms = terms.concat(termCandidates(ast.left))
      }
      if (ast.right) {
        terms = terms.concat(termCandidates(ast.right))
      }
      if (settings.suggestedFields.indexOf(ast.field) > -1) {
        terms.push(ast)
      }
      return terms
    }
    catch {
      return []
    }
  }

  // Suggestions are only offered on implicit/tag fields for long-enough terms.
  const suggestionsAllowed = () => {
    const terms = termCandidates().map(candidate => candidate.term)
    const lastTerm = last(terms) || ''
    return ['all', settings.suggestedImplicitFields].indexOf(unref(field)) > -1 && lastTerm.length > 4
  }

  function replaceLastTermCandidate(term, ast = null) {
    ast = ast === null ? lucene.parse(unref(query)) : ast
    if (ast.right) {
      replaceLastTermCandidate(term, ast.right)
    }
    else if (ast.left) {
      replaceLastTermCandidate(term, ast.left)
    }
    else if (ast.term === termCandidates().pop().term) {
      ast.term = ast.quoted ? term : escapeLuceneChars(term)
    }
    return ast
  }

  function injectTermInQuery(term, ast = null) {
    try {
      ast = replaceLastTermCandidate(term, ast)
      return lucene.toString(ast)
    }
    catch {
      return unref(query)
    }
  }

  async function suggestTerms(candidates) {
    const currentQuery = unref(query)
    const index = unref(formIndices).join(',')
    const candidate = last(candidates)
    const fields = castArray(candidate.field === '<implicit>' ? settings.suggestedImplicitFields : candidate.field)
    const include = `.*${escapeRegExp(candidate.term).toLowerCase()}.*`
    const body = bodybuilder().size(0)
    fields.forEach(f => body.aggregation('terms', f, { include }, f))
    const preference = 'search-bar-suggestions'
    const response = await core.api.elasticsearch.search({ index, body: body.build(), preference })
    const suggestionsPerField = fields.map(f => get(response, `aggregations.${f}.buckets`, []))
    const orderedSuggestions = orderBy(suggestionsPerField.flat(), ['doc_count'], ['desc'])
    // Return the query alongside so the caller can discard stale results.
    return { query: currentQuery, suggestions: orderedSuggestions }
  }

  const searchTerms = throttle(async () => {
    try {
      if (suggestionsAllowed()) {
        const result = await suggestTerms(termCandidates())
        // Ignore the result if the user left the input or changed the query.
        if (unref(focused)) {
          suggestions.value = result.query === unref(query) ? result.suggestions : []
          activeSuggestions.value = []
        }
      }
      else {
        suggestions.value = []
      }
    }
    catch {
      hideSuggestions()
    }
  }, 200)

  function hideSuggestions() {
    suggestions.value = []
  }

  function selectTerm(term) {
    return term ? injectTermInQuery(term.key, null) : unref(query)
  }

  return {
    suggestions,
    activeSuggestions,
    suggestionsAllowed,
    termCandidates,
    injectTermInQuery,
    suggestTerms,
    searchTerms,
    selectTerm,
    hideSuggestions
  }
}

export default useSearchSuggestions
