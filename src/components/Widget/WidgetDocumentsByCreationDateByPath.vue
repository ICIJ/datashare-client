<template>
  <widget-documents-by-creation-date ref="widgetDocumentsByCreationDate" :widget="widget">
    <template #selector="{ selectedPath, setSelectedPath }">
      <span
        v-if="selectedPath"
        v-b-modal.modal-widget-select-path
        class="me-3 py-1 px-2 border btn btn-link d-inline-flex"
      >
        <path-tree-breadcrumb
          datadir-icon="filter"
          :model-value="selectedPath"
          :no-datadir="isDataDir(selectedPath)"
          datadir-label
          no-link
        />
        <span v-if="isDataDir(selectedPath)">
          {{ $t('widget.creationDate.filterFolder') }}
        </span>
      </span>
      <b-modal
        id="modal-widget-select-path"
        cancel-variant="outline-action"
        :cancel-title="$t('global.cancel')"
        hide-header
        lazy
        ok-variant="action"
        :ok-title="$t('widget.creationDate.selectFolder')"
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
      </b-modal>
    </template>
  </widget-documents-by-creation-date>
</template>

<script>
import { castArray, trimEnd } from 'lodash'
import { mapState } from 'vuex'

import PathTreeBreadcrumb from '@/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb'
import PathTree from '@/components/PathTree/PathTree'
import WidgetDocumentsByCreationDate from '@/components/Widget/WidgetDocumentsByCreationDate'

/**
 * Widget to display number of files by creation date by path
 */
export default {
  name: 'WidgetDocumentsByCreationDateByPath',
  components: {
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
  data() {
    return {
      pathTreeValues: []
    }
  },
  computed: {
    ...mapState('insights', ['project']),
    dataDir() {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    projects() {
      return castArray(this.project)
    },
    pathTreeValue: {
      get () {
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
