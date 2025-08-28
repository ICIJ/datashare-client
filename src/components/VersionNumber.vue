<template>
  <b-tooltip
    interactive
    :delay="tooltipDelay"
    :placement="tooltipPlacement"
    teleport-to="body"
  >
    <template #target>
      <div class="version-number d-inline-block">
        v{{ serverVersion }}
      </div>
    </template>
    <div class="version-number__tooltip text-nowrap text-start">
      <div class="d-flex align-items-baseline version-number__tooltip__client py-2">
        <div class="flex-grow-1 pe-5">
          <phosphor-icon
            :name="PhDesktop"
            class="me-1"
          />
          {{ t('versionNumber.client') }}
        </div>
        <div class="font-monospace version-number__tooltip__client__value">
          {{ shortClientHash }}
          <haptic-copy
            :text="shortClientHash"
            variant="link"
            class="p-1 bg-dark-subtle text-bg-dark"
            hide-label
          />
        </div>
      </div>
      <div class="d-flex align-items-baseline version-number__tooltip__server py-2">
        <div class="flex-grow-1 pe-5">
          <phosphor-icon
            :name="PhHardDrives"
            class="me-1"
          />
          {{ t('versionNumber.server') }}
        </div>
        <div class="font-monospace version-number__tooltip__server__value">
          {{ serverHash }}
          <haptic-copy
            :text="serverHash"
            variant="link"
            class="p-1 bg-dark-subtle text-bg-dark"
            hide-label
          />
        </div>
      </div>
    </div>
  </b-tooltip>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/useCore'

import { useClipboard } from '@vueuse/core'
import ButtonSubtleAction from '@/components/Button/ButtonSubtleAction'
/**
 * Display Datashare's version number.
 */
defineOptions({
  name: 'VersionNumber'
})

defineProps({
  tooltipPlacement: {
    type: String,
    default: 'top-end'
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})
const { t } = useI18n()
const serverHash = ref(null)
const serverVersion = ref(null)

const clientHash = import.meta.env.VITE_GIT_HASH ?? ''
const shortClientHash = ref(clientHash.substring(0, 7))

const { core } = useCore()

const fetchVersion = async () => {
  return core.api.getVersion()
}

const setVersion = async () => {
  const version = await fetchVersion()
  serverHash.value = version['git.commit.id.abbrev']
  serverVersion.value = version['git.tag'] || version['git.build.version']
}

const { text, copy, copied, isSupported } = useClipboard()
onMounted(setVersion)
</script>

<style lang="scss" scoped>
.version-number {
  cursor: pointer;
}
</style>
