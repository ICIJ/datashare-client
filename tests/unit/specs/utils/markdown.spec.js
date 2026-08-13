import { renderMarkdown, normalizeHeaderlessTables } from '@/utils/markdown'

describe('renderMarkdown', () => {
  it('renders GFM features', async () => {
    const html = await renderMarkdown(
      ['# Title', '', '| a | b |', '| - | - |', '| 1 | 2 |', '', '- [x] done', '- [ ] todo', '', '~~struck~~', '', 'https://example.org/report'].join('\n')
    )
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<table>')
    expect(html).toMatch(/<input[^>]*type="checkbox"/)
    expect(html).toContain('<del>struck</del>')
    expect(html).toContain('href="https://example.org/report"')
  })

  it('renders GFM footnotes with matching ref/target ids so navigation works', async () => {
    const html = await renderMarkdown('A claim.[^1]\n\n[^1]: The footnote body.')
    expect(html).toContain('class="footnotes"')
    expect(html).toContain('The footnote body')
    // The reference link must point at the id the footnote item actually has;
    // a double "user-content-" prefix would desync these and break navigation.
    const refHref = html.match(/href="(#user-content-fn-[^"]+)"/)?.[1]
    expect(refHref).toBeTruthy()
    expect(html).toContain(`id="${refHref.slice(1)}"`)
  })

  it('does not harden in-document footnote/fragment anchors', async () => {
    const html = await renderMarkdown('A claim.[^1]\n\n[^1]: The footnote body.')
    const footnoteRef = html.match(/<a href="#user-content-fn-1"[^>]*>/)?.[0]
    expect(footnoteRef).toBeTruthy()
    expect(footnoteRef).not.toContain('target="_blank"')
  })

  it('strips dangerous HTML, schemes and remote images', async () => {
    const html = await renderMarkdown(
      ['<script>alert(1)</script>', '<img src="x" onerror="alert(1)">', '<iframe src="https://evil.example"></iframe>', '[x](javascript:alert(1))', '![p](https://evil.example/track.png)'].join('\n\n')
    )
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('<img')
  })

  it('strips the data: link scheme', async () => {
    const html = await renderMarkdown('[x](data:text/html;base64,PHNjcmlwdD4=)')
    expect(html).not.toContain('data:')
  })

  it('hardens external and protocol-relative links with rel and target', async () => {
    const external = await renderMarkdown('[safe](https://example.org)')
    expect(external).toContain('rel="noopener noreferrer nofollow"')
    expect(external).toContain('target="_blank"')

    const protocolRelative = await renderMarkdown('[x](//evil.example)')
    expect(protocolRelative).toContain('target="_blank"')

    // Relative links stay untouched (no new tab, no rel).
    const relative = await renderMarkdown('[doc](../other)')
    expect(relative).toContain('href="../other"')
    expect(relative).not.toContain('target="_blank"')
  })

  it('returns an empty string for empty input', async () => {
    expect(await renderMarkdown('')).toBe('')
  })
})

describe('normalizeHeaderlessTables', () => {
  it('synthesizes an empty header row above a delimiter row that starts a table block', () => {
    const source = '|---|---|\n| a | b |\n'
    expect(normalizeHeaderlessTables(source)).toBe('| | |\n|---|---|\n| a | b |\n')
  })

  it('synthesizes a header row with the same cell count as the delimiter row', () => {
    const source = '|---|---|---|\n| a | b | c |\n'
    const normalized = normalizeHeaderlessTables(source)
    const [headerLine, delimiterLine] = normalized.split('\n')
    expect(headerLine).toBe('| | | |')
    expect(delimiterLine).toBe('|---|---|---|')
  })

  it('fixes multiple headerless tables in the same document', () => {
    const source = ['|---|---|', '| a | b |', '', '|--|--|--|', '| 1 | 2 | 3 |', ''].join('\n')
    const normalized = normalizeHeaderlessTables(source)
    expect(normalized).toBe(['| | |', '|---|---|', '| a | b |', '', '| | | |', '|--|--|--|', '| 1 | 2 | 3 |', ''].join('\n'))
  })

  it('fires when the delimiter row is the very first line of the document', () => {
    // index 0 has no preceding line at all; that must still count as "headerless".
    const source = '|---|---|\n| a | b |\n'
    expect(normalizeHeaderlessTables(source).startsWith('| | |\n')).toBe(true)
  })

  it('fires when the delimiter row is the very last line, with no data rows after it', () => {
    const source = 'Intro.\n\n|---|---|'
    expect(normalizeHeaderlessTables(source)).toBe('Intro.\n\n| | |\n|---|---|')
  })

  it('does not touch a delimiter row that already has a header above it', () => {
    const source = '| a | b |\n|---|---|\n| 1 | 2 |\n'
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('does not treat a bare thematic break as a delimiter row', () => {
    // "---" has no pipe: it is a thematic break, not a table delimiter.
    const source = 'Above.\n\n---\n\nBelow.\n'
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('does not treat a pipe-containing line without dashes as a delimiter row', () => {
    const source = '| not a delimiter |\n'
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('does not touch a headerless-looking table inside a fenced code block (backtick fence)', () => {
    const source = ['```', '|---|---|', '| a | b |', '```', ''].join('\n')
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('does not touch a headerless-looking table inside a fenced code block (tilde fence)', () => {
    const source = ['~~~', '|---|---|', '| a | b |', '~~~', ''].join('\n')
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('leaves a headerless table nested in a blockquote untouched (not corrupted, not fixed)', () => {
    // The leading "> " breaks the plain-delimiter pattern, so this is a known
    // limitation rather than a regression: the source passes through unchanged.
    const source = '> |---|---|\n> | a | b |\n'
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('is idempotent: running it twice has the same effect as running it once', () => {
    const source = '|---|---|\n| a | b |\n'
    const once = normalizeHeaderlessTables(source)
    const twice = normalizeHeaderlessTables(once)
    expect(twice).toBe(once)
  })

  it('leaves markdown with no headerless tables byte-identical', () => {
    const source = ['# Title', '', '| a | b |', '| - | - |', '| 1 | 2 |', '', 'Some prose about it.', ''].join('\n')
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('does not touch a headerless-looking delimiter row inside a 4-space-indented code block', () => {
    // 4+ leading spaces make this an indented code block, not a table, even
    // though the line right above it is blank.
    const source = ['    some code', '', '    |---|---|', ''].join('\n')
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('makes renderMarkdown produce a <table> for a real headerless GFM table', async () => {
    const html = await renderMarkdown('|---|---|\n| a | b |\n| c | d |\n')
    expect(html).toContain('<table>')
    expect(html).toContain('<th></th>')
    expect(html).toContain('<td>a</td>')
  })
})
