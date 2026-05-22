<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import DisplayRole from '@/components/Display/DisplayRole.vue'

import { usePolicies } from '@/composables/usePolicies.js'
import { ROLE, ROLE_BIT, ROLE_HIERARCHY } from '@/enums/roles.js'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  projectName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const { getRoleByProject, formatRole } = usePolicies()
const { t } = useI18n()

const currentUserRole = computed(() => getRoleByProject(props.projectName))

const availableRoles = computed(() =>
  Object.values(ROLE)
    .filter(role => (ROLE_HIERARCHY[currentUserRole.value] & ROLE_BIT[role]) !== 0)
    .sort((a, b) => ROLE_BIT[b] - ROLE_BIT[a])
    .map(role => ({ value: role, text: formatRole(t, role) }))
)

defineExpose({ availableRoles })
</script>

<template>
  <b-dropdown
    class="project-users-role-dropdown"
    no-caret
    variant="body"
    teleport-to="body"
    toggle-class="project-users-role-dropdown__toggle"
  >
    <template #button-content>
      <div class="project-users-role-dropdown__content d-flex justify-content-between rounded-1">
        <display-role :value="modelValue" />
        <app-icon class="ms-2">
          <i-ph-caret-down />
        </app-icon>
      </div>
    </template>
    <b-dropdown-item
      v-for="role in availableRoles"
      :key="role.value"
      :active="role.value === modelValue"
      @click="emit('update:modelValue', role.value)"
    >
      <display-role :value="role.value" />
    </b-dropdown-item>
  </b-dropdown>
</template>

<style scoped lang="scss">
.project-users-role-dropdown {
  border-radius: $btn-border-radius;
  border: 1px solid $border-color;
  &__toggle {
    width: 9rem;
    justify-content: space-between;
  }
  :deep(.project-users-role-dropdown__content) {
    width: 11rem;
  }
}
</style>
