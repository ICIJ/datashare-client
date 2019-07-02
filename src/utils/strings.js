import identity from 'lodash/identity'
import map from 'lodash/map'
import takeRight from 'lodash/takeRight'
import zip from 'lodash/zip'

export function sliceIndexes (str, indexes) {
  if (str.length === 0) return []
  let orderedIndexes = Array.from(new Set(indexes)).sort((a, b) => a - b)
  let result = []
  let currentIndex = 0
  for (let index of orderedIndexes) {
    if (index >= 0 && index < str.length) {
      let items = str.substring(currentIndex, index)
      result.push(items)
      currentIndex = index
    }
  }
  result.push(str.substring(currentIndex))
  return result
}

export function highlight (str = '', marks = [], markFun = (m => `<mark>${m.content}</mark>`), restFun = identity, contentFun = (m => m.content)) {
  let docContentSlices = sliceIndexes(str, map(marks, m => m.index))
  let docContentMarked = map(zip(takeRight(docContentSlices, marks.length), marks), ([slice, mark]) => {
    return markFun(mark) + restFun(slice.substring(contentFun(mark).length))
  })
  return docContentSlices[0] + docContentMarked.join('')
}
