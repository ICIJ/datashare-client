<template>
  <div class="landing">
    <div class="landing__form">
      <h1 class="landing__form__heading">
        Datashare
      </h1>
      <search-bar class="landing__form__search-bar" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .landing {
    position: relative;
    min-height: calc(100vh - #{$app-nav-height});
    background: $aggregations-panel-bg;

    &:after {
      content:"";
      z-index: 0;
      position: absolute;
      top:0;
      left:0;
      right:0;
      bottom:55%;
      background: theme-color('dark');
    }

    &__form {
      z-index: 100;
      position: absolute;
      max-width: 660px;
      width: 100%;
      left: 50%;
      top: 45%;
      transform: translate(-50%, -50%);

      &__heading {
        position: absolute;
        bottom: 100%;
        left:0;
        right:0;
        text-align: center;
        color: white;
        font-weight: bolder;
      }

      &__search-bar {
        background: white;
        border-radius: $border-radius;
        box-shadow: $dropdown-box-shadow;
      }
    }
  }
</style>

<script>
import SearchBar from './SearchBar'

export default {
  name: 'Landing',
  components: { SearchBar }
}
</script>
