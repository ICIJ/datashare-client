<template>
  <div class="widget widget--text">
    <div class="widget__header" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0"></h4>
    </div>
    <div class="widget__content lead p-3" v-html="widget.content"></div>
  </div>
</template>

<script>
export default {
  name: 'WidgetText',
  props: {
    widget: {
      type: Object
    }
  }
}
</script>

<style lang="scss" scoped>
  .widget--text {
    min-height: 100%;
  }
</style>
