import { VARIANTS, VARIANTS_PLAIN } from "@/enums/variants"
import { LAYOUTS } from "@/enums/layouts"
import { BUTTON_SIZES, BREAKPOINT_SIZES } from "@/enums/sizes"
import { FORMAT_FROM_NOW, FORMAT_LONG, FORMAT_SHORT } from "@/utils/humanDate"
import { ICON_WEIGHTS } from "@/enums/iconWeights"
import { ENTITY_CATEGORIES } from "@/enums/entityCategories"
import { OFFCANVAS_PLACEMENTS } from "@/enums/placements"

export const variantsArgType = {
  control: 'select',
  options: VARIANTS
}
export const variantsPlainArgType = {
  control: 'select',
  options: VARIANTS_PLAIN
}
export const buttonSizesArgType = {
  control: 'inline-radio',
  options: BUTTON_SIZES
}
export const breakpointSizeArgType = {
  control: 'select',
  options: BREAKPOINT_SIZES
}
export const dateFormatArgType = {
  control: 'select',
  options: [FORMAT_SHORT, FORMAT_LONG, FORMAT_FROM_NOW]
}
export const iconWeightsArgType = {
  control: 'select',
  options: ICON_WEIGHTS
}
export const entityCategoriesArgType = {
  control: 'select',
  options: ENTITY_CATEGORIES
}
export const inputTypeArgType = {
  control: 'select',
  options: [
    'text',
    'number',
    'email',
    'password',
    'search',
    'url',
    'tel',
    'date',
    'time',
    'range',
    'color',
    'datetime',
    'datetime-local',
    'month',
    'week'
  ]
}
export const layoutArgType = {
  control: 'select',
  options: Object.values(LAYOUTS)
}
export const offcanvasPlacementArgType = {
  control: 'select',
  options: OFFCANVAS_PLACEMENTS
}
