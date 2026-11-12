<script setup>
import { computed, onMounted, ref } from 'vue'
import { AppIcon, HapticCopy } from '@icij/murmur'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { Api } from '@/api'
import { apiInstance as api } from '@/api/apiInstance'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'
import VersionNumber from '@/components/VersionNumber'
import errorReasons from '@/views/Error/errorReasons'
import settings from '@/utils/settings'
import { useAuth } from '@/composables/useAuth'
import { useCore } from '@/composables/useCore'
import IPhSmileySad from '~icons/ph/smiley-sad'

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
   * Known error case (e.g. notFound, forbidden, document) that sets the text and the background.
   */
  reason: {
    type: String,
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

const resolvedReason = computed(() => {
  if (props.reason) {
    return props.reason
  }
  return props.title || props.error ? null : 'notFound'
})

const errorCase = computed(() => errorReasons[resolvedReason.value] ?? null)
const resolvedCode = computed(() => errorCase.value?.code ?? props.code)

const label = computed(() => {
  const parts = []
  if (resolvedCode.value) {
    parts.push(t('error.code', { code: resolvedCode.value }))
  }
  if (errorCase.value) {
    parts.push(t(`error.reasons.${resolvedReason.value}.label`))
  }
  return parts.length ? parts.join(' · ') : t('error.label')
})

const caseTitle = computed(() => errorCase.value ? t(`error.reasons.${resolvedReason.value}.title`) : null)
const caseCause = computed(() => errorCase.value ? t(`error.reasons.${resolvedReason.value}.cause`) : null)

const heading = computed(() => props.title || caseTitle.value || errorMessage.value || t('error.title'))
const cause = computed(() => props.description || caseCause.value || t('error.description'))

const backgroundCode = computed(() => resolvedCode.value)
const backgroundIcon = computed(() => errorCase.value?.icon ?? IPhSmileySad)

const occurredAt = new Date().toISOString()
const clientHash = import.meta.env.VITE_GIT_HASH ?? ''
const serverVersion = ref(null)

const troubleshootingEntries = computed(() => ({
  Code: props.code,
  Error: errorMessage.value,
  Reason: resolvedReason.value,
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
    <div
      class="error__background"
      aria-hidden="true"
    >
      <template v-if="backgroundCode">
        {{ backgroundCode }}
      </template>
      <component
        :is="backgroundIcon"
        v-else
      />
    </div>
    <div class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="error__container container">
        <p class="error__label">
          {{ label }}
        </p>
        <h1 class="mb-3 error__title">
          {{ heading }}
        </h1>
        <p class="error__cause lead">
          {{ cause }}
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
  position: relative;
  width: 100%;
  min-height: 100vh;

  &__container {
    margin: $spacer auto;
    text-align: center;

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

  &__cause {
    margin-bottom: $spacer * 1.5;
  }

  &__background {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30vw;
    opacity: 0.08;
    pointer-events: none;
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
