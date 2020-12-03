<template>
  <div class="landing d-flex justify-content-center align-item-center flex-column">
    <hook name="landing.form:before"></hook>
    <div class="landing__form py-5">
      <hook name="landing.form.heading:before"></hook>
      <h1 class="landing__form__heading text-special">
        <img src="~images/logo-color.svg" alt="Datashare">
      </h1>
      <hook name="landing.form.heading:after"></hook>
      <search-bar class="landing__form__search-bar py-3" size="md"></search-bar>
      <hook name="landing.form.project:before"></hook>
      <div class="mt-5 text-white" v-if="isServer">
        <div class="landing__form__projects">
          <h2 class="text-uppercase h5">
            {{ $t('filter.projects') }}
          </h2>
          <project-cards class="mt-3"></project-cards>
        </div>
      </div>
      <hook name="landing.form.project:after"></hook>
    </div>
    <hook name="landing.form:after"></hook>
  </div>
</template>

<script>
import Hook from '@/components/Hook'
import ProjectCards from '@/components/ProjectCards'
import SearchBar from '@/components/SearchBar'
import utils from '@/mixins/utils'

export default {
  name: 'Landing',
  mixins: [utils],
  components: {
    Hook,
    ProjectCards,
    SearchBar
  }
}
</script>

<style lang="scss" scoped>
  .landing {
    position: relative;
    min-height: 100vh;
    @include gradient-directional($primary, $secondary);

    &__form {
      z-index: 100;
      position: relative;
      top: -2 * $spacer;
      max-width: 660px;
      width: 100%;
      margin: auto;

      &__heading {
        text-align: center;
        color: white;
        font-weight: 400;
        font-size: 3rem;

        img {
          height: 6rem;
          margin-bottom: $spacer;
          transform: translateX(-9.5%); // half of logo width
        }
      }

      &__search-bar {
        margin: 0;
      }

      &__no-projects {
        font-size: $font-size-lg;
      }
    }
  }
</style>
