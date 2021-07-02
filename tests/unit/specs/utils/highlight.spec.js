import { Highlight } from '@/utils/highlight'

describe('Highlight', () => {
  it('should hightlight one "foo"', () => {
    const content = 'foo, bar, baz'
    const highlighted = Highlight.create({ content }).ranges([{ start: 0, length: 3 }])
    expect(highlighted).toBe('<mark>foo</mark>, bar, baz')
  })

  it('should hightlight one "bar"', () => {
    const content = 'foo, bar, baz'
    const highlighted = Highlight.create({ content }).ranges([{ start: 5, length: 3 }])
    expect(highlighted).toBe('foo, <mark>bar</mark>, baz')
  })

  it('should hightlight one "baz"', () => {
    const content = 'foo, bar, baz'
    const highlighted = Highlight.create({ content }).ranges([{ start: 10, length: 3 }])
    expect(highlighted).toBe('foo, bar, <mark>baz</mark>')
  })

  it('should hightlight "foo" and "bar"', () => {
    const content = 'foo, bar, baz'
    const highlighted = Highlight.create({ content }).ranges([{ start: 0, length: 3 }, { start: 5, length: 3 }])
    expect(highlighted).toBe('<mark>foo</mark>, <mark>bar</mark>, baz')
  })

  it('should hightlight "foo", "bar" and "baz"', () => {
    const content = 'foo, bar, baz'
    const highlighted = Highlight.create({ content }).ranges([{ start: 0, length: 3 }, { start: 5, length: 3 }, { start: 10, length: 3 }])
    expect(highlighted).toBe('<mark>foo</mark>, <mark>bar</mark>, <mark>baz</mark>')
  })

  it('should not hightlight', () => {
    const content = 'foo, bar, baz'
    const highlighted = Highlight.create({ content }).ranges()
    expect(highlighted).toBe('foo, bar, baz')
  })

  it('should hightlight one "bar" with a custom class', () => {
    const content = 'foo, bar, baz'
    const each = m => `<mark class="local-mark">${m.content}</mark>`
    const highlighted = Highlight.create({ content, each }).ranges([{ start: 5, length: 3 }])
    expect(highlighted).toBe('foo, <mark class="local-mark">bar</mark>, baz')
  })

  it('should hightlight "foo" and "bar" with a category class', () => {
    const content = 'foo, bar, baz'
    const each = m => `<mark class="${m.category}">${m.content}</mark>`
    const highlighted = Highlight.create({ content, each }).ranges([
      { start: 0, length: 3, category: 'person' },
      { start: 5, length: 3, category: 'location' }
    ])
    expect(highlighted).toBe('<mark class="person">foo</mark>, <mark class="location">bar</mark>, baz')
  })

  it('should hightlight only "ba" to avoid overlap', () => {
    const content = 'foo, bar, baz'
    const highlighted = Highlight.create({ content }).ranges([
      { start: 5, length: 2 },
      { start: 5, length: 3 }
    ])
    expect(highlighted).toBe('foo, <mark>ba</mark>r, baz')
  })

  it('should hightlight only "bar" to avoid overlap', () => {
    const content = 'foo, bar, baz'
    const highlighted = Highlight.create({ content }).ranges([
      { start: 5, length: 3 },
      { start: 6, length: 2 },
      { start: 7, length: 1 },
      { start: 7, length: 2 }
    ])
    expect(highlighted).toBe('foo, <mark>bar</mark>, baz')
  })
})
