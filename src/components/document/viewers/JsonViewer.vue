<template>
  <div v-if="source" class="json-viewer p-3">
    <json-formatter :json="source" class="json-viewer__formatter" />
  </div>
</template>

<script>
import JsonFormatter from '@/components/JsonFormatter'
import datashareSourceMixin from '@/mixins/datashareSourceMixin'

/**
 * Display an interactive preview of JSON for a document.
 */
export default {
  name: 'JsonViewer',
  mixins: [datashareSourceMixin],
  components: {
    JsonFormatter
  },
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  data () {
    return {
      source: null
    }
  },
  async mounted () {
    this.source = await this.getSource(this.document)
  }
}
</script>

<style lang="scss">
  .json-viewer {
    max-width: 100%;
    overflow: auto;

    &__formatter > * {
      bottom: $spacer;
      left: $spacer;
      right: $spacer;
      top: $spacer;
    }
  }
</style>
