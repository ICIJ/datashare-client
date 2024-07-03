<script setup>
import { computed } from 'vue'

import PhosphorIcon from '@/components/PhosphorIcon'

const props = defineProps({
  compact: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'app-sidebar-footer--compact': props.compact
  }
})
</script>

<template>
  <footer class="app-sidebar-footer" :class="classList">
    <div class="app-sidebar-footer__logo">
      <img src="@/assets/images/logo-color-symbol.svg" alt="Datashare" class="img-fluid" />
    </div>
    <div class="app-sidebar-footer__content">
      <slot />
    </div>
    <div class="app-sidebar-footer__links">
      <router-link v-b-tooltip.body :to="{ name: 'settings' }" title="Settings" class="app-sidebar-footer__links__item">
        <phosphor-icon name="gear" hover-weight="bold" />
        <span class="visually-hidden">Settings</span>
      </router-link>
      <a v-b-tooltip.body title="Help" class="app-sidebar-footer__links__item">
        <phosphor-icon name="question" hover-weight="bold" />
        <span class="visually-hidden">Help</span>
      </a>
      <a v-b-tooltip.body title="Remove all" class="app-sidebar-footer__links__item">
        <phosphor-icon name="trash" hover-weight="bold" />
        <span class="visually-hidden">Remove all</span>
      </a>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-sidebar-footer {
  background: var(--bs-gray-100);
  display: flex;
  align-items: center;
  padding: $spacer;

  [data-bs-theme='dark'] & {
    background-color: #070707;
  }

  &__logo {
    height: calc(#{$line-height-base * 1em} + #{$spacer-xxs * 2});
    line-height: $line-height-base * 1em;
    margin-right: $spacer-xxs;

    img {
      height: 100%;
    }
  }

  &__content {
    font-weight: 400;
    padding: $spacer-xxs;
    margin-right: $spacer;
  }

  &__links {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__item {
      text-align: center;
      padding: $spacer-xxs;
      color: inherit;
      cursor: pointer;
    }
  }
}
</style>
