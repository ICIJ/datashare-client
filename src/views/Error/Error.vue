<script setup>
import { computed, onMounted, ref } from 'vue'
import { AppIcon, HapticCopy } from '@icij/murmur'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { Api } from '@/api'
import { apiInstance as api } from '@/api/apiInstance'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'
import VersionNumber from '@/components/VersionNumber'
import settings from '@/utils/settings'
import { useAuth } from '@/composables/useAuth'
import { useCore } from '@/composables/useCore'

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
   * Description (below the title) of the error page.
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
  },
  /**
   * Extra context (e.g. the requested document) listed in the troubleshooting details.
   */
  details: {
    type: Object,
    default: () => ({})
  }
})

const { t } = useI18n()
const core = useCore()
const { isAuthenticated } = useAuth()
const route = useRoute()

const errorMessage = computed(() => {
  return props.error instanceof Error ? props.error.message : props.error
})

const titleAsString = computed(() => props.title || errorMessage.value)

const occurredAt = new Date().toISOString()
const clientHash = import.meta.env.VITE_GIT_HASH ?? ''
const serverVersion = ref(null)

const troubleshootingEntries = computed(() => ({
  Code: props.code,
  Error: errorMessage.value,
  URL: route?.fullPath,
  ...props.details,
  Date: occurredAt,
  Client: clientHash.substring(0, 7),
  Server: serverVersion.value
}))

const hasValue = ([, value]) => value !== null && value !== undefined && value !== ''
const toLine = ([name, value]) => `${name}: ${value}`

const troubleshootingRows = computed(() => {
  const entries = Object.entries(troubleshootingEntries.value)
  return entries.filter(hasValue)
})

const troubleshootingDetails = computed(() => {
  const lines = troubleshootingRows.value.map(toLine)
  return lines.join('\n')
})

const fetchServerVersion = async () => {
  try {
    const version = await api.getVersion()
    serverVersion.value = version['git.tag'] || version['git.build.version']
  }
  catch {
    // The backend may be the very thing that failed: the details stay useful without its version.
  }
}

onMounted(fetchServerVersion)

const showDetails = ref(false)

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const helpLink = computed(() => core.config.get('helpLink', settings.helpLink))
const faqLink = computed(() => core.config.get('faqLink', settings.faqLink))
const documentationLink = computed(() => core.config.get('documentationLink', settings.documentationLink))
const logoutLink = computed(() => Api.getFullUrl(import.meta.env.VITE_DS_AUTH_SIGNOUT))
</script>

<template>
  <div class="error d-flex flex-column">
    <div class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="error__container container">
        <h1 class="mb-3 error__container__heading">
          <span class="error__container__heading__code me-3">
            <app-icon class="text-primary">
              <i-ph-smiley-sad />
            </app-icon>
            <span class="px-2 error__container__heading__code__value">
              {{ code }}
            </span>
          </span>
          {{ titleAsString || t('error.title') }}
        </h1>
        <p class="error__container__description lead">
          {{ description || t('error.description') }}
        </p>
        <div class="error__container__troubleshooting">
          <button
            type="button"
            class="error__container__troubleshooting__toggle btn btn-link p-0"
            aria-controls="error-details"
            :aria-expanded="showDetails"
            @click="toggleDetails"
          >
            <app-icon class="error__container__troubleshooting__toggle__caret me-1">
              <i-ph-caret-right />
            </app-icon>
            {{ t('error.troubleshootingDetails') }}
          </button>
          <div
            v-if="showDetails"
            id="error-details"
            class="error__details"
          >
            <dl class="error__details__list">
              <template
                v-for="[name, value] in troubleshootingRows"
                :key="name"
              >
                <dt class="error__details__list__name">
                  {{ name }}
                </dt>
                <dd class="error__details__list__value">
                  {{ value }}
                </dd>
              </template>
            </dl>
            <haptic-copy
              :text="troubleshootingDetails"
              :label="t('error.copyDetails')"
              class="error__details__copy"
              variant="light"
              size="sm"
            />
          </div>
        </div>
        <ul class="error__container__links list-inline text-capitalize">
          <li class="list-inline-item error__container__links__item">
            <a
              :href="faqLink"
              target="_blank"
            >
              <app-icon class="error__container__links__item__icon me-1">
                <i-ph-question-duotone />
              </app-icon>
              {{ t('error.faq') }}
            </a>
          </li>
          <li class="list-inline-item error__container__links__item">
            <a
              :href="documentationLink"
              target="_blank"
            >
              <app-icon class="error__container__links__item__icon me-1">
                <i-ph-book-duotone />
              </app-icon>
              {{ t('error.userGuides') }}
            </a>
          </li>
          <li class="list-inline-item error__container__links__item">
            <a
              :href="helpLink"
              target="_blank"
            >
              <app-icon class="error__container__links__item__icon me-1">
                <i-ph-ambulance-duotone />
              </app-icon>
              {{ t('error.help') }}
            </a>
          </li>
          <li class="list-inline-item error__container__links__item">
            <version-number
              tooltip-placement="top"
              class="d-inline"
            />
          </li>
          <mode-server-only v-if="isAuthenticated">
            <li class="list-inline-item error__container__links__item error__container__links__item--logout">
              <a
                :href="logoutLink"
              >
                <app-icon class="error__container__links__item__icon me-1">
                  <i-ph-sign-out-duotone />
                </app-icon>
                {{ t('error.logout') }}
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
  background: var(--bs-dark) no-repeat right bottom;
  color: var(--bs-light);
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
        background: var(--bs-black);
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
      margin-bottom: $spacer * 1.5;
    }

    &__troubleshooting {
      margin-bottom: $spacer * 5;

      &__toggle {
        &__caret {
          transition: transform 0.15s ease-out;
        }

        &[aria-expanded='true'] &__caret {
          transform: rotate(90deg);
        }
      }
    }

    &__links {
      &__item {
        &:not(:last-of-type):after {
          content: '|';
          margin: 0 $spacer;
          color: rgba(var(--bs-light-rgb), 0.5);
        }

        &,
        a {
          color: rgba(var(--bs-light-rgb), 0.5);
        }
      }
    }
  }

  &__details {
    max-width: 36rem;
    margin: $spacer auto 0;
    padding: $spacer;
    background: var(--bs-black);
    border-radius: var(--bs-border-radius-lg);
    text-align: start;

    &__list {
      display: grid;
      grid-template-columns: max-content minmax(0, 1fr);
      gap: $spacer * 0.25 $spacer;
      margin-bottom: $spacer;
      font-family: var(--bs-font-monospace);
      font-size: $font-size-sm;

      &__name {
        font-weight: normal;
        text-transform: capitalize;
        color: rgba(var(--bs-light-rgb), 0.5);
      }

      &__value {
        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
