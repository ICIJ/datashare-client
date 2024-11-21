import { useViewSettings } from '@/composables/view-settings'

export function useTaskProperties() {
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
  const propertyId = propertyItem({
    key: 'id',
    icon: 'image',
    sortable: true
  })
  const propertyName = propertyItem({
    icon: 'image',
    key: 'name',
    sortable: true,
    required: true
  })
  const propertyCreatedAt = propertyItem({
    icon: 'image',
    key: 'createdAt',
    sortingKey: 'creationDate',
    sortingType: SORT_TYPE_KEY.DATE,
    sortable: true
  })
  const propertyProgress = propertyItem({
    icon: 'image',
    key: 'progress',
    sortingType: SORT_TYPE_KEY.NUMBER,
    sortable: true
  })
  const propertyState = propertyItem({
    icon: 'image',
    key: 'state',
    type: SORT_TYPE_KEY.NUMBER,
    sortable: false
  })

  const propertyItems = [propertyId, propertyName, propertyCreatedAt, propertyProgress, propertyState]

  return { propertyItems }
}
