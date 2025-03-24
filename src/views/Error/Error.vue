<script setup>
import { ref, computed, onMounted } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import { Api } from '@/api'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'
import VersionNumber from '@/components/VersionNumber'
import settings from '@/utils/settings'
import { useCore } from '@/composables/useCore'

const { core } = useCore()

const props = defineProps({
  /**
   * An Error object or the error message directly.
   */
  error: {
    type: [String, Error],
    default: null
  },
  /**
   * Title of the error page.
   */
  title: {
    type: String,
    default: null
  },
  /**
   * Description (bellow the title) of the error page.
   */
  description: {
    type: String,
    default: null
  },
  /**
   * HTTP error code (if appliable).
   */
  code: {
    type: Number,
    default: null
  }
})

const username = ref(null)

const titleAsString = computed(() => {
  if (!props.title) {
    return props.error instanceof Error ? props.error.message : props.error
  }
  return props.title
})

const helpLink = computed(() => core.config.get('helpLink', settings.helpLink))
const faqLink = computed(() => core.config.get('faqLink', settings.faqLink))
const documentationLink = computed(() => core.config.get('documentationLink', settings.documentationLink))

const isAuthenticated = computed(() => !!username.value)
const logoutLink = computed(() => Api.getFullUrl(import.meta.env.VITE_DS_AUTH_SIGNOUT))

onMounted(async () => (username.value = await core.auth.getUsername()))
</script>

<template>
  <div class="error d-flex flex-column">
    <div class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="error__container container">
        <h1 class="mb-3 error__container__heading">
          <span class="error__container__heading__code me-3">
            <phosphor-icon :name="PhSmileySad" class="text-primary" />
            <span class="px-2 error__container__heading__code__value">
              {{ code }}
            </span>
          </span>
          {{ titleAsString || $t('error.title') }}
        </h1>
        <p class="error__container__description lead">
          {{ description || $t('error.description') }}
        </p>
        <ul class="error__container__links list-inline text-capitalize">
          <li class="list-inline-item error__container__links__item">
            <a :href="faqLink" target="_blank">
              <phosphor-icon weight="duotone" :name="PhQuestion" class="error__container__links__item__icon me-1" />
              {{ $t('error.faq') }}
            </a>
          </li>
          <li class="list-inline-item error__container__links__item">
            <a :href="documentationLink" target="_blank">
              <phosphor-icon weight="duotone" :name="PhBook" class="error__container__links__item__icon me-1" />
              {{ $t('error.userGuides') }}
            </a>
          </li>
          <li class="list-inline-item error__container__links__item">
            <a :href="helpLink" target="_blank">
              <phosphor-icon weight="duotone" :name="PhAmbulance" class="error__container__links__item__icon me-1" />
              {{ $t('error.help') }}
            </a>
          </li>
          <li class="list-inline-item error__container__links__item">
            <version-number tooltip-placement="top" class="d-inline" />
          </li>
          <mode-server-only v-if="isAuthenticated">
            <li class="list-inline-item error__container__links__item error__container__links__item--logout">
              <a :href="logoutLink" target="_blank">
                <phosphor-icon weight="duotone" :name="PhSignOut" class="error__container__links__item__icon me-1" />
                {{ $t('error.logout') }}
              </a>
            </li>
          </mode-server-only>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error {
  background: $app-context-sidebar-bg no-repeat right bottom;
  color: $app-context-sidebar-color;
  width: 100%;
  min-height: 100vh;

  &__container {
    margin: $spacer auto;
    text-align: center;

    &__heading {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;

      &__code {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        background: $app-sidebar-bg;
        border-radius: 1em;

        &__icon {
          transform: scale(1.1);
        }

        &__value {
          font-size: 0.6em;

          &:empty {
            display: none;
          }
        }
      }
    }

    &__description {
      margin-bottom: $spacer * 5;
    }

    &__links {
      &__item {
        &:not(:last-of-type):after {
          content: '|';
          margin: 0 $spacer;
          color: $app-sidebar-link-color;
        }

        &,
        a {
          color: $app-sidebar-link-color;
        }
      }
    }
  }
}
</style>
