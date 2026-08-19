import { renderMarkdown, normalizeHeaderlessTables } from '@/utils/markdown'

describe('renderMarkdown', () => {
  it('renders GFM features', async () => {
    const html = await renderMarkdown(
      ['# Title', '', '| a | b |', '| - | - |', '| 1 | 2 |', '', '- [x] done', '- [ ] todo', '', '~~struck~~', '', 'https://example.org/report'].join('\n')
    )
    expect(html).toContain('<h1 id="title">Title</h1>')
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
  })

  it('unlinks a query-only href, keeping the label it wrapped', async () => {
    // What documents converted from Google Docs carry: a link resolving against
    // whatever page shows the document, which for this app means throwing the
    // reader out of the hash route and back to the root.
    const html = await renderMarkdown('[**Proportionality**](?tab=t.0#heading=h.75blkms5zf8c)')
    expect(html).not.toContain('<a')
    expect(html).toContain('<strong>Proportionality</strong>')
  })

  it('unlinks a relative link, keeping its text', async () => {
    const html = await renderMarkdown('[doc](../other)')
    expect(html).not.toContain('<a')
    expect(html).toContain('doc')
  })

  it('unlinks an absolute link back to the host serving the app', async () => {
    const html = await renderMarkdown(`[home](${window.location.origin}/some/page)`)
    expect(html).not.toContain('<a')
    expect(html).toContain('home')
  })

  it('keeps a mailto link, which navigates nothing', async () => {
    const html = await renderMarkdown('[write](mailto:someone@example.org)')
    expect(html).toContain('href="mailto:someone@example.org"')
  })

  it('unlinks an href it cannot parse rather than failing the whole document', async () => {
    const html = await renderMarkdown('[broken](http://%) and text after it')
    expect(html).not.toContain('<a')
    expect(html).toContain('broken')
    expect(html).toContain('and text after it')
  })

  it('gives headings slug ids so in-document links have a target', async () => {
    const html = await renderMarkdown('# My Section\n\nSee [the section](#my-section).')
    expect(html).toContain('<h1 id="my-section">My Section</h1>')
    const linkHref = html.match(/href="(#[^"]+)"/)?.[1]
    expect(linkHref).toBe('#my-section')
    expect(html).toContain(`id="${linkHref.slice(1)}"`)
  })

  it('disambiguates the ids of headings sharing the same text', async () => {
    const html = await renderMarkdown('# Notes\n\n# Notes')
    expect(html).toContain('<h1 id="notes">Notes</h1>')
    expect(html).toContain('<h1 id="notes-1">Notes</h1>')
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

  it('does not fire when no table row follows the delimiter row', () => {
    // Synthesizing a header here would build a table with no body rows, and
    // the line's own text would vanish from the rendered output.
    const source = 'Intro.\n\n|---|---|'
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('does not fire when the delimiter row is followed by a blank line', () => {
    const source = 'INVOICE\n\n|-------------------|\n\nTotal: 100\n'
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('does not treat a list item made of pipes and dashes as a delimiter row', () => {
    const source = 'intro\n\n- |\n- foo\n'
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('does not treat a row with a non-delimiter cell as a delimiter row', () => {
    // GFM requires every delimiter cell to hold at least one dash.
    const source = 'Intro.\n\n| --- |  | --- |\n| a | b | c |\n'
    expect(normalizeHeaderlessTables(source)).toBe(source)
  })

  it('fires on an indented delimiter row (GFM needs no matching indentation)', () => {
    const source = 'Intro.\n\n  |---|---|\n  | a | b |\n'
    expect(normalizeHeaderlessTables(source)).toBe('Intro.\n\n| | |\n  |---|---|\n  | a | b |\n')
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
    expect(html).toContain('<td>a</td>')
  })
})

describe('renderMarkdown table header stripping', () => {
  it('drops the synthesized thead entirely, leaving the data rows intact as tbody rows', async () => {
    const html = await renderMarkdown('|---|---|\n| a | b |\n| c | d |\n')
    expect(html).toContain('<table>')
    expect(html).not.toContain('<thead>')
    expect(html).not.toContain('<th>')
    expect(html).toContain('<tbody>')
    expect(html).toContain('<td>a</td>')
    expect(html).toContain('<td>b</td>')
    expect(html).toContain('<td>c</td>')
    expect(html).toContain('<td>d</td>')
  })

  it('also drops a blank thead the document itself contains', async () => {
    // A header row an author left blank for column alignment is indistinguishable
    // from a synthesized one, and renders the same: an empty row of cells.
    const html = await renderMarkdown('|   |   |\n|---|---|\n| a | b |\n')
    expect(html).not.toContain('<thead>')
    expect(html).toContain('<td>a</td>')
  })

  it('keeps a thead whose header cells hold no text node', async () => {
    const html = await renderMarkdown('| ![a](https://e.org/a.png) | ![b](https://e.org/b.png) |\n|---|---|\n| 1 | 2 |\n')
    expect(html).toContain('<thead>')
    expect(html).toContain('<td>1</td>')
  })

  it('keeps the text of a rule-like line instead of turning it into an empty table', async () => {
    const html = await renderMarkdown('INVOICE\n\n|-------------------|\n\nTotal: 100\n')
    expect(html).toContain('INVOICE')
    expect(html).toContain('|-------------------|')
    expect(html).toContain('Total: 100')
    expect(html).not.toContain('<table>')
  })

  it('keeps a thead whose header cells all have real text', async () => {
    const html = await renderMarkdown('| a | b |\n|---|---|\n| 1 | 2 |\n')
    expect(html).toContain('<thead>')
    expect(html).toContain('<th>a</th>')
    expect(html).toContain('<th>b</th>')
  })

  it('keeps a thead when only some of its header cells are empty', async () => {
    // Dropping the thead here would lose the real "b" header data.
    const html = await renderMarkdown('|  | b |\n|---|---|\n| 1 | 2 |\n')
    expect(html).toContain('<thead>')
    expect(html).toContain('<th></th>')
    expect(html).toContain('<th>b</th>')
  })

  it('does not affect an unrelated part of the document', async () => {
    const html = await renderMarkdown(['# Title', '', '|---|---|', '| a | b |', '', 'Some prose.', ''].join('\n'))
    expect(html).toContain('<h1 id="title">Title</h1>')
    expect(html).not.toContain('<thead>')
    expect(html).toContain('<p>Some prose.</p>')
  })

  it('handles a headerless table and a normal table in the same document independently', async () => {
    const source = ['|---|---|', '| a | b |', '', '| x | y |', '|---|---|', '| 1 | 2 |', ''].join('\n')
    const html = await renderMarkdown(source)
    const [firstTable, secondTable] = html.split('</table>')
    expect(firstTable).not.toContain('<thead>')
    expect(secondTable).toContain('<thead>')
    expect(secondTable).toContain('<th>x</th>')
  })
})
