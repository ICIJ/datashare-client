<script setup>
import { computed, ref, toRef, watch } from 'vue'
import isArray from 'lodash/isArray'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur'

import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'
import IPhFolderOpen from '~icons/ph/folder-open'

import AppModal from '@/components/AppModal/AppModal'
import PathTree from '@/components/PathTree/PathTree'
import PathTreeBreadcrumb from '@/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb'
import { useCore } from '@/composables/useCore'
import { useMode } from '@/composables/useMode'

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
  },
  indexed: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const core = useCore()
const selectedPaths = ref([])
const showPathTree = ref(false)
const rootPath = ref(null)
const { isServer } = useMode()
const sourcePath = computed(() => props.path ?? core.getDefaultDataDir())
const display = computed(() => modelValue.value ?? sourcePath.value)
const treeProjects = computed(() => (props.indexed ? props.projects : []))

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

async function existsOnDisk(path) {
  try {
    await core.api.tree(path)
    return true
  }
  catch (error) {
    return error?.response?.status !== 404
  }
}

async function resolveRootPath() {
  if (isServer.value || !props.projects.length) {
    return sourcePath.value
  }
  if (await existsOnDisk(sourcePath.value)) {
    return sourcePath.value
  }
  const index = props.projects.join(',')
  const commonDirname = await core.api.elasticsearch.getCommonDirname(index).catch(() => null)
  const hasCommonDirname = commonDirname && commonDirname !== '/'
  if (hasCommonDirname && await existsOnDisk(commonDirname)) {
    return commonDirname
  }
  return core.getDefaultDataDir()
}

let lastLookup = 0

async function browse() {
  const lookup = ++lastLookup
  rootPath.value = null
  showPathTree.value = true
  const resolvedRootPath = await resolveRootPath()
  const isStale = !showPathTree.value || lookup !== lastLookup
  if (!isStale) {
    rootPath.value = resolvedRootPath
  }
}

const lookupKey = computed(() => [sourcePath.value, ...props.projects].join(','))

watch(lookupKey, () => {
  if (showPathTree.value) {
    browse()
  }
})

function onOk() {
  if (props.multiple) {
    modelValue.value = selectedPaths.value
    return
  }
  const [selectedPath] = selectedPaths.value
  if (selectedPath) {
    modelValue.value = selectedPath
    return
  }
  const isUnchanged = !modelValue.value || modelValue.value === props.path
  const isResolvedElsewhere = rootPath.value && rootPath.value !== sourcePath.value
  if (isUnchanged && isResolvedElsewhere) {
    modelValue.value = rootPath.value
  }
}
</script>

<template>
  <div class="form-control-path d-flex no-wrap gap-3">
    <button-icon
      :icon-right="IPhMagnifyingGlass"
      variant="action"
      @click="browse"
    >
      {{ t('formControlPath.browse') }}
    </button-icon>
    <button-icon
      :icon-left="IPhFolderOpen"
      class="flex-shrink-1"
      variant="outline-tertiary"
      @click="browse"
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
        v-if="rootPath"
        v-model:selected-paths="selectedPaths"
        :path="rootPath"
        :projects="treeProjects"
        :multiple="multiple"
        nested
        no-fold
        no-stats
        select-mode
        :no-tree="noTree"
      />
    </app-modal>
  </div>
</template>
