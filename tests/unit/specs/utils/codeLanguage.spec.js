import { LanguageDescription } from '@codemirror/language'
import { languages } from '@codemirror/language-data'

import { findLanguage } from '@/utils/codeLanguage'

function describeLanguage(name) {
  return LanguageDescription.matchLanguageName(languages, name)
}

function loadLanguage(name) {
  return describeLanguage(name).load()
}

describe('codeLanguage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('picks the language from the file name first', async () => {
    const support = await findLanguage({ basename: 'script.py', contentType: 'application/json' })
    expect(support).toBe(await loadLanguage('Python'))
  })

  it('falls back on the content type', async () => {
    const support = await findLanguage({ basename: 'data', contentType: 'application/json' })
    expect(support).toBe(await loadLanguage('JSON'))
  })

  it('ignores the content type parameters', async () => {
    const support = await findLanguage({ basename: 'tweet', contentType: 'application/json; twint' })
    expect(support).toBe(await loadLanguage('JSON'))
  })

  it('drops the x- prefix of the content type', async () => {
    const support = await findLanguage({ basename: 'Program', contentType: 'text/x-csharp' })
    expect(support).toBe(await loadLanguage('C#'))
  })

  it.each([
    ['text/x-java-source', 'Java'],
    ['application/x-httpd-php', 'PHP'],
    ['text/x-c++src', 'C++'],
    ['text/x-csrc', 'C']
  ])('maps %s to %s', async (contentType, name) => {
    const support = await findLanguage({ basename: 'source', contentType })
    expect(support).toBe(await loadLanguage(name))
  })

  it('highlights any +xml content type as XML', async () => {
    const support = await findLanguage({ basename: 'feed', contentType: 'application/rdf+xml' })
    expect(support).toBe(await loadLanguage('XML'))
  })

  it('shows plain text as plain text', async () => {
    const support = await findLanguage({ basename: 'notes', contentType: 'text/plain' })
    expect(support).toBeNull()
  })

  it('does not match a language hidden inside another content type name', async () => {
    const support = await findLanguage({ basename: 'message', contentType: 'text/x-tika-text-based-message' })
    expect(support).toBeNull()
  })

  it('shows plain text when the language pack fails to load', async () => {
    vi.spyOn(describeLanguage('JSON'), 'load').mockRejectedValue(new Error('offline'))
    const support = await findLanguage({ basename: 'data.json', contentType: 'application/json' })
    expect(support).toBeNull()
  })
})
