<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import { useTaskPolling } from '@/composables/task-polling'
import DisplayProgress from '@/components/Display/DisplayProgress'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayUser from '@/components/Display/DisplayUser'
import { getHumanTaskName, TASK_NAME, TASK_NAME_ICON } from '@/enums/taskNames'
import ButtonIcon from '@/components/Button/ButtonIcon'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import useMode from '@/composables/mode'
import RouterLinkBatchDownload from '@/components/RouterLink/RouterLinkBatchDownload'
import RouterLinkBatchSearch from '@/components/RouterLink/RouterLinkBatchSearch'
import { useTaskProperties } from '@/composables/task-properties'
const { t } = useI18n()
const nbTasks = ref(3)
const { tasks: pollingTasks, isLoading } = useTaskPolling()
const { isServer } = useMode()
const propertyList = ['taskType', 'state', 'name', 'projects', 'author', 'createdAt', 'progress']
const { items } = useTaskProperties(propertyList)
const allFields = items.map((item) => {
  return {
    ...item,
    value: item.key,
    text: computed(() => t(`task.task-board.latest.properties.${item.key}`))
  }
})

const fields = computed(() => allFields.filter((p) => isServer.value || p.name !== 'author'))

const more = 3

function showMore() {
  nbTasks.value += more
}

const displayedTasks = computed(() => pollingTasks.value?.slice(0, nbTasks.value))

const hideShowMore = computed(() => {
  return !pollingTasks.value?.length || pollingTasks.value.length <= nbTasks.value
})

function getAuthor(item) {
  if (item.args?.batchDownload) {
    return item.args?.batchDownload.user.id
  }
  return item.args?.user.id
}

function getProjects(item) {
  switch (item.name) {
    case TASK_NAME.BATCH_DOWNLOAD:
      return item.args?.batchDownload.projects
    case TASK_NAME.BATCH_SEARCH:
      return item.args?.batchRecord?.projects
    case TASK_NAME.EXTRACT_NLP:
    case TASK_NAME.ENQUEUE_FROM_INDEX:
    case TASK_NAME.SCAN:
    case TASK_NAME.INDEX:
      return [item.args?.defaultProject]
    default:
      console.error('Unknown task', item)
      return []
  }
}

function getTitle(item) {
  switch (item.name) {
    case TASK_NAME.BATCH_SEARCH:
      return item.args?.batchRecord?.name
    case TASK_NAME.BATCH_DOWNLOAD:
      return item.args?.batchDownload?.filename
    case TASK_NAME.SCAN:
    case TASK_NAME.INDEX:
    case TASK_NAME.ENQUEUE_FROM_INDEX:
    case TASK_NAME.EXTRACT_NLP:
    default:
      return getHumanTaskName(item.name)
  }
}

function getTaskLinkTitle(item) {
  const path = 'task.task-board.latest.linkTitle'
  switch (item.name) {
    case TASK_NAME.BATCH_SEARCH:
      return `${path}.batchSearch`
    case TASK_NAME.BATCH_DOWNLOAD:
      return `${path}.batchDownload`
    case TASK_NAME.INDEX:
    case TASK_NAME.SCAN:
      return `${path}.documentTask`
    case TASK_NAME.ENQUEUE_FROM_INDEX:
    case TASK_NAME.EXTRACT_NLP:
      return `${path}.entityTask`
    default:
      return `${path}.unknownTask`
  }
}

function getTaskLinkRoute(item) {
  switch (item.name) {
    case TASK_NAME.BATCH_SEARCH:
      return { name: 'task.batch-search.list' }
    case TASK_NAME.BATCH_DOWNLOAD:
      return { name: 'task.batch-download.list' }
    case TASK_NAME.INDEX:
    case TASK_NAME.SCAN:
      return { name: 'task.documents.list' }
    case TASK_NAME.ENQUEUE_FROM_INDEX:
    case TASK_NAME.EXTRACT_NLP:
      return { name: 'task.entities.list' }
    default:
      return null
  }
}

function getTaskIcon(item) {
  return TASK_NAME_ICON[item.name]
}
</script>

<template>
  <b-card-body no-border class="task-all__latest no-border">
    <b-card-title class="pb-4">
      <phosphor-icon name="rocket-launch" />
      {{ t('task.task-board.latest.title') }}
    </b-card-title>
    <b-overlay rounded spinner-small opacity="0.6" :show="isLoading" class="d-flex flex-column justify-content-center">
      <page-table-generic :items="displayedTasks" :fields="fields">
        <template #cell(taskType)="{ item }">
          <button-icon
            :icon-left="getTaskIcon(item)"
            :label="t(getTaskLinkTitle(item))"
            :to="getTaskLinkRoute(item)"
            hide-label
            size="sm"
            square
            variant="outline-tertiary"
          />
        </template>
        <template #cell(state)="{ item }">
          <display-status size="sm" :value="item.state" />
        </template>
        <template #cell(name)="{ item }">
          <router-link-batch-download v-if="item.name === TASK_NAME.BATCH_DOWNLOAD" :item="item" />
          <router-link-batch-search v-else-if="item.name === TASK_NAME.BATCH_SEARCH" :item="item" />
          <span v-else> {{ t(getTitle(item)) }}</span>
        </template>
        <template #cell(createdAt)="{ item }">
          <display-datetime-from-now :value="item.createdAt" />
        </template>
        <template #cell(author)="{ item }">
          <display-user :value="getAuthor(item)" />
        </template>
        <template #cell(projects)="{ item }">
          <display-project-list :values="getProjects(item)" />
        </template>
        <template #cell(progress)="{ item }">
          <display-progress :value="item.progress" />
        </template>
      </page-table-generic>
      <b-button v-if="!hideShowMore" variant="outline-secondary mx-auto" @click="showMore">Show more</b-button>
    </b-overlay>
  </b-card-body>
</template>

<style scoped lang="scss"></style>
