const GRID = 'grid'
const LIST = 'list'
const TABLE = 'table'

export const LAYOUTS = Object.freeze({ LIST, TABLE, GRID })
export const layoutValidator = l => Object.values(LAYOUTS).includes(l)
