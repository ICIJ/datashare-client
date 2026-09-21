<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import ProjectThumbnail from '@/components/Project/ProjectThumbnail'
import { usePolicies } from '@/composables/usePolicies.js'
import { resolveProject } from '@/utils/projects'
import { useCore } from '@/composables/useCore'
import { ROLE_ICON, ROLE_COLOR, ROLE_ICON_DEFAULT } from '@/enums/roles.js'

// A project thumbnail with the role badged in its corner, standing in for the usual
// thumbnail + name + role-label trio. The project name (and role label) only need to be
// legible on demand, via the native title tooltip, not permanently on screen, this is
// meant for a list where many of these are shown at once.
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
const projectLabel = computed(() => resolvedProject.value.label ?? resolvedProject.value.name)
const roleLabel = computed(() => formatRole(t, props.role))
const title = computed(() => `${projectLabel.value} – ${roleLabel.value}`)

const icon = computed(() => ROLE_ICON[props.role] ?? ROLE_ICON_DEFAULT)
const iconStyle = computed(() => ({ color: ROLE_COLOR[props.role] ?? 'inherit' }))

defineExpose({ icon, iconStyle })
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
    right: -0.3em;
    bottom: -0.3em;
    background: var(--bs-body-bg);
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--bs-body-bg);
    font-size: 1.1em;
  }
}
</style>
