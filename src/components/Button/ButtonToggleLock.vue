<script setup>
import { computed } from 'vue'
import { ButtonIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'
import IPhLock from '~icons/ph/lock'
import IPhLockOpen from '~icons/ph/lock-open'

const props = defineProps({
  locked: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:locked'])

const { t } = useI18n()

// Shared by every "lock this value" affordance in the app (Filters panel
// rows, breadcrumb chips, path tree rows) — same i18n keys throughout so
// translators only maintain one lock/unlock label pair.
const label = computed(() => t(props.locked ? 'filtersPanelSectionFilterEntry.unlock' : 'filtersPanelSectionFilterEntry.lock'))
</script>

<template>
  <button-icon
    square
    hide-label
    variant="link"
    size="sm"
    class="button-toggle-lock"
    :class="{ 'button-toggle-lock--locked': locked }"
    :icon-left="locked ? IPhLock : IPhLockOpen"
    :pressed="locked"
    :label="label"
    @click="emit('update:locked', !locked)"
  />
</template>

<style lang="scss" scoped>
// Visibility (hidden until hover/focus/locked) is each consumer's own call —
// they hover-reveal their own row differently (a checkbox row, a tree row),
// so that CSS lives in the consumer, not here. This component only owns the
// locked-state look, consistent everywhere it's used.
.button-toggle-lock {
  flex-shrink: 0;

  &--locked {
    &:deep(.button-icon__icon-left) {
      color: var(--bs-action);
    }
  }
}
</style>
