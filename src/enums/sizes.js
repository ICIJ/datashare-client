const XS = 'xs'
const SM = 'sm'
const MD = 'md'
const LG = 'lg'
const XL = 'xl'
const XXL = 'xxl'
export const SIZE = Object.freeze({ XS, SM, MD, LG, XL, XXL })
export const BUTTON_SIZES = [SM, MD, LG]
export const buttonSizeValidator = (v) => BUTTON_SIZES.includes(v)

export const INPUT_SIZES = [SM, MD, LG]
export const inputSizeValidator = (v) => INPUT_SIZES.includes(v)

export const BREAKPOINT_SIZES = Object.values(SIZE)
export const breakpointSizeValidator = (v) => BREAKPOINT_SIZES.includes(v)
