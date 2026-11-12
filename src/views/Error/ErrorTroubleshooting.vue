<script setup>
import { ref } from 'vue'
import { AppIcon, HapticCopy } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import VersionNumber from '@/components/VersionNumber'

defineProps({
  /**
   * Troubleshooting entries as `[name, value]` pairs.
   */
  rows: {
    type: Array,
    default: () => []
  },
  /**
   * The same entries as plain text, one per line, for the copy button.
   */
  text: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()

const showDetails = ref(false)

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}
</script>

<template>
  <b-collapse
    id="error-details"
    v-model="showDetails"
    class="error__details__collapse"
  >
    <dl class="error__details__list">
      <template
        v-for="[name, value] in rows"
        :key="name"
      >
        <dt class="error__details__list__name">
          {{ name }}
        </dt>
        <dd class="error__details__list__value">
          {{ value }}
        </dd>
      </template>
    </dl>
  </b-collapse>
  <div class="error__details">
    <button
      type="button"
      class="error__details__toggle btn btn-link"
      aria-controls="error-details"
      :aria-expanded="showDetails"
      @click="toggleDetails"
    >
      <app-icon class="error__details__toggle__caret me-1">
        <i-ph-caret-right />
      </app-icon>
      {{ t('error.troubleshootingDetails') }}
    </button>
    <haptic-copy
      :text="text"
      :label="t('error.copyDetails')"
      class="error__details__copy"
      variant="light"
      size="sm"
    />
    <version-number
      tooltip-placement="top"
      class="error__details__version"
    />
  </div>
</template>

<style lang="scss" scoped>
.error__details {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacer;

  &__version {
    color: rgba(var(--bs-light-rgb), 0.5);
  }

  &__toggle {
    padding: 0;
    border: 0;
    box-shadow: none;
    color: rgba(var(--bs-light-rgb), 0.8);
    text-decoration: none;

    &__caret {
      transition: transform 0.15s ease-out;
    }

    &[aria-expanded='true'] &__caret {
      transform: rotate(90deg);
    }
  }

  &__copy {
    --bs-btn-bg: transparent;
    --bs-btn-color: var(--bs-light);
    --bs-btn-border-color: rgba(var(--bs-light-rgb), 0.35);
  }

  &__list {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: $spacer * 0.25 $spacer;
    margin: 0;
    padding: $spacer;
    background: var(--bs-black);
    border-radius: var(--bs-border-radius-lg);
    font-family: var(--bs-font-monospace);
    font-size: $font-size-sm;
    color: var(--bs-light);

    &__name {
      font-weight: normal;
      text-transform: capitalize;
      color: rgba(var(--bs-light-rgb), 0.5);
    }

    &__value {
      margin: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
