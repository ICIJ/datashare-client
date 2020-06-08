<template>
  <widget-documents-by-creation-date :widget="widget" ref="widgetDocumentsByCreationDate">
    <template #selector="{ selectedPath, setSelectedPath }">
      <span v-b-modal.modal-widget-select-path class="mr-3 py-1 px-2 border btn btn-link d-inline-flex" v-if="selectedPath">
        <tree-breadcrumb datadir-icon="filter" :path="selectedPath" no-datadir @input="treeViewPath = $event" />
        <span v-if="selectedPath === dataDir">
          {{ $t('widget.creationDate.filterFolder') }}
        </span>
      </span>
      <b-modal
        body-class="p-0 border-bottom"
        cancel-variant="outline-primary"
        :cancel-title="$t('widget.creationDate.cancel')"
        hide-header
        id="modal-widget-select-path"
        lazy
        @ok="setSelectedPath(treeViewPath)"
        :ok-title="$t('widget.creationDate.selectFolder')"
        scrollable
        size="lg">
        <tree-view :path="treeViewPath || selectedPath" @input="treeViewPath = $event"></tree-view>
      </b-modal>
    </template>
  </widget-documents-by-creation-date>
</template>

<script>
import TreeBreadcrumb from '@/components/TreeBreadcrumb'
import TreeView from '@/components/TreeView'
import WidgetDocumentsByCreationDate from '@/components/WidgetDocumentsByCreationDate'

/**
 * Widget to display number of files by creation date by directory on the insights page.
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
    dataDir () {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    }
  }
}
</script>
