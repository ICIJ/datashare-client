<template>
  <div class="widget widget--text">
    <div class="widget__header" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0 h"></h4>
    </div>
    <div class="widget__content lead" :class="{ 'card-body': widget.card }" v-html="content"></div>
  </div>
</template>

<script>
import settings from '@/utils/settings'

export default {
  name: 'WidgetText',
  props: {
    widget: {
      type: Object
    }
  },
  computed: {
    content () {
      return this.widget.content || this.$config.get('widgetTextDefaultContent', settings.widgetTextDefaultContent)
    }
  }
}
</script>

<style lang="scss" scoped>
  .widget--text {
    min-height: 100%;
  }
</style>
