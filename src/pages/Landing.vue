<template>
  <div class="landing d-flex justify-content-center align-item-center flex-column">
    <hook name="landing.form:before" />
    <div class="landing__form py-5">
      <hook name="landing.form.heading:before" />
      <h1 class="landing__form__heading text-special">
        <img src="~images/logo-color.svg" alt="Datashare" />
      </h1>
      <hook name="landing.form.heading:after" />
      <search-bar class="landing__form__search-bar py-3" size="md" />
      <hook name="landing.form.project:before" />
      <div class="mt-5 text-white" v-if="$config.is('multipleProjects')">
        <div class="landing__form__projects">
          <h2 class="text-uppercase h5">
            {{ $t('filter.projects') }}
          </h2>
          <project-cards class="mt-3" />
        </div>
      </div>
      <hook name="landing.form.project:after" />
    </div>
    <hook name="landing.form:after" />
  </div>
</template>

<script>
import Hook from '@/components/Hook'
import ProjectCards from '@/components/ProjectCards'
import SearchBar from '@/components/SearchBar'

export default {
  name: 'Landing',
  components: {
    Hook,
    ProjectCards,
    SearchBar
  },
  data () {
    return {
      projects: []
    }
  },
  created () {
    this.$set(this, 'projects', this.$config.get('datashare_projects', []))
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
