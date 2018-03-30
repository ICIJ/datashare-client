const DEFAULT_ROWS = [
  {
    height: '1em',
    boxes: [[0, '5em']]
  },
  {
    height: '1em',
    boxes: [[0, '5em'], ['1em', '60%']]
  },
  {
    height: '1em',
    boxes: [[0, '5em']]
  },
  {
    height: '1em',
    boxes: [[0, '5em'], ['1em', '40%']]
  },
  {
    height: '1em',
    boxes: [[0, '5em']]
  }
]

export function isFlexBasis (str) {
  return Number(str).toString() === str.toString()
}

export function isWidth (str) {
  const cssSuffix = ['px', '%', 'em', 'rem']
  let checkState = false
  cssSuffix.forEach(suffix => {
    if (Number(str.split(suffix)[0]) &&
    str.split(suffix)[1] === '' &&
    str.split(suffix).length === 2) {
      checkState = true
    }
  })
  return checkState
}

export function getBoxStyle (left, width, isLast, subClass = 'box') {
  const arr = []
  if (left !== 0) {
    if (isFlexBasis(left)) {
      arr.push({style: `flex-grow: ${left}; flex-shrink: 0; flex-basis: 0;`, subClass})
    } else if (isWidth(left)) {
      arr.push({style: `flex-grow: 0; flex-shrink: 0; flex-basis: ${left};`, subClass})
    }
  }
  if (isFlexBasis(width)) {
    arr.push({style: `flex-grow: ${width}; flex-shrink: 0; flex-basis: 0;`})
  } else if (isWidth(width)) {
    arr.push({style: `flex-grow: 0; flex-shrink: 0; flex-basis: ${width};`})
  }
  if (isLast) {
    arr.push({style: 'flex-grow: 1; flex-shrink: 0; flex-basis: 0;', subClass})
  }
  return arr
}

export function formatRows (rows = DEFAULT_ROWS, subClass = 'box') {
  const rowArr = []
  rows.forEach(row => {
    let boxArr = []
    const rowObj = {}
    // Add height
    rowObj.height = row.height
    // Add style
    row.boxes.forEach((box, index) => {
      const isLast = index === row.boxes.length - 1
      boxArr = boxArr.concat(getBoxStyle(box[0], box[1], isLast, subClass))
    })
    rowObj.boxes = boxArr
    rowArr.push(rowObj)
  })

  return rowArr
}

export default {
  isFlexBasis,
  isWidth,
  getBoxStyle,
  formatRows
}
