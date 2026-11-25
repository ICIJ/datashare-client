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

function paginateSection(section) {
  const blocks = [...section.querySelectorAll(':scope > article > *')]
  if (!blocks.length) {
    return
  }
  const bottoms = measureBottoms(section, blocks)
  const pageHeight = contentHeight(section)
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

export function paginateDocx(container) {
  const sections = container.querySelectorAll('section.docx')
  sections.forEach(paginateSection)
}
