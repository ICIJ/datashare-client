import map from 'lodash/map'
import { DOMParser } from 'xmldom'
import FakeWorker from './fake-worker.js'

function replaceInChildNodes (element, needle, replacement) {
  if (element.nodeName === '#text') {
    return element.nodeValue.replace(needle, replacement)
  } else {
    const html = map(element.childNodes, child => {
      return replaceInChildNodes(child, needle, replacement)
    })
    element.innerHTML = html.join('')
  }
  return element.outerHTML
}

function addLocalSearchMarks (content = '', localSearchTerm = '') {
  const localSearchOccurrences = (content.match(new RegExp('(?![^<]*>)' + localSearchTerm, 'gi')) || []).length
  const localSearchIndex = Number(!!localSearchOccurrences)

  if (localSearchOccurrences === 0) {
    return { content, localSearchIndex, localSearchOccurrences }
  }

  const needle = RegExp(`(${localSearchTerm})`, 'gim')
  const parser = new DOMParser()
  const dom = parser.parseFromString(content, 'text/html')

  replaceInChildNodes(dom.body || dom, needle, '<mark class="local-search-term">$1</mark>')

  return {
    content: dom.innerHTML,
    localSearchIndex,
    localSearchOccurrences
  }
}

self.addEventListener('message', ({ data }) => {
  const result = addLocalSearchMarks(data.content, data.localSearchTerm)
  // Send the data to the worker host
  self.postMessage(result)
})

export default class LocalSearchWorker extends FakeWorker {
  postMessage (data) {
    const result = addLocalSearchMarks(data.content, data.localSearchTerm)
    // Send the data to parent method (which pass the data to the host)
    super.postMessage(result)
  }
}
