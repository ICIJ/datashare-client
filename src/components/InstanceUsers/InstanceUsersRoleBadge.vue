<script setup>
import { computed } from 'vue'

import DisplayRole from '@/components/Display/DisplayRole.vue'
import ProjectRoleThumbnail from '@/components/Project/ProjectRoleThumbnail.vue'
import { useCore } from '@/composables/useCore.js'
import { resolveProject } from '@/utils/projects.js'

defineOptions({ name: 'InstanceUsersRoleBadge' })

const props = defineProps({
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

const core = useCore()

const projectLabel = computed(() => {
  const resolved = resolveProject(props.project, core)
  return resolved.label ?? resolved.name
})
</script>

<template>
  <span class="instance-users-role-badge project-button btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1">
    <display-role
      v-if="!project"
      :value="role"
    />
    <template v-else>
      <project-role-thumbnail
        :project="project"
        :role="role"
        width="2em"
      />
      {{ projectLabel }}
    </template>
  </span>
</template>

<style scoped lang="scss">
.instance-users-role-badge {
  // Not a link, so it shouldn't look interactive.
  cursor: default;

  // btn-sm's own padding is too tight to contain ProjectRoleThumbnail's corner badge, which
  // overlays past its own bottom-right edge (see its `right`/`bottom: -0.3em`): without more
  // room here that badge icon spills past the pill's border instead of sitting inside it.
  --bs-btn-padding-y: 0.5rem;
  --bs-btn-padding-x: 0.75rem;
  // Text color/size match .project-button's own (var(--bs-body-color), near-black in light
  // mode) rather than btn-sm's smaller default, for the same weight as the project buttons
  // elsewhere in the app.
  font-size: 1rem;

  // Without this, the plain text/icon badges (instance/domain admin, no thumbnail) end up
  // shorter than the project ones, whose height is driven by the 2em thumbnail: same padding,
  // taller content.
  min-height: calc(2em + 2 * var(--bs-btn-padding-y));

  // ProjectRoleThumbnail overlays its role badge past its own right edge (see its `right:
  // -0.3em`); without this the badge icon overlaps the project name text right after it.
  :deep(.project-role-thumbnail) {
    margin-right: 0.35em;
  }
}
</style>
