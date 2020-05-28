<template>
  <widget-documents-by-creation-date :widget="widget" ref="widgetDocumentsByCreationDate">
    <template #selector="{ selectedPath, setSelectedPath }">
      <span v-b-modal.modal-widget-select-path class="mr-3 py-1 px-2 border btn btn-link d-inline-flex" v-if="selectedPath">
        <tree-breadcrumb datadir-icon="filter" :path="selectedPath" no-datadir @input="treeViewPath = $event" />
        <span v-if="selectedPath === dataDir">
          {{ $t('widget.creationDate.filterFolder') }}
        </span>
      </span>
      <b-modal id="modal-widget-select-path" lazy scrollable hide-header body-class="p-0 border-bottom" cancel-variant="outline-primary" :ok-title="$t('widget.creationDate.selectFolder')" :cancel-title="$t('widget.creationDate.cancel')" size="lg" @ok="setSelectedPath(treeViewPath)">
        <tree-view :path="treeViewPath || selectedPath" @input="treeViewPath = $event" />
      </b-modal>
    </template>
  </widget-documents-by-creation-date>
</template>

<script>
import concat from 'lodash/concat'
import first from 'lodash/first'
import get from 'lodash/get'
import map from 'lodash/map'
import replace from 'lodash/replace'
import bodybuilder from 'bodybuilder'
import { mapState } from 'vuex'

import elasticsearch from '@/api/elasticsearch'
import TreeBreadcrumb from '@/components/TreeBreadcrumb.vue'
import TreeView from '@/components/TreeView.vue'
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
