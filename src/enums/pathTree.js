const TREE = 'tree'
const LIST = 'list'
const GRID = 'grid'

export const LAYOUTS = Object.freeze({ LIST, GRID, TREE })
export const layoutValidator = l => Object.values(LAYOUTS).includes(l)

const SIZE = 'size'
const COUNT = '_count'
const KEY = '_key'

export const SORT_BY = Object.freeze({ SIZE, COUNT, KEY })
export const sortByValidator = order => Object.values(SORT_BY).includes(order)

const DESC = 'desc'
const ASC = 'asc'

export const ORDER_BY = Object.freeze({ ASC, DESC })
export const orderByValidator = order => Object.values(ORDER_BY).includes(order)
