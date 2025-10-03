const BOTH = 'both'
const START = 'start'
const END = 'end'

export const DISPLAY = Object.freeze({ BOTH, START, END })
export const DISPLAYS = Object.values(DISPLAY)
export const displayValidator = v => DISPLAYS.includes(v.toLowerCase())
