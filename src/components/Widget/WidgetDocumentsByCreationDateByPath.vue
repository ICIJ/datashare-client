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
        icon-left="tree-structure"
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
          no-tree
        />
      </app-modal>
    </template>
  </widget-documents-by-creation-date>
</template>

<script>
import { castArray, trimEnd } from 'lodash'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
import { toRef } from 'vue'

import { useInsightsStore } from '@/store/modules'
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
    }
  },
  setup() {
    const { t } = useI18n()
    const insightsStore = useInsightsStore()
    const project = toRef(insightsStore, 'project')
    return { t, project }
  },
  data() {
    return {
      pathTreeValues: [],
      showPathTree: false
    }
  },
  computed: {
    dataDir() {
      const { sourcePath = null } = this.$core.findProject(this.project)
      // The sourcePath may be null, in which case we return the default data dir.
      return sourcePath ? sourcePath.split('//').pop() : this.$core.getDefaultDataDir()
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
