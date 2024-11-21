import { useViewSettings } from '@/composables/view-settings'

export function useTaskProperties(propertyList) {
  const { SORT_TYPE_KEY } = useViewSettings()

  const propertyItem = ({
    key,
    icon = null,
    sortable = false,
    sortingKey = null,
    sortingType = SORT_TYPE_KEY.ALPHA,
    required = false
  }) => ({
    key,
    icon,
    sortingKey,
    sortingType,
    sortable,
    required
  })
  const id = propertyItem({
    key: 'id',
    icon: 'image',
    sortable: true
  })
  const name = propertyItem({
    icon: 'image',
    key: 'name',
    sortable: true,
    required: true
  })
  const createdAt = propertyItem({
    icon: 'image',
    key: 'createdAt',
    sortingKey: 'creationDate',
    sortingType: SORT_TYPE_KEY.DATE,
    sortable: true
  })

  const progress = propertyItem({
    icon: 'image',
    key: 'progress',
    sortingType: SORT_TYPE_KEY.NUMBER,
    sortable: true
  })
  const state = propertyItem({
    icon: 'image',
    key: 'state',
    type: SORT_TYPE_KEY.NUMBER,
    sortable: false,
    required: true
  })
  const propertyItems = {
    id,
    name,
    createdAt,
    progress,
    state
  }
  const items = propertyList.reduce((acc, p) => {
    if (propertyItems[p] === undefined) {
      acc.push(propertyItem({ key: p }))
      console.warn(`${p} does not exist`)
      return acc
    }
    acc.push(propertyItems[p])
    return acc
  }, [])
  console.log('propertyList', propertyList)
  return { items }
}
