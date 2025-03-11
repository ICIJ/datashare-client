<script setup>
import { ref } from 'vue'

import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskBoardList from '@/components/Task/TaskBoard/TaskBoardList'
import TaskBoardListEntry from '@/components/Task/TaskBoard/TaskBoardListEntry'
import TaskBoardLatest from '@/views/Task/TaskBoard/TaskBoardLatest'
import ModeLocalOnly from '@/components/Mode/ModeLocalOnly'
import { TASK_NAME, TASK_NAME_ICON } from '@/enums/taskNames'

const batchSearchesPublic = ref(13)
const batchSearchesPrivate = ref(0)
const batchDownloads = ref(45)
const findEntities = ref(3)
const documentAdditions = ref(4)
</script>

<template>
  <page-container fluid deck class="task-board">
    <page-header no-toggle-settings />
    <task-board-latest />
    <task-board-list class="px-5">
      <task-board-list-entry
        :icon="TASK_NAME_ICON[TASK_NAME.BATCH_SEARCH]"
        :title="$t('task.task-board.entries.batch-search.title')"
        :description="$t(`task.task-board.entries.batch-search.description`)"
        :list-link="{ name: 'task.batch-search.list' }"
        :action-link="{ name: 'task.batch-search.new' }"
        :action-text="$t('task.task-board.entries.batch-search.actionText')"
      >
        <template #info>
          <i18n-t keypath="task.task-board.entries.batch-search.info">
            <template #nbPublic>
              {{ $tc('task.task-board.entries.batch-search.nbPublic', batchSearchesPublic) }}
            </template>
            <template #nbPrivate>
              {{ $tc('task.task-board.entries.batch-search.nbPrivate', batchSearchesPrivate) }}
            </template>
          </i18n-t>
        </template>
      </task-board-list-entry>
      <task-board-list-entry
        :icon="TASK_NAME_ICON[TASK_NAME.BATCH_DOWNLOAD]"
        :title="$t('task.task-board.entries.batch-download.title')"
        :description="$t('task.task-board.entries.batch-download.description')"
        :info="$tc('task.task-board.entries.batch-download.info', batchDownloads)"
        :list-link="{ name: 'task.batch-download.list' }"
      />
      <mode-local-only>
        <task-board-list-entry
          :icon="TASK_NAME_ICON[TASK_NAME.EXTRACT_NLP]"
          :title="$t('task.task-board.entries.entity-recognition.title')"
          :description="$t('task.task-board.entries.entity-recognition.description')"
          :info="$tc('task.task-board.entries.entity-recognition.info', findEntities)"
          :list-link="{ name: 'task.entities.list' }"
          :action-link="{ name: 'task.entities.new' }"
          :action-text="$t('task.task-board.entries.entity-recognition.actionText')"
        />
        <task-board-list-entry
          :icon="TASK_NAME_ICON[TASK_NAME.INDEX]"
          :title="$t('task.task-board.entries.document-addition.title')"
          :description="$t('task.task-board.entries.document-addition.description')"
          :info="$tc('task.task-board.entries.document-addition.info', documentAdditions)"
          :list-link="{ name: 'task.documents.list' }"
          :action-link="{ name: 'task.documents.new' }"
          :action-text="$t('task.task-board.entries.document-addition.actionText')"
        />
      </mode-local-only>
    </task-board-list>
  </page-container>
</template>
