import { SORT_TYPE_KEY } from '@/composables/useViewSettings'

export function useViewProperties() {
  const propertyItem = ({
    key,
    icon = null,
    text = null,
    sortable = false,
    emphasis = false,
    sortingKey = null,
    type = SORT_TYPE_KEY.ALPHA,
    required = false,
    thStyle = {},
    colStyle = {}
  }) => {
    return {
      key,
      icon,
      text,
      sortingKey,
      type,
      emphasis,
      sortable,
      required,
      thStyle,
      colStyle
    }
  }

  return { propertyItem }
}
