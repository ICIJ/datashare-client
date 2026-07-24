<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import DisplayRole from '@/components/Display/DisplayRole.vue'

import { usePolicies } from '@/composables/usePolicies.js'
import { NO_ROLE, ROLE, ROLE_BIT, ROLE_HIERARCHY } from '@/enums/roles.js'
import { BDropdown } from 'bootstrap-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  project: {
    type: String,
    required: true
  },
  dirty: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  noRole: {
    type: Boolean,
    default: false
  },
  disabledRoles: {
    type: Array,
    default: () => []
  },
  hiddenRoles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const { getRoleByProject, formatRole } = usePolicies()
const { t } = useI18n()

const currentUserRole = computed(() => getRoleByProject(props.project))

const availableRoles = computed(() => [
  ...Object.values(ROLE)
    .filter(role => (ROLE_HIERARCHY[currentUserRole.value] & ROLE_BIT[role]) !== 0)
    .filter(role => !props.hiddenRoles.includes(role))
    .sort((a, b) => ROLE_BIT[b] - ROLE_BIT[a])
    .map(role => ({ value: role, text: formatRole(t, role), disabled: props.disabledRoles.includes(role) })),
  ...(props.noRole ? [{ value: NO_ROLE, text: formatRole(t, NO_ROLE), disabled: props.disabledRoles.includes(NO_ROLE) }] : [])
])

defineExpose({ availableRoles })
</script>

<template>
  <div
    class="project-users-role-dropdown"
  >
    <b-dropdown
      class="project-users-role-dropdown__dropdown"
      :disabled="disabled"
      no-caret
      variant="body"
      teleport-to="body"
      toggle-class="project-users-role-dropdown__toggle  border border-subtle"
      menu-class="project-users-role-dropdown__menu"
    >
      <template #button-content>
        <div class="project-users-role-dropdown__content d-flex justify-content-between ">
          <display-role :value="modelValue" /><app-icon
            v-if="dirty"
            class="ms-2"
            variant="primary"
          >
            <i-ph-arrows-clockwise />
          </app-icon>
          <app-icon class="ms-2">
            <i-ph-caret-down />
          </app-icon>
        </div>
      </template>
      <display-role
        :value="modelValue"
        class="project-users-role-dropdown__value d-none"
        aria-hidden="true"
      />
      <b-dropdown-item
        v-for="role in availableRoles"
        :key="role.value"
        :active="role.value === modelValue"
        :disabled="role.disabled"
        @click="role.disabled || emit('update:modelValue', role.value)"
      >
        <display-role :value="role.value" />
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<style scoped lang="scss">
.project-users-role-dropdown {
  :deep(.project-users-role-dropdown__content) {
    width: 10rem;
  }
}

// Teleported to <body> (teleport-to="body"), so it's no longer a DOM
// descendant of anything carrying this component's scope attribute —
// :deep() would never match here. Use :global() and rely on the
// component-specific class name to avoid leaking styles elsewhere.
:global(.project-users-role-dropdown__menu) {
  // Must clear Bootstrap's modal z-index (1055) when opened inside AppModal.
  z-index: 1071;
}
</style>
