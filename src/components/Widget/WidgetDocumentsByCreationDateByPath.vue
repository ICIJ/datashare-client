<template>
  <widget-documents-by-creation-date ref="widgetDocumentsByCreationDate" :widget="widget">
    <template #selector="{ selectedPath, setSelectedPath }">
      <span
        v-if="selectedPath"
        v-b-modal.modal-widget-select-path
        class="me-3 py-1 px-2 border btn btn-link d-inline-flex"
      >
        <path-tree-breadcrumb datadir-icon="filter" :path="selectedPath" no-datadir @input="pathTreeValue = $event" />
        <span v-if="selectedPath === dataDir">
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
        :ok-disabled="!selectedPaths.length"
        scrollable
        size="lg"
        @ok="setSelectedPath(selectedPaths[0])"
      >
        <path-tree
          v-model:selected-paths="selectedPaths"
          :path="pathTreePath"
          :projects="projects"
          select-mode
          elasticsearch-only
        />
      </b-modal>
    </template>
  </widget-documents-by-creation-date>
</template>

<script>
import { castArray } from 'lodash'
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
      selectedPaths: []
    }
  },
  computed: {
    ...mapState('insights', ['project']),
    dataDir() {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    pathTreePath() {
      return this.dataDir
    },
    projects() {
      return castArray(this.project)
    }
  },
  watch: {
    project() {
      this.selectedPath = this.pathTreePath
      this.selectedPaths = []
    }
  }
}
</script>
