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
  // jsdom has no layout: an element reports the box written in `data-top` and
  // `data-bottom`, or else the box of its children, the way a paragraph wraps its runs.
  function boxOf(element) {
    if (element.dataset.bottom || !element.children.length) {
      const top = Number(element.dataset.top ?? 0)
      const bottom = Number(element.dataset.bottom ?? 0)
      return { top, bottom }
    }
    const boxes = [...element.children].map(boxOf)
    const top = Math.min(...boxes.map(box => box.top))
    const bottom = Math.max(...boxes.map(box => box.bottom))
    return { top, bottom }
  }

  beforeEach(() => {
    vi.spyOn(window.HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      return boxOf(this)
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

  it('cuts a paragraph of images taller than a page between its images', () => {
    const markup = '<span data-top="0" data-bottom="250"><img alt="1"></span><span data-top="250" data-bottom="500"><img alt="2"></span><span data-top="500" data-bottom="750"><img alt="3"></span>'
    const container = mountSection(`<article><p>${markup}</p></article>`)
    paginateDocx(container)
    const images = [...container.querySelectorAll('section.docx img')]
    const pages = images.map(image => image.closest('section.docx'))
    const alts = images.map(image => image.alt)
    expect(new Set(pages).size).toBe(3)
    expect(alts).toEqual(['1', '2', '3'])
  })

  it('keeps a paragraph of text taller than a page whole', () => {
    const container = mountSection('<article><p><span data-top="0" data-bottom="250">a</span><span data-top="250" data-bottom="500">b</span></p></article>')
    paginateDocx(container)
    expect(container.querySelectorAll('section.docx')).toHaveLength(1)
    expect(container.querySelectorAll('p')).toHaveLength(1)
  })

  it('keeps an image on the line of the text before it', () => {
    const container = mountSection('<article><p><span data-top="0" data-bottom="20">a</span><span data-top="0" data-bottom="250"><img></span><span data-top="250" data-bottom="500"><img></span></p></article>')
    paginateDocx(container)
    const first = container.querySelector('section.docx')
    expect(first.querySelectorAll('img')).toHaveLength(1)
    expect(first.textContent).toBe('a')
  })

  it('leaves a document that already has page breaks untouched', () => {
    const page = '<section class="docx" style="min-height: 400px; padding-top: 50px; padding-bottom: 50px"><article><p data-bottom="200">a</p><p data-bottom="350">b</p></article></section>'
    const container = document.createElement('div')
    container.innerHTML = page + page
    paginateDocx(container)
    expect(container.querySelectorAll('section.docx')).toHaveLength(2)
  })

  it('keeps a table of images taller than a page whole', () => {
    const container = mountSection('<article></article>')
    const table = document.createElement('table')
    const rows = [[0, 250], [250, 500], [500, 750]]
    rows.forEach(([top, bottom]) => {
      const row = document.createElement('tr')
      row.dataset.top = top
      row.dataset.bottom = bottom
      row.innerHTML = '<td><img></td>'
      table.appendChild(row)
    })
    container.querySelector('article').appendChild(table)
    paginateDocx(container)
    expect(container.querySelectorAll('table')).toHaveLength(1)
  })

  it('numbers a cut list paragraph once', () => {
    const images = '<span data-top="0" data-bottom="250"><img></span><span data-top="250" data-bottom="500"><img></span>'
    const container = mountSection(`<article><p class="docx-num-1-0 docx_listparagraph">${images}</p></article>`)
    paginateDocx(container)
    const classes = [...container.querySelectorAll('p')].map(paragraph => paragraph.className)
    expect(classes).toEqual(['docx-num-1-0 docx_listparagraph', 'docx_listparagraph'])
  })

  it('cuts a paragraph of vector pictures between its pictures', () => {
    const pictures = '<span data-top="0" data-bottom="250"><svg></svg></span><span data-top="250" data-bottom="500"><svg></svg></span>'
    const container = mountSection(`<article><p>${pictures}</p></article>`)
    paginateDocx(container)
    expect(container.querySelectorAll('p')).toHaveLength(2)
  })
})
