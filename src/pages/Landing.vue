<template>
  <div class="landing">
    <hook name="landing.form:before"></hook>
    <div class="landing__form py-5">
      <hook name="landing.form.heading:before"></hook>
      <h1 class="landing__form__heading text-special">
        <img src="~images/logo-color.svg" alt="Datashare" />
      </h1>
      <hook name="landing.form.heading:after"></hook>
      <search-bar class="landing__form__search-bar py-3 container" hide-field-dropdown size="md"></search-bar>
    </div>
    <hook name="landing.form:after"></hook>
    <div class="mt-5 text-white container">
      <hook name="landing.form.project:before"></hook>
      <div class="landing__projects">
        <project-cards class="mt-3"></project-cards>
        <hook name="landing.form.project:after"></hook>
      </div>
    </div>
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
  }
}
</script>

<style lang="scss" scoped>
.landing {
  position: relative;

  &__form {
    @include gradient-directional($primary, $secondary);

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
      position: relative;
      width: 600px;
      z-index: 100;
    }
  }
}
</style>
