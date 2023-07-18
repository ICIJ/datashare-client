import { escapeRegExp, some, trimEnd } from 'lodash'

export function slugger(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
    .replace(/\s/g, '-')
}

export function isUrl(value, protocols = ['https', 'http']) {
  let url

  try {
    url = new URL(value)
  } catch (_) {
    return false
  }

  return some(protocols, (protocol) => protocol === trimEnd(url.protocol, ':'))
}

export function addLocalSearchMarksClassByOffsets({ content = '', term = '', offsets = [], delta = 0 } = {}) {
  // Create one chunk for each letter
  const chunks = content.split('')
  // Add mark tag to the corresponding letters
  offsets.forEach((offset) => {
    const start = offset - Number(delta)
    const end = Math.min(start + term.length - 1, chunks.length - 1)
    // Only replace by offset in existing chunk
    if (chunks[start] && chunks[end]) {
      chunks[start] = `<mark class="local-search-term" data-offset="${offset}">${chunks[start]}`
      chunks[end] = `${chunks[end]}</mark>`
    }
  })
  // Then merge letters again
  return chunks.join('')
}

export function addLocalSearchMarksClass(content = '<div></div>', localSearchTerm = { label: '' }) {
  const escapedLocalSearchTerm = localSearchTerm.regex ? localSearchTerm.label : escapeRegExp(localSearchTerm.label)
  // In case the searched term is split on 2 lines in the content
  const escapedLocalSearchTermAsRegex = escapedLocalSearchTerm.replace(' ', '( |  |.|..| .)')
  const regex = new RegExp(`(?![^<]*>)${escapedLocalSearchTermAsRegex}`, 'gims')
  const localSearchOccurrences = (content.match(regex) || []).length
  const localSearchIndex = Number(!!localSearchOccurrences)
  try {
    if (localSearchOccurrences === 0) throw new Error()
    const needle = new RegExp(`(${escapedLocalSearchTermAsRegex})`, 'gims')
    const replacedContent = content.replace(needle, (m) => {
      const term = m.replace(/(\r\n|\n|\r)/gm, ' ').replace('  ', ' ')
      return `<mark class="local-search-term">${term}</mark>`
    })

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