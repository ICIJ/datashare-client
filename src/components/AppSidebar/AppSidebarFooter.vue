<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

const props = defineProps({
  compact: {
    type: Boolean
  },
  helpLink: {
    type: String
  },
  signOutLink: {
    type: String
  },
  noHelp: {
    type: Boolean
  },
  noRemoveAll: {
    type: Boolean
  },
  noSignOut: {
    type: Boolean
  },
  noSettings: {
    type: Boolean
  },
  noKeyboardShortcuts: {
    type: Boolean
  }
})

const emit = defineEmits(['removeAll'])

const emitRemoveAll = () => {
  emit('remove-all')
}

const classList = computed(() => {
  return {
    'app-sidebar-footer--compact': props.compact
  }
})
</script>

<template>
  <footer class="app-sidebar-footer" :class="classList">
    <div class="app-sidebar-footer__lead">
      <div class="app-sidebar-footer__lead__logo">
        <img src="@/assets/images/logo-color-symbol.svg" alt="Datashare" class="img-fluid" />
      </div>
      <div class="app-sidebar-footer__lead__version">
        <slot />
      </div>
      <a
        v-if="!noKeyboardShortcuts && !compact"
        v-b-tooltip.body
        title="Keyboard Shortcuts"
        class="app-sidebar-footer__links__item ms-auto"
      >
        <phosphor-icon class="app-sidebar-footer__links__item__icon" name="keyboard" hover-weight="bold" />
        <span class="visually-hidden">Keyboard Shortcut</span>
      </a>
    </div>
    <div class="app-sidebar-footer__links">
      <a
        v-if="!noKeyboardShortcuts && compact"
        v-b-tooltip.body
        title="Keyboard Shortcuts"
        class="app-sidebar-footer__links__item"
      >
        <phosphor-icon class="app-sidebar-footer__links__item__icon" name="keyboard" hover-weight="bold" />
        <span class="visually-hidden">Keyboard Shortcut</span>
      </a>
      <router-link
        v-if="!noSettings"
        v-b-tooltip.body
        :to="{ name: 'settings.appearance' }"
        title="Settings"
        class="app-sidebar-footer__links__item"
      >
        <phosphor-icon class="app-sidebar-footer__links__item__icon" name="gear" hover-weight="bold" />
        <span class="visually-hidden">Settings</span>
      </router-link>
      <a
        v-if="!noHelp"
        v-b-tooltip.body
        :href="helpLink"
        target="_blank"
        title="Help"
        class="app-sidebar-footer__links__item"
      >
        <phosphor-icon class="app-sidebar-footer__links__item__icon" name="question" hover-weight="bold" />
        <span class="visually-hidden">Help</span>
      </a>
      <a
        v-if="!noRemoveAll"
        v-b-tooltip.body
        title="Remove all"
        class="app-sidebar-footer__links__item"
        @click="emitRemoveAll"
      >
        <phosphor-icon class="app-sidebar-footer__links__item__icon" name="trash" hover-weight="bold" />
        <span class="visually-hidden">Remove all</span>
      </a>
      <a
        v-if="!noSignOut"
        v-b-tooltip.body
        :href="signOutLink"
        title="Sign out"
        class="app-sidebar-footer__links__item"
      >
        <phosphor-icon class="app-sidebar-footer__links__item__icon" name="sign-out" hover-weight="bold" />
        <span class="visually-hidden">Sign out</span>
      </a>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-sidebar-footer {
  color: var(--bs-tertiary-color-subtle);
  background: var(--bs-tertiary-bg-subtle);
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: $spacer;
  padding: $spacer;

  &--compact {
    flex-direction: column;

    .app-sidebar-footer__links__item,
    .app-sidebar-footer__lead__version,
    .app-sidebar-footer__lead__logo {
      margin: 0;
    }

    .app-sidebar-footer__links {
      order: -1;
      flex-direction: column;

      &__item {
        padding: 8px 0;
        margin-bottom: $spacer;
      }
    }

    .app-sidebar-footer__lead {
      display: block;
      margin: auto;

      &__version {
        width: 100%;
        margin-top: $spacer;
      }
    }
  }

  &__lead {
    display: flex;
    text-align: center;

    &__logo {
      height: calc(#{$line-height-base * 1em} + #{$spacer-xxs * 2});
      line-height: $line-height-base * 1em;
      margin-right: $spacer-xxs;

      img {
        height: 100%;
      }
    }

    &__version {
      font-weight: 400;
      padding: $spacer-xxs;
      margin-right: $spacer;
    }
  }

  &__links {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__item {
      display: flex;
      align-items: center;
      text-align: center;
      color: inherit;
      cursor: pointer;
      margin: $spacer-xxs;

      &__icon:hover {
        color: rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));
      }
    }
  }
}
</style>
