import escapeRegExp from 'lodash/escapeRegExp'
import identity from 'lodash/identity'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import takeRight from 'lodash/takeRight'
import zip from 'lodash/zip'

export function slugger (value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
    .replace(/\s/g, '-')
}

export function addLocalSearchMarks (content = '<div></div>', localSearchTerm = { label: '' }) {
  const escapedLocalSearchTerm = localSearchTerm.regex ? localSearchTerm.label : escapeRegExp(localSearchTerm.label)
  // In case the searched term is split on 2 lines in the content
  const escapedLocalSearchTermAsRegex = escapedLocalSearchTerm.replace(' ', '( |  |.|..| .)')
  const regex = new RegExp(`(?![^<]*>)${escapedLocalSearchTermAsRegex}`, 'gims')
  const localSearchOccurrences = (content.match(regex) || []).length
  const localSearchIndex = Number(!!localSearchOccurrences)

  try {
    if (localSearchOccurrences === 0) throw new Error()
    const needle = new RegExp(`(${escapedLocalSearchTermAsRegex})`, 'gims')
    const replacedContent = content.replace(needle,
      m => `<mark class="local-search-term">${m.replace(/(\r\n|\n|\r)/gm, ' ').replace('  ', ' ')}</mark>`
    )

    return {
      content: replacedContent,
      localSearchIndex,
      localSearchOccurrences
    }
  // Silently fails
  } catch (error) {
    return { content, localSearchIndex, localSearchOccurrences }
  }
}

export function sliceIndexes (str, indexes) {
  if (str.length === 0) return []
  const orderedIndexes = Array.from(new Set(indexes)).sort((a, b) => a - b)
  const result = []
  let currentIndex = 0
  for (const index of orderedIndexes) {
    if (index >= 0 && index < str.length) {
      const items = str.substring(currentIndex, index)
      result.push(items)
      currentIndex = index
    }
  }
  result.push(str.substring(currentIndex))
  return result
}

export function highlight (str = '', marks = [], markFun = (m => `<mark>${m.content}</mark>`), restFun = identity, contentFun = (m => m.content)) {
  const sortedMarks = sortBy(marks, m => m.index)
  const docContentSlices = sliceIndexes(str, map(sortedMarks, m => m.index))
  const docContentMarked = map(zip(takeRight(docContentSlices, sortedMarks.length), sortedMarks), ([slice = '', mark]) => {
    return markFun(mark) + restFun(slice.substring(contentFun(mark).length))
  })
  return docContentSlices[0] + docContentMarked.join('')
}

export function isUrl (url = '') {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
  return !!pattern.test(url)
}
