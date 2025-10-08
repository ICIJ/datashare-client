<script setup>
import { computed, ref, toRef, watch } from 'vue'
import { isArray } from 'lodash'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import AppModal from '@/components/AppModal/AppModal'
import PathTree from '@/components/PathTree/PathTree'
import PathTreeBreadcrumb from '@/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb'
import { useCore } from '@/composables/useCore'

const modelValue = defineModel({ type: String })

const props = defineProps({
  path: {
    type: String,
    default: null
  },
  multiple: {
    type: Boolean
  },
  noTree: {
    type: Boolean,
    default: false
  },
  projects: {
    type: Array,
    default: () => []
  }
})

const { t } = useI18n()
const { core } = useCore()
const selectedPaths = ref([])
const showPathTree = ref(false)
const sourcePath = computed(() => props.path ?? core.getDefaultDataDir())
const display = computed(() => modelValue.value ?? sourcePath.value)

watch(toRef(props, 'projects'), () => {
  selectedPaths.value = []
})

watch(toRef(props, 'path'), (value) => {
  if (props.multiple && isArray(value)) {
    selectedPaths.value = value
  }
  else {
    selectedPaths.value = [value]
  }
})

function onOk() {
  if (props.multiple) {
    modelValue.value = selectedPaths.value
  }
  else {
    modelValue.value = selectedPaths.value[0]
  }
}
</script>

<template>
  <div class="form-control-path d-flex no-wrap gap-3">
    <button-icon
      :icon-right="PhMagnifyingGlass"
      variant="action"
      @click="showPathTree = true"
    >
      {{ t('formControlPath.browse') }}
    </button-icon>
    <button-icon
      :icon-left="PhFolderOpen"
      class="flex-shrink-1"
      variant="outline-tertiary"
      @click="showPathTree = true"
    >
      <path-tree-breadcrumb
        class="flex-shrink-0"
        :model-value="display"
        datadir-label
        no-link
      />
    </button-icon>
    <app-modal
      v-model="showPathTree"
      lazy
      scrollable
      no-header
      size="lg"
      @ok="onOk"
    >
      <path-tree
        v-model:selected-paths="selectedPaths"
        :path="sourcePath"
        :projects="projects"
        :multiple="multiple"
        nested
        no-stats
        select-mode
        :no-tree="noTree"
      />
    </app-modal>
  </div>
</template>
