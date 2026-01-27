<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon, AppIcon } from '@icij/murmur-next'

import IPhWarning from '~icons/ph/warning'

import FormFieldset from '@/components/Form/FormFieldset/FormFieldset'

defineOptions({ name: 'SettingsSnapshotsSetup' })

const props = defineProps({
  availablePaths: {
    type: Array,
    default: () => []
  },
  pathsLoaded: {
    type: Boolean,
    default: false
  },
  hasAvailablePaths: {
    type: Boolean,
    default: false
  },
  hasSinglePath: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit'])

const { t } = useI18n()

const selectedPath = ref('')

// Auto-select the first path when paths are loaded
watch(
  () => props.availablePaths,
  (paths) => {
    if (paths.length > 0 && !selectedPath.value) {
      selectedPath.value = paths[0]
    }
  },
  { immediate: true }
)

function handleSubmit() {
  if (selectedPath.value) {
    emit('submit', selectedPath.value)
  }
}
</script>

<template>
  <div class="settings-snapshots-setup text-center py-5">
    <!-- Loading state -->
    <div
      v-if="!pathsLoaded"
      class="settings-snapshots-setup__loading"
    >
      <b-spinner class="mb-3" />
      <p class="text-secondary m-0">
        {{ t('settings.snapshots.setup.loading') }}
      </p>
    </div>

    <!-- No paths available -->
    <div
      v-else-if="!hasAvailablePaths"
      class="settings-snapshots-setup__no-paths"
    >
      <app-icon
        size="3em"
        class="text-warning mb-3"
      >
        <i-ph-warning />
      </app-icon>
      <h5 class="settings-snapshots-setup__title mb-3">
        {{ t('settings.snapshots.setup.noPathsTitle') }}
      </h5>
      <p class="settings-snapshots-setup__description text-secondary mb-0">
        {{ t('settings.snapshots.setup.noPathsDescription') }}
      </p>
    </div>

    <!-- Paths available -->
    <template v-else>
      <app-icon
        size="3em"
        class="text-secondary mb-3"
      >
        <i-ph-cloud-arrow-down />
      </app-icon>
      <h5 class="settings-snapshots-setup__title mb-3">
        {{ t('settings.snapshots.setup.title') }}
      </h5>
      <form
        class="settings-snapshots-setup__form mx-auto"
        @submit.prevent="handleSubmit"
      >
        <form-fieldset
          :label="t('settings.snapshots.setup.selectPath')"
          label-for="repository-path"
          label-cols-md="12"
          label-cols-lg="12"
        >
          <b-form-select
            id="repository-path"
            v-model="selectedPath"
            :disabled="isLoading"
            :options="availablePaths"
            class="settings-snapshots-setup__select"
          />
        </form-fieldset>
        <button-icon
          type="submit"
          variant="action"
          :disabled="isLoading || !selectedPath"
          :label="t('settings.snapshots.setup.submit')"
          class="settings-snapshots-setup__submit"
        />
      </form>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.settings-snapshots-setup {
  max-width: 450px;
  margin: auto;
}
</style>
