<template>
  <div class="landing">
    <div class="landing__form">
      <h1 class="landing__form__heading text-special">
        <img src="~images/logo-white.svg" alt="Datashare" />
      </h1>
      <search-bar class="landing__form__search-bar" hide-settings />
    </div>
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar'

export default {
  name: 'Landing',
  components: { SearchBar }
}
</script>

<style lang="scss" scoped>
  .landing {
    position: relative;
    min-height: calc(100vh - #{$app-nav-height}  - #{$app-footer-height});
    @include gradient-directional($primary, $secondary);

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
        font-weight: 400;
        font-size: 3rem;

        img {
          height: 6rem;
          margin-bottom: $spacer;
          filter: drop-shadow(0 0 10px rgba(black, .5));
        }
      }

      &__search-bar {
        background: white;
        border-radius: $border-radius;
        box-shadow: $dropdown-box-shadow;
      }
    }
  }
</style>
