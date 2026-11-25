import { groupBlocksIntoPages, paginateDocx } from '@/utils/docxPages'

describe('groupBlocksIntoPages', () => {
  it('keeps every block on one page when they all fit', () => {
    expect(groupBlocksIntoPages([100, 200, 300], 300)).toEqual([[0, 1, 2]])
  })

  it('starts a new page with the first block passing the page bottom', () => {
    expect(groupBlocksIntoPages([100, 200, 350], 300)).toEqual([[0, 1], [2]])
  })

  it('measures the next page from the bottom of the last block kept', () => {
    expect(groupBlocksIntoPages([100, 250, 400, 500], 300)).toEqual([[0, 1], [2, 3]])
  })

  it('gives a block taller than a page a page of its own', () => {
    expect(groupBlocksIntoPages([100, 500, 600], 300)).toEqual([[0], [1], [2]])
  })

  it('returns no page for no block', () => {
    expect(groupBlocksIntoPages([], 300)).toEqual([])
  })
})

describe('paginateDocx', () => {
  // jsdom has no layout: each block reports the bottom written in `data-bottom`.
  beforeEach(() => {
    vi.spyOn(window.HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      const bottom = Number(this.dataset.bottom ?? 0)
      return { top: 0, bottom }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mountSection(html) {
    const container = document.createElement('div')
    container.innerHTML = `<section class="docx" style="min-height: 400px; padding-top: 50px; padding-bottom: 50px">${html}</section>`
    return container
  }

  it('moves the blocks past the page bottom to a new section', () => {
    const container = mountSection('<article><p data-bottom="200">a</p><p data-bottom="350">b</p></article>')
    paginateDocx(container)
    const sections = container.querySelectorAll('section.docx')
    expect(sections).toHaveLength(2)
    expect(sections[0].textContent).toBe('a')
    expect(sections[1].textContent).toBe('b')
  })

  it('copies the page styles to the new section', () => {
    const container = mountSection('<article><p data-bottom="200">a</p><p data-bottom="350">b</p></article>')
    paginateDocx(container)
    const second = container.querySelectorAll('section.docx')[1]
    expect(second.style.minHeight).toBe('400px')
  })

  it('copies the header and the footer to the new section', () => {
    const container = mountSection('<header>H</header><article><p data-bottom="200">a</p><p data-bottom="350">b</p></article><footer>F</footer>')
    paginateDocx(container)
    const second = container.querySelectorAll('section.docx')[1]
    expect(second.textContent).toBe('HbF')
  })

  it('keeps a moved block in an article shaped like its own', () => {
    const container = mountSection('<article><p data-bottom="200">a</p></article><article style="column-count: 2"><p data-bottom="350">b</p></article>')
    paginateDocx(container)
    const article = container.querySelectorAll('section.docx')[1].querySelector('article')
    expect(article.style.columnCount).toBe('2')
    expect(article.textContent).toBe('b')
  })

  it('leaves a section that fits untouched', () => {
    const container = mountSection('<article><p data-bottom="100">a</p></article>')
    paginateDocx(container)
    expect(container.querySelectorAll('section.docx')).toHaveLength(1)
  })

  it('leaves a section with no article untouched', () => {
    const container = mountSection('<header>H</header>')
    paginateDocx(container)
    expect(container.querySelectorAll('section.docx')).toHaveLength(1)
  })

  it('moves the notes of a split section to its last page', () => {
    const container = mountSection('<article><p data-bottom="200">a</p><p data-bottom="350">b</p></article><ol><li>note</li></ol><footer>F</footer>')
    paginateDocx(container)
    const sections = container.querySelectorAll('section.docx')
    expect(sections[0].textContent).toBe('aF')
    expect(sections[1].textContent).toBe('bnoteF')
  })
})
