<template>
  <div>
    <div :id="versionNumberId" class="version-number d-inline-block">v{{ serverVersion }}</div>
    <b-tooltip :target="versionNumberId" :delay="tooltipDelay" :placement="tooltipPlacement" teleport-to="body">
      <div class="version-number__tooltip text-nowrap text-start">
        <div class="d-flex align-items-baseline version-number__tooltip__client py-2">
          <div class="flex-grow-1 pe-5">
            <phosphor-icon name="desktop" class="me-1" />
            {{ $t('versionNumber.client') }}
          </div>
          <div class="font-monospace version-number__tooltip__client__value">
            {{ shortClientHash }}
          </div>
        </div>
        <div class="d-flex align-items-baseline version-number__tooltip__server py-2">
          <div class="flex-grow-1 pe-5">
            <phosphor-icon name="hard-drives" class="me-1" />
            {{ $t('versionNumber.server') }}
          </div>
          <div class="font-monospace version-number__tooltip__server__value">
            {{ serverHash }}
          </div>
        </div>
      </div>
    </b-tooltip>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { uniqueId } from 'lodash'

import { useCore } from '@/composables/core'

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
    default: () => ({ show: 700, hide: 0 })
  }
})

const serverHash = ref(null)
const serverVersion = ref(null)

const clientHash = import.meta.env.VITE_GIT_HASH ?? ''
const shortClientHash = ref(clientHash.substring(0, 7))
const versionNumberId = uniqueId('version-number-')

const { core } = useCore()

const fetchVersion = async () => {
  return core.api.getVersion()
}

const setVersion = async () => {
  const version = await fetchVersion()
  serverHash.value = version['git.commit.id.abbrev']
  serverVersion.value = version['git.tag'] || version['git.build.version']
}

onMounted(setVersion)
</script>

<style lang="scss" scoped>
.version-number {
  cursor: pointer;
}
</style>
