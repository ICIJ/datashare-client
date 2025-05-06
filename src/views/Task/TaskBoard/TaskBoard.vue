<script setup>
import { useI18n } from 'vue-i18n'

import ModeLocalOnly from '@/components/Mode/ModeLocalOnly'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskBoardList from '@/components/Task/TaskBoard/TaskBoardList'
import TaskBoardListEntry from '@/components/Task/TaskBoard/TaskBoardListEntry'
import TaskBoardLatest from '@/views/Task/TaskBoard/TaskBoardLatest'
import { TASK_NAME, TASK_NAME_ICON } from '@/enums/taskNames'

const { t } = useI18n()
</script>

<template>
  <div class="task-board">
    <page-header no-toggle-settings />
    <page-container fluid>
      <task-board-latest />
      <task-board-list>
        <task-board-list-entry
          :icon="TASK_NAME_ICON[TASK_NAME.BATCH_SEARCH]"
          :title="t('task.task-board.entries.batch-search.title')"
          :description="t(`task.task-board.entries.batch-search.description`)"
          :list-link="{ name: 'task.batch-search.list' }"
          :action-link="{ name: 'task.batch-search.new' }"
          :action-text="t('task.task-board.entries.batch-search.actionText')"
        >
        </task-board-list-entry>
        <task-board-list-entry
          :icon="TASK_NAME_ICON[TASK_NAME.BATCH_DOWNLOAD]"
          :title="t('task.task-board.entries.batch-download.title')"
          :description="t('task.task-board.entries.batch-download.description')"
          :list-link="{ name: 'task.batch-download.list' }"
        />
        <mode-local-only>
          <task-board-list-entry
            :icon="TASK_NAME_ICON[TASK_NAME.INDEX]"
            :title="t('task.task-board.entries.document-addition.title')"
            :description="t('task.task-board.entries.document-addition.description')"
            :list-link="{ name: 'task.documents.list' }"
            :action-link="{ name: 'task.documents.new' }"
            :action-text="t('task.task-board.entries.document-addition.actionText')"
          />
          <task-board-list-entry
            :icon="TASK_NAME_ICON[TASK_NAME.EXTRACT_NLP]"
            :title="t('task.task-board.entries.entity-recognition.title')"
            :description="t('task.task-board.entries.entity-recognition.description')"
            :list-link="{ name: 'task.entities.list' }"
            :action-link="{ name: 'task.entities.new' }"
            :action-text="t('task.task-board.entries.entity-recognition.actionText')"
          />
        </mode-local-only>
      </task-board-list>
    </page-container>
  </div>
</template>
