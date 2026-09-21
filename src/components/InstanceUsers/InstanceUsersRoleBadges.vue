<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import InstanceUsersRoleBadge from '@/components/InstanceUsers/InstanceUsersRoleBadge.vue'

defineOptions({ name: 'InstanceUsersRoleBadges' })

// Beyond this many grants, the rest collapse behind a "+N more" toggle so a user with many
// project grants doesn't blow up the row height by default.
const VISIBLE_LIMIT = 3

const props = defineProps({
  // Pre-sorted, highest role first: [{ role, project }], project is null for instance-wide roles.
  roles: {
    type: Array,
    default: () => []
  }
})

const { t } = useI18n()
const expanded = ref(false)

const hasMore = computed(() => props.roles.length > VISIBLE_LIMIT)
const hiddenCount = computed(() => props.roles.length - VISIBLE_LIMIT)
const visibleRoles = computed(() => (expanded.value ? props.roles : props.roles.slice(0, VISIBLE_LIMIT)))

defineExpose({ expanded, visibleRoles, hasMore, hiddenCount })
</script>

<template>
  <div class="instance-users-role-badges d-flex flex-wrap gap-2 align-items-center">
    <instance-users-role-badge
      v-for="{ role, project } in visibleRoles"
      :key="`${role}-${project}`"
      :role="role"
      :project="project"
    />
    <button
      v-if="hasMore"
      type="button"
      class="project-button btn btn-sm btn-outline-secondary"
      @click="expanded = !expanded"
    >
      {{ expanded ? t('settings.users.roleBadges.showLess') : t('settings.users.roleBadges.more', { count: hiddenCount }) }}
    </button>
    <span
      v-if="!roles.length"
      class="text-secondary"
    >-</span>
  </div>
</template>
