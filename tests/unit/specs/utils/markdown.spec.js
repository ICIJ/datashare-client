import { renderMarkdown } from '@/utils/markdown'

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
