<script setup>
import { useI18n } from 'vue-i18n'

import TaskboardEntry from '@/components/Task/Taskboard/TaskboardEntry'

defineProps({
  entries: { type: Array, default: () => [] }
})
const { t } = useI18n()
</script>

<template>
  <div class="taskboard-entry-list container-fluid bg-tertiary-subtle py-4">
    <div class="row justify-content-around g-5 mx-2">
      <div v-for="(task, index) in entries" :key="index" class="col-12 col-xl-6">
        <taskboard-entry
          :icon="task.icon"
          :title="t(`${task.key}.title`)"
          :description="t(`${task.key}.description`)"
          :info="task.infoComp ?? t(`${task.key}.info`, task.info)"
          :list-link="task.listLink"
          :action-link="task.actionLink"
          :action-text="t(`${task.key}.actionText`)"
          class="h-100 d-flex flex-column"
        >
        </taskboard-entry>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
