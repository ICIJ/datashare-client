<template>
  <div class="widget widget--empty"></div>
</template>

<script>
export default {
  name: 'WidgetEmpty',
  props: {
    widget: {
      type: Object
    }
  }
}
</script>

<style lang="scss">
  .widget--empty {
    width: 100%;

    &:before {
      content: "";
      display: block;
      padding-top: 9/16 * 100%;
    }

    &:after {
      content: "This is an empty widget";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      text-align: center;
      color: $text-muted;
      font-weight: lighter;
    }
  }
</style>
