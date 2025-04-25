<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import AppSidebarFooterKeyboardShortcuts from '@/components/AppSidebar/AppSidebarFooterKeyboardShortcuts'
import AppSidebarFooterLinks from '@/components/AppSidebar/AppSidebarFooterLinks'
import AppSidebarFooterLinksEntry from '@/components/AppSidebar/AppSidebarFooterLinksEntry'
import AppSidebarFooterLogo from '@/components/AppSidebar/AppSidebarFooterLogo'
import ButtonIcon from '@/components/Button/ButtonIcon'
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
    <hook name="app-sidebar-footer:before" v-bind="{ compact, name }" />
    <!-- First links row -->
    <app-sidebar-footer-links name="first" :compact="compact">
      <app-sidebar-footer-links-entry name="logo" :compact="compact">
        <app-sidebar-footer-logo :compact="compact">
          <template #version>
            <slot name="version" />
          </template>
        </app-sidebar-footer-logo>
      </app-sidebar-footer-links-entry>
      <app-sidebar-footer-links-entry v-if="!noKeyboardShortcuts && !compact" name="keyboard-shortcuts">
        <app-sidebar-footer-keyboard-shortcuts />
      </app-sidebar-footer-links-entry>
    </app-sidebar-footer-links>
    <!-- Second links row -->
    <app-sidebar-footer-links name="second" :compact="compact">
      <app-sidebar-footer-links-entry v-if="!noKeyboardShortcuts && compact" name="keyboard-shortcuts">
        <app-sidebar-footer-keyboard-shortcuts />
      </app-sidebar-footer-links-entry>
      <app-sidebar-footer-links-entry v-if="!noSettings" :compact="compact" name="settings">
        <button-icon
          :to="{ name: 'settings.appearance' }"
          hide-label
          variant="link"
          class="p-0 text-body"
          icon-left="gear"
          icon-left-hover-weight="bold"
          :label="$t('appSidebarFooter.settings')"
        />
      </app-sidebar-footer-links-entry>
      <app-sidebar-footer-links-entry v-if="!noHelp" :compact="compact" name="help">
        <button-icon
          :href="helpLink"
          target="_blank"
          hide-label
          variant="link"
          class="p-0 text-body"
          icon-left="question"
          icon-left-hover-weight="bold"
          :label="$t('appSidebarFooter.help')"
        />
      </app-sidebar-footer-links-entry>
      <app-sidebar-footer-links-entry v-if="!noRemoveAll" :compact="compact" name="remove-all">
        <button-icon
          hide-label
          variant="link"
          class="p-0 text-body"
          icon-left="trash"
          icon-left-hover-weight="bold"
          :label="$t('appSidebarFooter.removeAll.link')"
          @click="confirmRemoveAll"
        />
      </app-sidebar-footer-links-entry>
      <app-sidebar-footer-links-entry v-if="!noSignOut" :compact="compact" name="sign-out">
        <button-icon
          :href="signOutLink"
          hide-label
          variant="link"
          class="p-0 text-body"
          icon-left="sign-out"
          icon-left-hover-weight="bold"
          :label="$t('appSidebarFooter.signOut')"
        />
      </app-sidebar-footer-links-entry>
    </app-sidebar-footer-links>
    <hook name="app-sidebar-footer:after" v-bind="{ compact, name }" />
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
}
</style>
