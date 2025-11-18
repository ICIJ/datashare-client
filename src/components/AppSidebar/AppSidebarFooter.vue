<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ButtonIcon } from '@icij/murmur-next'

import AppSidebarFooterKeyboardShortcuts from '@/components/AppSidebar/AppSidebarFooterKeyboardShortcuts'
import AppSidebarFooterLinks from '@/components/AppSidebar/AppSidebarFooterLinks'
import AppSidebarFooterLinksEntry from '@/components/AppSidebar/AppSidebarFooterLinksEntry'
import AppSidebarFooterLogo from '@/components/AppSidebar/AppSidebarFooterLogo'
import Hook from '@/components/Hook/Hook'
import { useConfirmModal } from '@/composables/useConfirmModal'
import { useRemoveAll } from '@/composables/useRemoveAll'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'

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
const { toastedPromise } = useToast()
const { confirm } = useConfirmModal()
const { removeAll } = useRemoveAll()
const { isBasicAuth } = useAuth()
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

const signOutLink = computed(() => {
  if (isBasicAuth.value) {
    return null
  }
  return props.signOutLink
})

const signOutLabel = computed(() => {
  if (isBasicAuth.value) {
    return t('appSidebarFooter.signOutBasic')
  }
  return t('appSidebarFooter.signOut')
})

const signOutClass = computed(() => {
  return {
    'app-sidebar-footer__sign-out--basic-auth': isBasicAuth.value
  }
})
</script>

<template>
  <footer
    class="app-sidebar-footer"
    :class="classList"
  >
    <hook
      name="app-sidebar-footer:before"
      :bind="{ compact }"
    />
    <!-- First links row -->
    <app-sidebar-footer-links
      name="first"
      :compact="compact"
    >
      <app-sidebar-footer-links-entry
        name="logo"
        :compact="compact"
      >
        <app-sidebar-footer-logo :compact="compact">
          <template #version>
            <slot name="version" />
          </template>
        </app-sidebar-footer-logo>
      </app-sidebar-footer-links-entry>
      <app-sidebar-footer-links-entry
        v-if="!noKeyboardShortcuts && !compact"
        name="keyboard-shortcuts"
      >
        <app-sidebar-footer-keyboard-shortcuts />
      </app-sidebar-footer-links-entry>
    </app-sidebar-footer-links>
    <!-- Second links row -->
    <app-sidebar-footer-links
      name="second"
      :compact="compact"
    >
      <app-sidebar-footer-links-entry
        v-if="!noKeyboardShortcuts && compact"
        name="keyboard-shortcuts"
      >
        <app-sidebar-footer-keyboard-shortcuts />
      </app-sidebar-footer-links-entry>
      <app-sidebar-footer-links-entry
        v-if="!noSettings"
        :compact="compact"
        name="settings"
      >
        <button-icon
          :to="{ name: 'settings.appearance' }"
          hide-label
          variant="link"
          class="p-0 text-body"
          icon-left="gear"
          icon-left-hover-weight="bold"
          :label="t('appSidebarFooter.settings')"
        />
      </app-sidebar-footer-links-entry>
      <app-sidebar-footer-links-entry
        v-if="!noHelp"
        :compact="compact"
        name="help"
      >
        <button-icon
          :href="helpLink"
          target="_blank"
          hide-label
          variant="link"
          class="p-0 text-body"
          icon-left="question"
          icon-left-hover-weight="bold"
          :label="t('appSidebarFooter.help')"
        />
      </app-sidebar-footer-links-entry>
      <app-sidebar-footer-links-entry
        v-if="!noRemoveAll"
        :compact="compact"
        name="remove-all"
      >
        <button-icon
          hide-label
          variant="link"
          class="p-0 text-body"
          icon-left="trash"
          icon-left-hover-weight="bold"
          :label="t('appSidebarFooter.removeAll.link')"
          @click="confirmRemoveAll"
        />
      </app-sidebar-footer-links-entry>
      <app-sidebar-footer-links-entry
        v-if="!noSignOut"
        :compact="compact"
        name="sign-out"
      >
        <button-icon
          :href="signOutLink"
          :label="signOutLabel"
          :class="signOutClass"
          hide-label
          variant="link"
          class="app-sidebar-footer__sign-out p-0 text-body"
          icon-left="sign-out"
          icon-left-hover-weight="bold"
        />
      </app-sidebar-footer-links-entry>
    </app-sidebar-footer-links>
    <hook
      name="app-sidebar-footer:after"
      :bind="{ compact }"
    />
  </footer>
</template>

<style scoped lang="scss">
.app-sidebar-footer {
  color: var(--bs-tertiary-color-subtle);
  background: var(--bs-tertiary-bg-subtle);
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: $spacer-lg;
  padding: $spacer;

  &--compact {
    flex-direction: column-reverse;
    align-items: center;
    gap: $spacer-xl;
  }

  &__sign-out--basic-auth {
    cursor: not-allowed;
  }
}
</style>
