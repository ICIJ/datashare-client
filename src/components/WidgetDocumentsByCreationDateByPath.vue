<template>
  <widget-documents-by-creation-date :widget="widget" ref="widgetDocumentsByCreationDate">
    <template #selector="{ selectedPath }">
      <b-dropdown :text="selectedPath.label" v-if="paths.length" class="mr-3">
        <b-dropdown-item v-for="path in paths" :key="path.folder" @click="setSelectedPath(path)">
          {{ path.label }}
        </b-dropdown-item>
      </b-dropdown>
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
import WidgetDocumentsByCreationDate from '@/components/WidgetDocumentsByCreationDate'

export default {
  name: 'WidgetDocumentsByCreationDateByPath',
  components: {
    WidgetDocumentsByCreationDate
  },
  props: {
    widget: {
      type: Object
    }
  },
  data () {
    return {
      paths: [{ label: this.$t('general.all'), folder: '' }]
    }
  },
  computed: {
    ...mapState('insights', ['index'])
  },
  mounted () {
    this.$nextTick(() => {
      this.loadPath()
      this.setSelectedPath(first(this.paths))
    })
  },
  methods: {
    async loadPath () {
      const options = {
        exclude: `${this.$config.get('dataDir', '')}/.*/.*`,
        include: `${this.$config.get('dataDir', '')}/.*`,
        size: 100
      }
      const body = bodybuilder().size(0).agg('terms', 'dirname.tree', options, 'byDirname').build()
      const response = await elasticsearch.search({ index: this.index, body })
      const paths = map(get(response, ['aggregations', 'byDirname', 'buckets'], []), item => {
        const folder = replace(item.key, this.$config.get('dataDir', '') + '/', '')
        return { label: folder, folder }
      })
      this.$set(this, 'paths', concat(this.paths, paths))
    },
    setSelectedPath (path) {
      this.$refs.widgetDocumentsByCreationDate.setSelectedPath(path)
    }
  }
}
</script>
