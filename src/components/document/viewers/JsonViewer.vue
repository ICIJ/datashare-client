<template>
  <div class="json-viewer w-100 m-3"></div>
</template>

<script>
import JSONFormatter from 'json-formatter-js'

import datashareSourceMixin from '@/mixins/datashareSourceMixin'

export default {
  name: 'JsonViewer',
  mixins: [datashareSourceMixin],
  props: {
    document: {
      type: Object
    }
  },
  data () {
    return {
      formatter: null
    }
  },
  async mounted () {
    const source = await this.getSource(this.document)
    const depth = 1
    const config = { hoverPreviewEnabled: true }
    const formatter = new JSONFormatter(source, depth, config)
    this.$el.appendChild(formatter.render())
  }
}
</script>

<style lang="scss">
  .json-viewer {
    & > * {
      bottom: $spacer;
      left: $spacer;
      right: $spacer;
      top: $spacer;
    }
  }
</style>
