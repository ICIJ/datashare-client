const BLOCK_SELECTOR = ':scope > article > *'
const PARAGRAPH_SELECTOR = ':scope > article > p'
// docx-preview draws a VML picture as an svg.
const IMAGE_SELECTOR = 'img, svg'
const NUMBERING_CLASS = /^docx-num-/
const RENDERED_PAGE_BREAK = 'lastRenderedPageBreak'

function isOverflowingPage(bottom, pageTop, pageHeight) {
  const blockHeightOnPage = bottom - pageTop
  return blockHeightOnPage > pageHeight
}

export function groupBlocksIntoPages(bottoms, pageHeight) {
  const pages = []
  let pageTop = 0
  bottoms.forEach((bottom, index) => {
    const currentPage = pages.at(-1)
    if (currentPage && !isOverflowingPage(bottom, pageTop, pageHeight)) {
      currentPage.push(index)
      return
    }
    pageTop = bottoms[index - 1] ?? 0
    pages.push([index])
  })
  return pages
}

function measureContentHeight(section) {
  const { minHeight, paddingTop, paddingBottom } = window.getComputedStyle(section)
  const pageHeight = parseFloat(minHeight)
  const margins = parseFloat(paddingTop) + parseFloat(paddingBottom)
  return pageHeight - margins
}

function measureBottoms(section, blocks) {
  const firstArticle = section.querySelector(':scope > article')
  const { top } = firstArticle.getBoundingClientRect()
  return blocks.map(block => block.getBoundingClientRect().bottom - top)
}

function appendCloneOf(element, page) {
  if (element) {
    const clone = element.cloneNode(true)
    page.appendChild(clone)
  }
}

// Blocks moved from different articles keep an article shaped like their own (columns).
function moveBlocksInto(page, blocks) {
  let article = null
  blocks.forEach((block) => {
    const source = block.parentElement
    if (article?.source !== source) {
      const clone = source.cloneNode(false)
      article = { source, clone }
      page.appendChild(clone)
    }
    article.clone.appendChild(block)
  })
}

function buildPage(section, blocks) {
  const page = section.cloneNode(false)
  appendCloneOf(section.querySelector(':scope > header'), page)
  moveBlocksInto(page, blocks)
  appendCloneOf(section.querySelector(':scope > footer'), page)
  return page
}

function isHoldingImage(element) {
  return element.matches(IMAGE_SELECTOR) || element.querySelector(IMAGE_SELECTOR) !== null
}

function isNextToImage(children, index) {
  const previous = children[index - 1]
  const isPreviousHoldingImage = index > 0 && isHoldingImage(previous)
  return isHoldingImage(children[index]) || isPreviousHoldingImage
}

// Scanned pages come as one paragraph holding one image per line: it is cut
// before a child starting below everything before it, next to an image, so
// runs sharing a line stay together and text is never cut.
function findCutIndexes(paragraph) {
  const children = [...paragraph.children]
  const indexes = []
  let linesBottom = -Infinity
  children.forEach((child, index) => {
    const box = child.getBoundingClientRect()
    const isOnNewLine = index > 0 && box.top >= linesBottom
    if (isOnNewLine && isNextToImage(children, index)) {
      indexes.push(index)
    }
    linesBottom = Math.max(linesBottom, box.bottom)
  })
  return indexes
}

// The numbering class counts a list item, so only the first piece keeps it.
function cloneWithoutNumbering(paragraph) {
  const piece = paragraph.cloneNode(false)
  const classes = [...piece.classList]
  const numberings = classes.filter(name => NUMBERING_CLASS.test(name))
  piece.classList.remove(...numberings)
  return piece
}

function cutParagraph(paragraph, indexes) {
  const children = [...paragraph.children]
  let previous = paragraph
  indexes.forEach((start, position) => {
    const end = indexes[position + 1] ?? children.length
    const piece = cloneWithoutNumbering(paragraph)
    const moved = children.slice(start, end)
    piece.append(...moved)
    previous.after(piece)
    previous = piece
  })
}

function isTallerThan(element, height) {
  const { top, bottom } = element.getBoundingClientRect()
  return bottom - top > height
}

// Only paragraphs are cut: a cut table would lose its column widths and merged cells.
// Every cut is measured before any is made, so the cuts do not change the measures.
function cutTallParagraphs(section, pageHeight) {
  const paragraphs = [...section.querySelectorAll(PARAGRAPH_SELECTOR)]
  const tallParagraphs = paragraphs.filter(paragraph => isTallerThan(paragraph, pageHeight))
  const cuts = tallParagraphs.map(paragraph => [paragraph, findCutIndexes(paragraph)])
  cuts.forEach(([paragraph, indexes]) => cutParagraph(paragraph, indexes))
}

function insertPages(section, blocks, groups) {
  let previous = section
  groups.slice(1).forEach((group) => {
    const pageBlocks = group.map(index => blocks[index])
    const page = buildPage(section, pageBlocks)
    previous.after(page)
    previous = page
  })
  return previous
}

// docx-preview writes the page footnotes, and the endnotes, as a list after the articles.
function moveNotesToLastPage(section, lastPage) {
  const notes = section.querySelectorAll(':scope > ol')
  const footer = lastPage.querySelector(':scope > footer')
  notes.forEach(note => lastPage.insertBefore(note, footer))
}

function paginateSection(section) {
  const pageHeight = measureContentHeight(section)
  cutTallParagraphs(section, pageHeight)
  const blocks = [...section.querySelectorAll(BLOCK_SELECTOR)]
  if (!blocks.length) {
    return
  }
  const bottoms = measureBottoms(section, blocks)
  const groups = groupBlocksIntoPages(bottoms, pageHeight)
  const lastPage = insertPages(section, blocks, groups)
  moveNotesToLastPage(section, lastPage)
}

export function paginateDocx(container) {
  const sections = container.querySelectorAll('section.docx')
  sections.forEach(paginateSection)
}

function containsRenderedPageBreak(element) {
  const children = element.children ?? []
  return element.break === RENDERED_PAGE_BREAK || children.some(containsRenderedPageBreak)
}

/**
 * Whether Word laid the document out and wrote where its pages break. Such a
 * document is best left as Word cut it: viewed without its fonts, each page can
 * overflow by a line, and splitting it would add a near-empty page each time.
 *
 * @param {object} [wordDocument] - The document `renderAsync` resolves with.
 * @returns {boolean}
 */
export function hasRenderedPageBreaks(wordDocument) {
  const body = wordDocument?.documentPart?.body
  return body ? containsRenderedPageBreak(body) : false
}
