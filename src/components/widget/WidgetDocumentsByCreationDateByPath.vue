<template>
  <widget-documents-by-creation-date ref="widgetDocumentsByCreationDate" :widget="widget">
    <template #selector="{ selectedPath, setSelectedPath }">
      <span
        v-if="selectedPath"
        v-b-modal.modal-widget-select-path
        class="me-3 py-1 px-2 border btn btn-link d-inline-flex"
      >
        <tree-breadcrumb
          datadir-icon="filter"
          :path="selectedPath"
          no-datadir
          @input="treeViewPath = $event"
        ></tree-breadcrumb>
        <span v-if="selectedPath === dataDir">
          {{ $t('widget.creationDate.filterFolder') }}
        </span>
      </span>
      <b-modal
        id="modal-widget-select-path"
        body-class="p-0 border-bottom"
        cancel-variant="outline-primary"
        :cancel-title="$t('global.cancel')"
        hide-header
        lazy
        :ok-title="$t('widget.creationDate.selectFolder')"
        scrollable
        size="lg"
        @ok="setSelectedPath(treeViewPath)"
      >
        <tree-view
          :path="treeViewPath || selectedPath"
          :projects="projects"
          count
          size
          @update:path="treeViewPath = $event"
        ></tree-view>
      </b-modal>
    </template>
  </widget-documents-by-creation-date>
</template>

<script>
import { castArray } from 'lodash'
import { mapState } from 'vuex'

import TreeBreadcrumb from '@/components/TreeBreadcrumb'
import TreeView from '@/components/TreeView'
import WidgetDocumentsByCreationDate from '@/components/widget/WidgetDocumentsByCreationDate'

/**
 * Widget to display number of files by creation date by path
 */
export default {
  name: 'WidgetDocumentsByCreationDateByPath',
  components: {
    TreeBreadcrumb,
    TreeView,
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
      treeViewPath: null
    }
  },
  computed: {
    ...mapState('insights', ['project']),
    dataDir() {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    projects() {
      return castArray(this.project)
    }
  },
  watch: {
    project() {
      this.treeViewPath = this.dataDir
    }
  }
}
</script>
