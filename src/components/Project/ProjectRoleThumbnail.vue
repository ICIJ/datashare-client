<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import ProjectThumbnail from '@/components/Project/ProjectThumbnail'
import { usePolicies } from '@/composables/usePolicies.js'
import { displayLabelOf, resolveProject } from '@/utils/projects'
import { useCore } from '@/composables/useCore'
import { roleColor, roleIcon } from '@/enums/roles.js'

// A project thumbnail with the role badged in its corner; the native title tooltip spells out
// the project and the role.
defineOptions({ name: 'ProjectRoleThumbnail' })

const props = defineProps({
  project: {
    type: [Object, String],
    required: true
  },
  role: {
    type: String
  },
  width: {
    type: String,
    default: '2.5em'
  }
})

const core = useCore()
const { t } = useI18n()
const { formatRole } = usePolicies()

const resolvedProject = computed(() => resolveProject(props.project, core))
const projectLabel = computed(() => displayLabelOf(resolvedProject.value))
const roleLabel = computed(() => formatRole(t, props.role))
const title = computed(() => `${projectLabel.value} - ${roleLabel.value}`)

const icon = computed(() => roleIcon(props.role))
const iconStyle = computed(() => ({ color: roleColor(props.role) }))
</script>

<template>
  <span
    class="project-role-thumbnail"
    :title="title"
  >
    <project-thumbnail
      :project="resolvedProject"
      :width="width"
      :rounded="1"
    />
    <app-icon
      :name="icon"
      :style="iconStyle"
      class="project-role-thumbnail__badge"
    />
  </span>
</template>

<style scoped lang="scss">
.project-role-thumbnail {
  position: relative;
  display: inline-flex;

  &__badge {
    position: absolute;
    right: -0.4em;
    bottom: -0.4em;
    background: var(--bs-body-bg);
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--bs-body-bg);
    font-size: 1.1em;
  }
}
</style>
