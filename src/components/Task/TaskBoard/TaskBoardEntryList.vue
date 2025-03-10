<script setup>
import TaskBoardEntry from '@/components/Task/TaskBoard/TaskBoardEntry'

defineProps({
  entries: { 
    type: Array, 
    default: () => [] 
  }
})
</script>

<template>
  <div class="task-board-entry-list container-fluid bg-tertiary-subtle py-4">
    <div class="row justify-content-around g-5 mx-2">
      <div v-for="(task, index) in entries" :key="index" class="col-12 col-xl-6">
        <task-board-entry
          :icon="task.icon"
          :title="$t(`${task.key}.title`)"
          :description="$t(`${task.key}.description`)"
          :info="task.infoComp ?? $t(`${task.key}.info`, task.info)"
          :list-link="task.listLink"
          :action-link="task.actionLink"
          :action-text="$t(`${task.key}.actionText`)"
          class="h-100 d-flex flex-column"
        >
        </task-board-entry>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
