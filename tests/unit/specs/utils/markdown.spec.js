import { renderMarkdown } from '@/utils/markdown'

describe('renderMarkdown', () => {
  it('renders GFM features', () => {
    const html = renderMarkdown(
      ['# Title', '', '| a | b |', '| - | - |', '| 1 | 2 |', '', '- [x] done', '- [ ] todo', '', '~~struck~~', '', 'https://example.org/report'].join('\n')
    )
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<table>')
    expect(html).toMatch(/<input[^>]*type="checkbox"/)
    expect(html).toContain('<del>struck</del>')
    expect(html).toContain('href="https://example.org/report"')
  })

  it('strips dangerous HTML, schemes and remote images', () => {
    const html = renderMarkdown(
      ['<script>alert(1)</script>', '<img src="x" onerror="alert(1)">', '<iframe src="https://evil.example"></iframe>', '[x](javascript:alert(1))', '![p](https://evil.example/track.png)'].join('\n\n')
    )
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('<img')
  })

  it('hardens links with rel and target', () => {
    const html = renderMarkdown('[safe](https://example.org)')
    expect(html).toContain('rel="noopener noreferrer nofollow"')
    expect(html).toContain('target="_blank"')
  })

  it('returns an empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('')
  })
})
