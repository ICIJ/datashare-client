<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'
import DisplayProgress from '@/components/Display/DisplayProgress'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayUser from '@/components/Display/DisplayUser'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import RouterLinkBatchDownload from '@/components/RouterLink/RouterLinkBatchDownload'
import RouterLinkBatchSearch from '@/components/RouterLink/RouterLinkBatchSearch'
import { getHumanTaskName, TASK_NAME, TASK_NAME_ICON } from '@/enums/taskNames'
import { useMode } from '@/composables/useMode'
import { useTaskPolling } from '@/composables/useTaskPolling'
import { useTaskProperties } from '@/composables/useTaskProperties'

const { t } = useI18n()
const perPage = ref(3)
const { tasks, isLoading } = useTaskPolling({ sortBy: ['createdAt', 'desc'], perPage })
const { isServer } = useMode()
const { items } = useTaskProperties('taskBoardLatest')

const allFields = items.map((item) => {
  return {
    ...item,
    sortable: false,
    text: computed(() => t(`task.task-board.latest.properties.${item.key}`))
  }
})

// Get all fields except the author field if we are on the server
const fields = computed(() => allFields.filter((p) => isServer.value || p.name !== 'author'))

const more = 3

function showMore() {
  perPage.value += more
}

const hideShowMore = computed(() => tasks.value?.length < perPage.value)

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
    case TASK_NAME.BATCH_SEARCH_PROXY:
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
    case TASK_NAME.BATCH_SEARCH_PROXY:
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
    case TASK_NAME.BATCH_SEARCH_PROXY:
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
    case TASK_NAME.BATCH_SEARCH_PROXY:
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
      <phosphor-icon :name="PhRocketLaunch" />
      {{ t('task.task-board.latest.title') }}
    </b-card-title>
    <div class="d-flex flex-column justify-content-center">
      <page-table-generic :items="tasks" :fields="fields" :loading="isLoading">
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
          <router-link-batch-search
            v-else-if="item.name === TASK_NAME.BATCH_SEARCH || item.name === TASK_NAME.BATCH_SEARCH_PROXY"
            :item="item"
          />
          <span v-else> {{ t(getTitle(item)) }}</span>
        </template>
        <template #cell(createdAt)="{ item }">
          <display-datetime-from-now :value="item.createdAt" />
        </template>
        <template #cell(author)="{ item }">
          <display-user :value="getAuthor(item)" class="text-nowrap" />
        </template>
        <template #cell(projects)="{ item }">
          <display-project-list :values="getProjects(item)" />
        </template>
        <template #cell(progress)="{ item }">
          <display-progress :value="item.progress" />
        </template>
      </page-table-generic>
      <b-button v-if="!hideShowMore" variant="outline-secondary mx-auto mb-3" @click="showMore">
        {{ t('task.task-board.latest.showMore') }}
      </b-button>
    </div>
  </b-card-body>
</template>
