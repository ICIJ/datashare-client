<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { PhosphorIcon } from '@icij/murmur-next'

import AppSidebarKeyboardShortcutsPopover from '@/components/AppSidebar/AppSidebarKeyboardShortcutsPopover'
import Hook from '@/components/Hook/Hook'
import { useConfirmModal } from '@/composables/useConfirmModal'
import { useRemoveAll } from '@/composables/useRemoveAll'
import { useCore } from '@/composables/useCore'

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
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})

const { t } = useI18n()
const { toastedPromise } = useCore()
const { confirm } = useConfirmModal()
const { removeAll } = useRemoveAll()
const router = useRouter()

const removeAllAndRedirect = async () => {
  await removeAll()
  await router.push({ name: 'project.list' })
}

const confirmRemoveAll = async () => {
  const title = t('appSidebarFooter.removeAll.title')
  const description = t('appSidebarFooter.removeAll.description')
  if (await confirm({ title, description })) {
    const successMessage = t('appSidebarFooter.removeAll.success')
    const errorMessage = t('appSidebarFooter.removeAll.error')
    await toastedPromise(removeAllAndRedirect(), { successMessage, errorMessage })
  }
}

const classList = computed(() => {
  return {
    'app-sidebar-footer--compact': props.compact
  }
})
</script>

<template>
  <footer class="app-sidebar-footer" :class="classList">
    <hook name="app-sidebar-footer:before" />
    <div class="app-sidebar-footer__lead">
      <div class="app-sidebar-footer__lead__logo">
        <img src="@/assets/images/logo-color-symbol.svg" alt="Datashare" class="img-fluid" />
      </div>
      <div class="app-sidebar-footer__lead__version">
        <slot />
      </div>
      <app-sidebar-keyboard-shortcuts-popover v-if="!noKeyboardShortcuts && !compact" :offset="36">
        <template #target>
          <a
            v-b-tooltip.body="{ delay: tooltipDelay }"
            :title="t('appSidebarFooter.keyboardShortcuts')"
            class="app-sidebar-footer__links__item ms-auto"
          >
            <phosphor-icon class="app-sidebar-footer__links__item__icon" name="keyboard" hover-weight="bold" />
            <span class="visually-hidden">{{ t('appSidebarFooter.keyboardShortcuts') }}</span>
          </a>
        </template>
      </app-sidebar-keyboard-shortcuts-popover>
    </div>
    <div class="app-sidebar-footer__links">
      <app-sidebar-keyboard-shortcuts-popover v-if="!noKeyboardShortcuts && compact" :offset="48">
        <template #target>
          <a
            v-b-tooltip.body="{ delay: tooltipDelay }"
            :title="t('appSidebarFooter.keyboardShortcuts')"
            class="app-sidebar-footer__links__item"
          >
            <phosphor-icon class="app-sidebar-footer__links__item__icon" name="keyboard" hover-weight="bold" />
            <span class="visually-hidden">{{ t('appSidebarFooter.keyboardShortcuts') }}</span>
          </a>
        </template>
      </app-sidebar-keyboard-shortcuts-popover>
      <router-link
        v-if="!noSettings"
        v-b-tooltip.body="{ delay: tooltipDelay }"
        :to="{ name: 'settings.appearance' }"
        :title="t('appSidebarFooter.settings')"
        class="app-sidebar-footer__links__item"
      >
        <phosphor-icon class="app-sidebar-footer__links__item__icon" name="gear" hover-weight="bold" />
        <span class="visually-hidden">{{ t('appSidebarFooter.settings') }}</span>
      </router-link>
      <a
        v-if="!noHelp"
        v-b-tooltip.body="{ delay: tooltipDelay }"
        :href="helpLink"
        target="_blank"
        :title="t('appSidebarFooter.help')"
        class="app-sidebar-footer__links__item"
      >
        <phosphor-icon class="app-sidebar-footer__links__item__icon" name="question" hover-weight="bold" />
        <span class="visually-hidden">{{ t('appSidebarFooter.help') }}</span>
      </a>
      <a
        v-if="!noRemoveAll"
        v-b-tooltip.body="{ delay: tooltipDelay }"
        :title="t('appSidebarFooter.removeAll.link')"
        class="app-sidebar-footer__links__item"
        @click="confirmRemoveAll"
      >
        <phosphor-icon class="app-sidebar-footer__links__item__icon" name="trash" hover-weight="bold" />
        <span class="visually-hidden">{{ t('appSidebarFooter.removeAll.link') }}</span>
      </a>
      <a
        v-if="!noSignOut"
        v-b-tooltip.body="{ delay: tooltipDelay }"
        :href="signOutLink"
        :title="t('appSidebarFooter.signOut')"
        class="app-sidebar-footer__links__item"
      >
        <phosphor-icon class="app-sidebar-footer__links__item__icon" name="sign-out" hover-weight="bold" />
        <span class="visually-hidden">{{ t('appSidebarFooter.signOut') }}</span>
      </a>
    </div>
    <hook name="app-sidebar-footer:after" />
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
