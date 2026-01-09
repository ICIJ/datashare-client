<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { ButtonIcon } from '@icij/murmur-next'
import IPhArrowsClockwise from '~icons/ph/arrows-clockwise'
import IPhTrash from '~icons/ph/trash'
import IPhCloudArrowDown from '~icons/ph/cloud-arrow-down'

const props = defineProps({
  shouldInstall: {
    type: Boolean
  },
  shouldUpdate: {
    type: Boolean
  },
  version: {
    type: String
  },
  recommendedVersion: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean
  }
})

const emit = defineEmits(['install', 'update', 'uninstall'])
const { t } = useI18n()

const versionLabel = computed(() => t('addonCardViewActions.version', { v: props.version }))
const installLabel = computed(() => t('addonCardViewActions.install', { v: props.recommendedVersion }))
const updateLabel = computed(() => t('addonCardViewActions.update', { v: props.recommendedVersion }))
const uninstallLabel = computed(() => t('addonCardViewActions.uninstall'))

const installAddon = () => {
  emit('install')
}

const updateAddon = () => {
  emit('update')
}

const uninstallAddon = () => {
  emit('uninstall')
}
</script>

<template>
  <div class="addon-card-view-actions d-flex flex-column align-items-end gap-2">
    <button-icon
      v-if="shouldInstall"
      :loading="loading"
      :disabled="loading"
      truncate
      :icon-left="IPhCloudArrowDown"
      variant="action"
      class="flex-grow-0"
      @click="installAddon"
    >
      {{ installLabel }}
    </button-icon>
    <template v-else>
      <button-icon
        v-if="shouldUpdate"
        :loading="loading"
        :disabled="loading"
        :icon-left="IPhArrowsClockwise"
        variant="action"
        class="flex-grow-0"
        @click="updateAddon"
      >
        {{ updateLabel }}
      </button-icon>
      <span
        v-if="version"
        class="addon-card-view-actions__text text-secondary-emphasis text-nowrap"
      >
        {{ versionLabel }}
      </span>
      <button-icon
        :loading="loading"
        :disabled="loading"
        :icon-left="IPhTrash"
        variant="outline-secondary"
        class="addon-card__uninstall"
        @click="uninstallAddon"
      >
        {{ uninstallLabel }}
      </button-icon>
    </template>
  </div>
</template>

<style scoped lang="scss">
.addon-card-view-actions {
  &__text {
    padding: $btn-padding-y $btn-padding-x;
  }
}
</style>
