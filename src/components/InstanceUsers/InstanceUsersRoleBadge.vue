<script setup>
import DisplayRole from '@/components/Display/DisplayRole.vue'
import ProjectButton from '@/components/Project/ProjectButton'
import ProjectRoleThumbnail from '@/components/Project/ProjectRoleThumbnail.vue'

defineOptions({ name: 'InstanceUsersRoleBadge' })

defineProps({
  role: {
    type: String,
    required: true
  },
  // Null for instance-wide roles (instance/domain admin), which have no single project to badge.
  project: {
    type: String,
    default: null
  }
})
</script>

<template>
  <project-button
    class="instance-users-role-badge"
    :project="project ?? ''"
    :hide-thumbnail="!project"
    :no-link="!project"
    :to="project ? { name: 'project.view.edit.users', params: { name: project } } : null"
  >
    <template
      v-if="project"
      #thumbnail
    >
      <project-role-thumbnail
        :project="project"
        :role="role"
        width="1.25em"
      />
    </template>
    <display-role
      v-if="!project"
      :value="role"
    />
  </project-button>
</template>

<style scoped lang="scss">
.instance-users-role-badge {
  // ProjectRoleThumbnail overlays its role badge past its own right edge
  :deep(.project-role-thumbnail) {
    margin-right: 0.75em;
  }
}
</style>
