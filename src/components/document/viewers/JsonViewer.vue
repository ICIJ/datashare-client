<template>
  <div class="json-viewer w-100"></div>
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
    position: relative;
    overflow: auto;

    & > * {
      position: absolute;
      top: $spacer;
      left: $spacer;
      right: $spacer;
      bottom: $spacer;
    }
  }
</style>
