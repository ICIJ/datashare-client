const TABLE = 'table'
const CARDS = 'cards'

export const LAYOUTS = Object.freeze({ TABLE, CARDS })
export const layoutValidator = (l) => Object.values(LAYOUTS).includes(l)
