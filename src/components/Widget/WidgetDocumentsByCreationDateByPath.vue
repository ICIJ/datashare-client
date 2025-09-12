<template>
  <widget-documents-by-creation-date
    ref="widgetDocumentsByCreationDate"
    :widget="widget"
    :project="project"
  >
    <template #selector="{ selectedPath, setSelectedPath }">
      <button-icon
        v-if="selectedPath"
        size="sm"
        variant="outline-action"
        :icon-left="PhTreeStructure"
        class="me-3 d-inline-flex"
        @click="showPathTree = true"
      >
        <path-tree-breadcrumb
          datadir-icon="filter"
          :model-value="selectedPath"
          :no-datadir="isDataDir(selectedPath)"
          datadir-label
          no-link
        />
        <span v-if="isDataDir(selectedPath)">
          {{ t('widget.creationDate.filterPath') }}
        </span>
      </button-icon>
      <app-modal
        v-model="showPathTree"
        cancel-variant="outline-action"
        :cancel-title="t('global.cancel')"
        no-header
        lazy
        ok-variant="action"
        :ok-title="t('widget.creationDate.selectPath')"
        :ok-disabled="!pathTreeValues.length"
        scrollable
        size="lg"
        @ok="setSelectedPath(pathTreeValue)"
      >
        <path-tree
          v-model:selected-paths="pathTreeValues"
          :path="dataDir"
          :projects="projects"
          select-mode
          nested
          no-documents
          elasticsearch-only
        />
      </app-modal>
    </template>
  </widget-documents-by-creation-date>
</template>

<script>
import { castArray, trimEnd } from 'lodash'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import AppModal from '@/components/AppModal/AppModal'
import PathTreeBreadcrumb from '@/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb'
import PathTree from '@/components/PathTree/PathTree'
import WidgetDocumentsByCreationDate from '@/components/Widget/WidgetDocumentsByCreationDate'

/**
 * Widget to display number of files by creation date by path
 */
export default {
  name: 'WidgetDocumentsByCreationDateByPath',
  components: {
    AppModal,
    ButtonIcon,
    PathTreeBreadcrumb,
    PathTree,
    WidgetDocumentsByCreationDate
  },
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
    },
    /**
     * The project name.
     */
    project: {
      type: String,
      required: true
    }
  },
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      pathTreeValues: [],
      showPathTree: false
    }
  },
  computed: {
    dataDir() {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    projects() {
      return castArray(this.project)
    },
    pathTreeValue: {
      get() {
        return trimEnd(this.pathTreeValues[0], this.pathSeparator)
      },
      set(value) {
        this.pathTreeValues = [value]
      }
    },
    pathSeparator() {
      return this.$config.get('pathSeparator', '/')
    }
  },
  watch: {
    project() {
      this.pathTreeValue = this.dataDir
    }
  },
  methods: {
    isDataDir(selectedPath) {
      return !selectedPath || this.trimPathEnd(selectedPath) === this.trimPathEnd(this.dataDir)
    },
    trimPathEnd(path) {
      return trimEnd(path, this.pathSeparator)
    }
  }
}
</script>
