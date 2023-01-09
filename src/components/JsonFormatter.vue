<template>
  <div class="json-formatter"></div>
</template>

<script>
import JSONFormatter from 'json-formatter-js'

/**
 * Display an interactive preview of a JSON object
 */
export default {
  name: 'JsonFormatter',
  props: {
    /**
     * The selected document
     */
    json: {
      type: [Object, Array, String, Number, Boolean]
    },
    /**
     * This number indicates up to how many levels the rendered tree should expand.
     */
    open: {
      type: Number,
      default: 1
    },
    /**
     * Config to pass to JSON formatter.
     * @see https://github.com/mohsen1/json-formatter-js#config-object
     */
    config: {
      type: Object,
      default: () => ({ hoverPreviewEnabled: true })
    }
  },
  data() {
    return {
      formatter: null,
      mounted: false
    }
  },
  async mounted() {
    await this.$nextTick()
    this.mounted = true
  },
  watch: {
    $props: {
      deep: true,
      immediate: true,
      handler() {
        return this.render()
      }
    },
    mounted() {
      return this.render()
    }
  },
  methods: {
    render() {
      if (this.mounted) {
        const formatter = new JSONFormatter(this.json, this.open, this.config)
        this.$el.innerHTML = ''
        this.$el.appendChild(formatter.render())
      }
    }
  }
}
</script>
