<template>
  <widget-documents-by-creation-date :widget="widget" ref="widgetDocumentsByCreationDate">
    <template #selector="{ selectedPath, setSelectedPath }">
      <span v-b-modal.modal-widget-select-path class="mr-3 py-1 px-2 border btn btn-link d-inline-flex" v-if="selectedPath">
        <tree-breadcrumb datadir-icon="filter" :path="selectedPath" no-datadir @input="treeViewPath = $event"></tree-breadcrumb>
        <span v-if="selectedPath === dataDir">
          {{ $t('widget.creationDate.filterFolder') }}
        </span>
      </span>
      <b-modal
        body-class="p-0 border-bottom"
        cancel-variant="outline-primary"
        :cancel-title="$t('global.cancel')"
        hide-header
        id="modal-widget-select-path"
        lazy
        @ok="setSelectedPath(treeViewPath)"
        :ok-title="$t('widget.creationDate.selectFolder')"
        scrollable
        size="lg">
        <tree-view :path="treeViewPath || selectedPath" :project="project" @input="treeViewPath = $event" count size></tree-view>
      </b-modal>
    </template>
  </widget-documents-by-creation-date>
</template>

<script>
import { mapState } from 'vuex'

import TreeBreadcrumb from '@/components/TreeBreadcrumb'
import TreeView from '@/components/TreeView'
import WidgetDocumentsByCreationDate from '@/components/WidgetDocumentsByCreationDate'

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
  data () {
    return {
      treeViewPath: null
    }
  },
  computed: {
    ...mapState('insights', ['project']),
    dataDir () {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    }
  },
  watch: {
    project () {
      this.$set(this, 'treeViewPath', this.dataDir)
    }
  }
}
</script>
