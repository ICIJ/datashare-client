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
      color: $text-muted;
      content: "This is an empty widget";
      font-weight: lighter;
      left: 0;
      position: absolute;
      right: 0;
      text-align: center;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>
