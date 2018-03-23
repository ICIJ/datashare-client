import {map, escape, zipObject, takeRight} from 'lodash'

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

export function highlight (str, marks, beginFun = (m => '<mark>'), endFun = (m => '</mark>')) {
  let docContentSlices = sliceIndexes(str, map(marks, m => m.offset))
  let docContentMarked = map(zipObject(takeRight(docContentSlices, marks.length), marks), (m, s) => {
    return beginFun(m) + m.mention + endFun(m) + escape(s.substring(m.mention.length))
  })
  return docContentSlices[0] + docContentMarked.join('')
  // return `<mark class="ner ${ne.category}">${ne.source.mention}</mark>` + escape(s.substring(ne.source.mention.length))
}
