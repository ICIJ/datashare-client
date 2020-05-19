<template>
  <div class="widget widget--text">
    <div class="widget__header" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0 h"></h4>
    </div>
    <div class="widget__content lead" :class="{ 'card-body': widget.card }" v-html="content"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import settings from '@/utils/settings'

export default {
  name: 'WidgetText',
  props: {
    widget: {
      type: Object
    }
  },
  data () {
    return {
      content: ''
    }
  },
  async mounted () {
    this.content = await this.applyPipelineChain(this.widget.pipeline)(this.widgetContent)
  },
  computed: {
    ...mapGetters('pipelines', {
      applyPipelineChain: 'applyPipelineChainByCategory'
    }),
    defaultContent () {
      return this.$config.get('widgetTextDefaultContent', settings.widgetTextDefaultContent)
    },
    widgetContent () {
      return this.widget.content || this.defaultContent
    }
  }
}
</script>

<style lang="scss" scoped>
  .widget--text {
    min-height: 100%;
  }
</style>
