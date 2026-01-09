import { camelCase } from 'lodash'

import IPhListChecks from '~icons/ph/list-checks'
import IPhCalendarBlank from '~icons/ph/calendar-blank'
import IPhClockCountdown from '~icons/ph/clock-countdown'
import IPhCirclesThreePlus from '~icons/ph/circles-three-plus'
import IPhUsersThree from '~icons/ph/users-three'
import IPhShootingStar from '~icons/ph/shooting-star'
import IPhFiles from '~icons/ph/files'
import IPhEyeSlash from '~icons/ph/eye-slash'
import IPhUserCircle from '~icons/ph/user-circle'
import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'
import IPhFloppyDiskBack from '~icons/ph/floppy-disk-back'
import IPhRocketLaunch from '~icons/ph/rocket-launch'

import { SORT_TYPE_KEY } from '@/composables/useViewSettings'
import { useViewProperties } from '@/composables/useViewProperties'
import { useAppStore } from '@/store/modules'

export function useTaskProperties(pageName) {
  const appStore = useAppStore()
  const settingsView = camelCase(pageName)
  const propertyList = appStore.getDefaultSettings(settingsView, 'properties') ?? []
  const { propertyItem } = useViewProperties()

  const id = propertyItem({
    key: 'id',
    icon: null,
    sortable: true
  })

  const name = propertyItem({
    icon: IPhListChecks,
    key: 'name',
    sortable: false,
    emphasis: true,
    required: true,
    colStyle: { minWidth: 'min(350px, 100vw)' }
  })

  const createdAt = propertyItem({
    icon: IPhCalendarBlank,
    key: 'createdAt',
    sortingKey: 'creationDate',
    type: SORT_TYPE_KEY.DATE,
    sortable: true
  })

  const progress = propertyItem({
    icon: IPhClockCountdown,
    key: 'progress',
    type: SORT_TYPE_KEY.NUMBER,
    sortable: false,
    colStyle: { minWidth: 'min(150px, 100vw)' }
  })

  const state = propertyItem({
    icon: IPhClockCountdown,
    key: 'state',
    type: SORT_TYPE_KEY.NUMBER,
    sortable: false,
    required: true
  })

  const project = propertyItem({
    icon: IPhCirclesThreePlus,
    key: 'project',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: false,
    required: false
  })

  const projects = propertyItem({
    icon: IPhCirclesThreePlus,
    key: 'projects',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: false,
    required: false,
    colStyle: { minWidth: 'min(250px, 100vw)' }
  })

  const entitiesToFind = propertyItem({
    icon: IPhUsersThree,
    key: 'entitiesToFind',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: false,
    required: false
  })

  const pipeline = propertyItem({
    icon: IPhShootingStar,
    key: 'pipeline',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: false,
    required: false
  })

  const documents = propertyItem({
    icon: IPhFiles,
    key: 'documents',
    type: SORT_TYPE_KEY.NUMBER,
    sortable: false,
    required: false
  })

  const privacy = propertyItem({
    icon: IPhEyeSlash,
    key: 'privacy',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: false,
    required: false
  })

  const author = propertyItem({
    icon: IPhUserCircle,
    key: 'author',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: false,
    required: false
  })

  const queries = propertyItem({
    icon: IPhMagnifyingGlass,
    key: 'queries',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: false,
    required: false
  })

  const size = propertyItem({
    icon: IPhFloppyDiskBack,
    key: 'size',
    type: SORT_TYPE_KEY.NUMBER,
    sortable: false,
    required: false
  })

  const taskType = propertyItem({
    icon: IPhRocketLaunch,
    key: 'taskType',
    type: SORT_TYPE_KEY.ALPHA,
    sortable: false,
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
