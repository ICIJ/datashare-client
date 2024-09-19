<script setup>
import { computed, ref } from 'vue'

import AppModal from '@/components/AppModal/AppModal'
import ButtonIcon from '@/components/Button/ButtonIcon'
import PathTreeBreadcrumb from '@/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb'
import { useCore } from '@/composables/core'

const { core } = useCore()

const modelValue = defineModel({ type: String })

const props = defineProps({
  path: {
    type: String,
    default: null
  }
})

const dataDir = computed(() => core.config.get('dataDir'))
const selectedPaths = ref([])
const sourcePath = computed(() => props.path ?? dataDir.value)
const display = computed(() => modelValue.value ?? sourcePath.value)
</script>

<template>
  <button-icon icon-left="folder-open" variant="outline-tertiary" class="me-3">
    <path-tree-breadcrumb :model-value="display" datadir-label no-link />
  </button-icon>
  <button-icon v-b-modal.modal-form-control-path icon-right="magnifying-glass" variant="action">Browse</button-icon>
  <app-modal id="modal-form-control-path" lazy scrollable hide-header size="lg" @ok="modelValue = selectedPaths[0]">
    <path-tree :path="dataDir" :selected-paths="selectedPaths" select-mode no-stats />
  </app-modal>
</template>
