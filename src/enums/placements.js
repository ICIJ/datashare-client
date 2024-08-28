const AUTO = 'auto'
const AUTO_START = 'auto_start'
const AUTO_END = 'auto_end'
const RIGHT = 'right'
const LEFT = 'left'
const TOP = 'top'
const BOTTOM = 'bottom'
const RIGHT_END = 'right-end'
const LEFT_END = 'left-end'
const TOP_END = 'top-end'
const BOTTOM_END = 'bottom-end'
const RIGHT_START = 'right-start'
const LEFT_START = 'left-start'
const TOP_START = 'top-start'
const BOTTOM_START = 'bottom-start'
export const PLACEMENT = Object.freeze({
  AUTO,
  AUTO_START,
  AUTO_END,
  RIGHT,
  LEFT,
  TOP,
  BOTTOM,
  RIGHT_END,
  LEFT_END,
  TOP_END,
  BOTTOM_END,
  RIGHT_START,
  LEFT_START,
  TOP_START,
  BOTTOM_START
})
export const PLACEMENTS = Object.values(PLACEMENT)
export const placementValidator = (v) => PLACEMENTS.includes(v)