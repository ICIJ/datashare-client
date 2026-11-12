<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import { Api } from '@/api'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'
import settings from '@/utils/settings'
import { useCore } from '@/composables/useCore'

defineProps({
  /**
   * Show the log out link (server mode only).
   */
  isAuthenticated: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const core = useCore()

const helpLink = computed(() => core.config.get('helpLink', settings.helpLink))
const faqLink = computed(() => core.config.get('faqLink', settings.faqLink))
const documentationLink = computed(() => core.config.get('documentationLink', settings.documentationLink))
const logoutLink = Api.getFullUrl(import.meta.env.VITE_DS_AUTH_SIGNOUT)
</script>

<template>
  <ul class="error__links list-inline text-capitalize">
    <li class="list-inline-item error__links__item">
      <a
        :href="faqLink"
        target="_blank"
      >
        <app-icon class="error__links__item__icon me-1">
          <i-ph-question-duotone />
        </app-icon>
        {{ t('error.faq') }}
      </a>
    </li>
    <li class="list-inline-item error__links__item">
      <a
        :href="documentationLink"
        target="_blank"
      >
        <app-icon class="error__links__item__icon me-1">
          <i-ph-book-duotone />
        </app-icon>
        {{ t('error.userGuides') }}
      </a>
    </li>
    <li class="list-inline-item error__links__item">
      <a
        :href="helpLink"
        target="_blank"
      >
        <app-icon class="error__links__item__icon me-1">
          <i-ph-ambulance-duotone />
        </app-icon>
        {{ t('error.help') }}
      </a>
    </li>
    <mode-server-only v-if="isAuthenticated">
      <li class="list-inline-item error__links__item error__links__item--logout">
        <a
          :href="logoutLink"
        >
          <app-icon class="error__links__item__icon me-1">
            <i-ph-sign-out-duotone />
          </app-icon>
          {{ t('error.logout') }}
        </a>
      </li>
    </mode-server-only>
  </ul>
</template>

<style lang="scss" scoped>
.error__links {
  display: flex;
  flex-wrap: wrap;
  gap: $spacer * 0.5 $spacer * 1.5;
  margin: 0;
  padding: 0;

  &__item {
    margin: 0;

    @include media-breakpoint-up(md) {
      &:not(:last-of-type):after {
        content: '|';
        margin-left: $spacer * 1.5;
      }
    }

    &,
    a {
      color: rgba(var(--bs-light-rgb), 0.5);
    }
  }
}
</style>
