<template>
  <widget-documents-by-creation-date :widget="widget">
    <template #selector="{ selectedPath, setSelectedPath }">
      <span>
        <b-dropdown :text="selectedPath" v-if="paths.length">
          <b-dropdown-item v-for="key in paths" :key="key" @click="setSelectedPath(key)">
            {{ key }}
          </b-dropdown-item>
        </b-dropdown>
      </span>
    </template>
  </widget-documents-by-creation-date>
</template>

<script>
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
      paths: []
    }
  },
  computed: {
    ...mapState('insights', ['index'])
  },
  mounted () {
    this.$nextTick(() => this.loadPath())
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
      this.paths = map(get(response, ['aggregations', 'byDirname', 'buckets'], []), item => replace(item.key, this.$config.get('dataDir', '') + '/', ''))
    }
  }
}
</script>
