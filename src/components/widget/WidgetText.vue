<template>
  <div class="widget widget--text">
    <div v-if="widget.title" class="widget__header" :class="{ 'card-header': widget.card }">
      <h4 class="m-0 h" v-html="widget.title"></h4>
    </div>
    <div class="widget__content lead" :class="{ 'card-body': widget.card }" v-html="content"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import settings from '@/utils/settings'

/**
 * Widget to display text on the insights page.
 */
export default {
  name: 'WidgetText',
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
      content: ''
    }
  },
  computed: {
    ...mapGetters('pipelines', {
      applyPipelineChain: 'applyPipelineChainByCategory'
    }),
    defaultContent() {
      return this.$config.get('widgetTextDefaultContent', settings.widgetTextDefaultContent)
    },
    widgetContent() {
      return this.widget.content || this.defaultContent
    }
  },
  watch: {
    async widget() {
      this.content = await this.applyPipelineChain(this.widget.pipeline)(this.widgetContent)
    }
  },
  async mounted() {
    this.content = await this.applyPipelineChain(this.widget.pipeline)(this.widgetContent)
  }
}
</script>

<style lang="scss" scoped>
.widget--text {
  min-height: 100%;
}
</style>
