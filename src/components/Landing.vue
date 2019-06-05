<template>
  <div class="landing d-flex justify-content-center align-item-center flex-column">
    <div class="landing__form">
      <h1 class="landing__form__heading text-special">
        <img src="~images/logo-white.svg" alt="Datashare" />
      </h1>
      <search-bar class="landing__form__search-bar" hide-settings />
      <div class="mt-5 text-white" v-if="showProjectsCards">
        <h2 class="text-uppercase h5">Projects</h2>
        <project-cards class="mt-3" />
      </div>
    </div>
  </div>
</template>

<script>
import ProjectCards from '@/components/ProjectCards'
import SearchBar from '@/components/SearchBar'

export default {
  name: 'Landing',
  components: { ProjectCards, SearchBar },
  computed: {
    showProjectsCards () {
      return this.$config.get('userIndices', []).length > 1
    }
  }
}
</script>

<style lang="scss" scoped>
  .landing {
    position: relative;
    min-height: calc(100vh - var(--app-nav-height) - var(--app-footer-height));
    @include gradient-directional($primary, $secondary);

    &__form {
      z-index: 100;
      position: relative;
      max-width: 660px;
      width: 100%;
      margin: auto;
      padding: 3rem 0;

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
        background: white;
        border-radius: $border-radius;
        margin: 0;
      }
    }
  }
</style>
