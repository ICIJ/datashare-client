<template>
  <widget-documents-by-creation-date ref="widgetDocumentsByCreationDate" :widget="widget" :project="project">
    <template #selector="{ selectedPath, setSelectedPath }">
      <button-icon
        v-if="selectedPath"
        v-b-modal.modal-widget-select-path
        size="sm"
        variant="outline-action"
        :icon-left="PhTreeStructure"
        class="me-3 d-inline-flex"
      >
        <path-tree-breadcrumb
          datadir-icon="filter"
          :model-value="selectedPath"
          :no-datadir="isDataDir(selectedPath)"
          datadir-label
          no-link
        />
        <span v-if="isDataDir(selectedPath)">
          {{ $t('widget.creationDate.filterPath') }}
        </span>
      </button-icon>
      <app-modal
        id="modal-widget-select-path"
        cancel-variant="outline-action"
        :cancel-title="$t('global.cancel')"
        no-header
        lazy
        ok-variant="action"
        :ok-title="$t('widget.creationDate.selectPath')"
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
          elasticsearch-only
        />
      </app-modal>
    </template>
  </widget-documents-by-creation-date>
</template>

<script>
import { castArray, trimEnd } from 'lodash'

import AppModal from '@/components/AppModal/AppModal'
import PathTreeBreadcrumb from '@/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb'
import PathTree from '@/components/PathTree/PathTree'
import ButtonIcon from '@/components/Button/ButtonIcon'
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
  data() {
    return {
      pathTreeValues: []
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
