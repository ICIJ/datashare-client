export function groupBlocksIntoPages(bottoms, pageHeight) {
  const pages = []
  let page = []
  let pageTop = 0
  bottoms.forEach((bottom, index) => {
    if (page.length && bottom - pageTop > pageHeight) {
      pages.push(page)
      page = []
      pageTop = bottoms[index - 1]
    }
    page.push(index)
  })
  if (page.length) {
    pages.push(page)
  }
  return pages
}

function contentHeight(section) {
  const { minHeight, paddingTop, paddingBottom } = window.getComputedStyle(section)
  return parseFloat(minHeight) - parseFloat(paddingTop) - parseFloat(paddingBottom)
}

function measureBottoms(section, blocks) {
  const article = section.querySelector(':scope > article')
  const top = article.getBoundingClientRect().top
  return blocks.map(block => block.getBoundingClientRect().bottom - top)
}

function appendClone(page, element) {
  if (element) {
    page.appendChild(element.cloneNode(true))
  }
}

function buildPage(section, blocks) {
  const page = section.cloneNode(false)
  appendClone(page, section.querySelector(':scope > header'))
  let parent = null
  let article = null
  blocks.forEach((block) => {
    if (block.parentElement !== parent) {
      parent = block.parentElement
      article = parent.cloneNode(false)
      page.appendChild(article)
    }
    article.appendChild(block)
  })
  appendClone(page, section.querySelector(':scope > footer'))
  return page
}

const IMAGES = 'img, svg'
const NUMBERING_CLASS = /^docx-num-/

// docx-preview draws a VML picture as an svg.
function holdsImage(element) {
  return element.matches(IMAGES) || element.querySelector(IMAGES) !== null
}

// Scanned pages come as one paragraph holding one image per line: it is cut
// before a child starting below everything before it, next to an image, so
// runs sharing a line stay together and text is never cut.
function cutIndexes(block) {
  const children = [...block.children]
  const indexes = []
  let bottom = -Infinity
  children.forEach((child, index) => {
    const box = child.getBoundingClientRect()
    const previous = children[index - 1]
    const previousHoldsImage = index > 0 && holdsImage(previous)
    const nearImage = holdsImage(child) || previousHoldsImage
    if (index > 0 && nearImage && box.top >= bottom) {
      indexes.push(index)
    }
    bottom = Math.max(bottom, box.bottom)
  })
  return indexes
}

// The numbering class counts a list item, so only the first piece keeps it.
function cloneWithoutNumbering(block) {
  const fragment = block.cloneNode(false)
  const numberings = [...fragment.classList].filter(name => NUMBERING_CLASS.test(name))
  fragment.classList.remove(...numberings)
  return fragment
}

function cutBlock(block, indexes) {
  const children = [...block.children]
  let previous = block
  indexes.forEach((start, position) => {
    const end = indexes[position + 1] ?? children.length
    const fragment = cloneWithoutNumbering(block)
    const moved = children.slice(start, end)
    fragment.append(...moved)
    previous.after(fragment)
    previous = fragment
  })
}

// Only paragraphs are cut: a cut table would lose its column widths and merged cells.
function cutTallBlocks(section, pageHeight) {
  const paragraphs = [...section.querySelectorAll(':scope > article > p')]
  const tallBlocks = paragraphs.filter((block) => {
    const { top, bottom } = block.getBoundingClientRect()
    return bottom - top > pageHeight
  })
  const cuts = tallBlocks.map(block => [block, cutIndexes(block)])
  cuts.forEach(([block, indexes]) => cutBlock(block, indexes))
}

function paginateSection(section) {
  const pageHeight = contentHeight(section)
  cutTallBlocks(section, pageHeight)
  const blocks = [...section.querySelectorAll(':scope > article > *')]
  if (!blocks.length) {
    return
  }
  const bottoms = measureBottoms(section, blocks)
  const groups = groupBlocksIntoPages(bottoms, pageHeight)
  let previous = section
  groups.slice(1).forEach((group) => {
    const pageBlocks = group.map(index => blocks[index])
    const page = buildPage(section, pageBlocks)
    previous.after(page)
    previous = page
  })
  // docx-preview writes the page footnotes, and the endnotes, as a list after the articles.
  const notes = section.querySelectorAll(':scope > ol')
  const footer = previous.querySelector(':scope > footer')
  notes.forEach(note => previous.insertBefore(note, footer))
}

// A docx with page breaks is left as Word cut it: viewed without its fonts,
// each page can overflow by a line, which would add a near-empty page each time.
export function paginateDocx(container) {
  const sections = container.querySelectorAll('section.docx')
  if (sections.length === 1) {
    paginateSection(sections[0])
  }
}
