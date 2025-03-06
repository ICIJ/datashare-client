import { SORT_TYPE_KEY } from '@/composables/view-settings'

export function useTaskProperties(propertyList) {
  const propertyItem = ({
    key,
    icon = null,
    sortable = false,
    emphasis = false,
    sortingKey = null,
    type = SORT_TYPE_KEY.ALPHA,
    required = false
  }) => {
    return {
      key,
      icon,
      sortingKey,
      type,
      emphasis,
      sortable,
      required
    }
  }
  const id = propertyItem({
    key: 'id',
    icon: null,
    sortable: true
  })
  const name = propertyItem({
    icon: 'list-checks',
    key: 'name',
    sortable: true,
    emphasis: true,
    required: true
  })
  const createdAt = propertyItem({
    icon: 'calendar-blank',
    key: 'createdAt',
    sortingKey: 'creationDate',
    type: SORT_TYPE_KEY.DATE,
    sortable: true
  })

  const progress = propertyItem({
    icon: 'clock-countdown',
    key: 'progress',
    type: SORT_TYPE_KEY.NUMBER,
    sortable: true
  })
  const state = propertyItem({
    icon: null,
    key: 'state',
    type: SORT_TYPE_KEY.NUMBER,
    sortable: false,
    required: true
  })

  const project = propertyItem({
    icon: 'circles-three-plus',
    key: 'project',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: false,
    required: false
  })
  const projects = propertyItem({
    icon: 'circles-three-plus',
    key: 'projects',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: false,
    required: false
  })

  const entitiesToFind = propertyItem({
    icon: 'users-three',
    key: 'entitiesToFind',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: false,
    required: false
  })
  const pipeline = propertyItem({
    icon: 'shooting-star',
    key: 'pipeline',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: true,
    required: false
  })
  const documents = propertyItem({
    icon: 'files',
    key: 'documents',
    type: SORT_TYPE_KEY.NUMBER,
    sortable: true,
    required: false
  })

  const privacy = propertyItem({
    icon: null,
    key: 'privacy',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: true,
    required: false
  })

  const author = propertyItem({
    icon: 'user-circle',
    key: 'author',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: true,
    required: false
  })
  const queries = propertyItem({
    icon: 'magnifying-glass',
    key: 'queries',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: true,
    required: false
  })
  const size = propertyItem({
    icon: 'hard-drives',
    key: 'size',
    type: SORT_TYPE_KEY.NUMBER,
    sortable: true,
    required: false
  })
  const taskType = propertyItem({
    icon: 'rocket-launch',
    key: 'taskType',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: true,
    required: false
  })
  const propertyItems = {
    id,
    name,
    createdAt,
    progress,
    state,
    project,
    projects,
    entitiesToFind,
    pipeline,
    documents,
    privacy,
    queries,
    size,
    author,
    taskType
  }
  const items = propertyList.reduce((acc, p) => {
    if (propertyItems[p] === undefined) {
      acc.push(propertyItem({ key: p }))
      console.warn(`${p} is not declared in task properties.`)
      return acc
    }
    acc.push(propertyItems[p])
    return acc
  }, [])
  return { items }
}
