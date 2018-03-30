<template>
  <div class="content-placeholder">
    <div class="content-placeholder__wrapper" :style="{backgroundSize: size}">
      <div class="content-placeholder__wrapper__row" :style="{height: row.height}" v-for="(row, r) in formattedRows" :key="r">
        <div :style="box.style" v-for="(box, b) in row.boxes" :key="b">
          <div v-if="box.subClass" :class="box.subClass"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatRows } from '@/utils/placeholder'

export default {
  props: {
    rows: {
      type: Array,
      required: false
    },
    size: {
      type: String,
      default: '250%'
    }
  },
  computed: {
    formattedRows () {
      return formatRows(this.rows, 'content-placeholder__wrapper__row__box')
    }
  }
}
</script>

<style scoped lang="scss">
@keyframes placeHolderShimmer{
  0%{
    background-position: 100% 0
  }
  100%{
    background-position: -100% 0
  }
}

.content-placeholder {
  padding: $spacer;

  &__wrapper {
    animation-duration: 1s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: placeHolderShimmer;
    animation-timing-function: linear;
    background: #f6f7f8;
    background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
    position: relative;

    &__row {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex: 0 1 auto;
      flex-direction: row;
      flex-wrap: wrap;

      &__box {
        box-sizing: border-box;
        position: relative;
        height: 100%;
        margin-bottom: 0;
        background-color: white;
        overflow: hidden;
      }
    }
  }
}
</style>
