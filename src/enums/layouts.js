const TABLE = 'table'
const GRID = 'grid'

export const LAYOUTS = Object.freeze({ TABLE, GRID })
export const layoutValidator = (l) => Object.values(LAYOUTS).includes(l)
