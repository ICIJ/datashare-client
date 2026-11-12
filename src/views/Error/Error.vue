<script setup>
import { computed, onMounted, ref } from 'vue'
import { AppIcon, HapticCopy } from '@icij/murmur'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { Api } from '@/api'
import { apiInstance as api } from '@/api/apiInstance'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'
import VersionNumber from '@/components/VersionNumber'
import errorReasons from '@/views/Error/errorReasons'
import settings from '@/utils/settings'
import { useAuth } from '@/composables/useAuth'
import { useCore } from '@/composables/useCore'
import { useMode } from '@/composables/useMode'
import IPhArrowClockwise from '~icons/ph/arrow-clockwise'
import IPhArrowLeft from '~icons/ph/arrow-left'
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
const { isServer } = useMode()
const route = useRoute()
const router = useRouter()

const errorMessage = computed(() => {
  return props.error instanceof Error ? props.error.message : props.error
})

const resolvedReason = computed(() => {
  if (props.reason) {
    return props.reason
  }
  return props.title || props.error ? null : 'notFound'
})

const errorCase = computed(() => {
  const key = resolvedReason.value
  return Object.hasOwn(errorReasons, key) ? errorReasons[key] : null
})
const resolvedCode = computed(() => {
  if (errorCase.value?.hidesCode) {
    return null
  }
  return errorCase.value?.code ?? props.code
})

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

const fallbackActions = ['retry', 'home']
const actionNames = computed(() => errorCase.value?.actions ?? fallbackActions)
const variants = ['primary', 'outline-light']

const actionHandlers = {
  retry: () => window.location.reload(),
  back: () => router.back(),
  home: () => router.push('/')
}

const actionIcons = {
  retry: IPhArrowClockwise,
  back: IPhArrowLeft
}

const canGoBack = computed(() => Boolean(router?.options.history.state.back))
const canLogout = computed(() => isServer.value && isAuthenticated.value)

const isActionVisible = (name) => {
  if (name === 'back') {
    return canGoBack.value
  }
  if (name === 'logout') {
    return canLogout.value
  }
  return true
}

const actions = computed(() => {
  const names = actionNames.value.filter(isActionVisible)
  return names.map((name, index) => ({
    name,
    variant: variants[index],
    icon: actionIcons[name],
    label: name === 'logout' ? t('error.logout') : t(`error.actions.${name}`),
    onClick: actionHandlers[name]
  }))
})

const backgroundCode = computed(() => resolvedCode.value)
const backgroundIcon = computed(() => errorCase.value?.icon ?? IPhSmileySad)

const occurredAt = new Date().toISOString()
const clientHash = import.meta.env.VITE_GIT_HASH ?? ''
const serverVersion = ref(null)

const fullUrl = computed(() => {
  if (!route) {
    return null
  }
  const { href } = router.resolve(route.fullPath)
  const url = new URL(href, window.location.href)
  return url.href
})

const troubleshootingEntries = computed(() => ({
  Code: props.code,
  Error: errorMessage.value,
  Reason: resolvedReason.value,
  URL: fullUrl.value,
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
    <div class="error__main">
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
      <div class="error__container">
        <p class="error__label">
          {{ label }}
        </p>
        <h1 class="error__title">
          {{ heading }}
        </h1>
        <p class="error__cause lead">
          {{ cause }}
        </p>
        <div class="error__actions">
          <b-button
            v-for="action in actions"
            :key="action.name"
            size="lg"
            :class="`error__actions__item--${action.name}`"
            :variant="action.variant"
            :href="action.name === 'logout' ? logoutLink : undefined"
            @click="action.onClick"
          >
            <app-icon
              v-if="action.icon"
              class="me-1"
            >
              <component :is="action.icon" />
            </app-icon>
            {{ action.label }}
          </b-button>
        </div>
      </div>
    </div>
    <footer class="error__footer">
      <b-collapse
        id="error-details"
        v-model="showDetails"
        class="error__details__collapse"
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
      </b-collapse>
      <div class="error__details">
        <button
          type="button"
          class="error__details__toggle btn btn-link"
          aria-controls="error-details"
          :aria-expanded="showDetails"
          @click="toggleDetails"
        >
          <app-icon class="error__details__toggle__caret me-1">
            <i-ph-caret-right />
          </app-icon>
          {{ t('error.troubleshootingDetails') }}
        </button>
        <haptic-copy
          :text="troubleshootingDetails"
          :label="t('error.copyDetails')"
          class="error__details__copy"
          variant="light"
          size="sm"
        />
        <version-number
          tooltip-placement="top"
          class="error__details__version"
        />
      </div>
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
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.error {
  --error-gutter: #{$spacer * 1.5};

  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 100vh;
  background: var(--bs-dark);
  color: var(--bs-light);

  @include media-breakpoint-up(lg) {
    --error-gutter: 12vw;
  }

  &__main {
    position: relative;
    display: flex;
    flex-grow: 1;
    align-items: flex-start;
    padding: $spacer * 3 var(--error-gutter);

    @include media-breakpoint-up(md) {
      align-items: center;
    }
  }

  &__container {
    max-width: 960px;
  }

  &__label {
    margin-bottom: $spacer;
    font-size: $font-size-sm;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(var(--bs-light-rgb), 0.5);
  }

  &__title {
    margin-bottom: $spacer * 1.25;
    font-size: clamp(2rem, 2.6vw, 3rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  &__cause {
    max-width: 36em;
    margin-bottom: $spacer * 2.5;
    color: rgba(var(--bs-light-rgb), 0.85);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: $spacer * 0.75;

    .btn-lg {
      --bs-btn-font-size: #{$font-size-base};
      white-space: nowrap;

      @include media-breakpoint-down(sm) {
        flex: 1;
      }
    }

    .btn-outline-light {
      --bs-btn-color: var(--bs-light);
    }
  }

  &__background {
    position: absolute;
    top: 0;
    bottom: 0;
    right: var(--error-gutter);
    display: flex;
    align-items: center;
    font-size: min(38vh, 14vw);
    font-weight: 800;
    line-height: 0.8;
    letter-spacing: -0.04em;
    opacity: 0.05;
    pointer-events: none;

    svg {
      max-height: 100%;
    }

    @include media-breakpoint-down(xxl) {
      display: none;
    }
  }

  &__footer {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $spacer;
    margin: 0 var(--error-gutter) $spacer * 3;
    padding-top: $spacer * 1.25;
    border-top: 1px solid rgba(var(--bs-light-rgb), 0.1);
    color: rgba(var(--bs-light-rgb), 0.5);

    :deep(.error__details__collapse) {
      flex-basis: 100%;
    }
  }

  &__details {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $spacer;

    &__version {
      color: rgba(var(--bs-light-rgb), 0.5);
    }

    &__toggle {
      padding: 0;
      border: 0;
      box-shadow: none;
      color: rgba(var(--bs-light-rgb), 0.8);
      text-decoration: none;

      &__caret {
        transition: transform 0.15s ease-out;
      }

      &[aria-expanded='true'] &__caret {
        transform: rotate(90deg);
      }
    }

    &__copy {
      --bs-btn-bg: transparent;
      --bs-btn-color: var(--bs-light);
      --bs-btn-border-color: rgba(var(--bs-light-rgb), 0.35);
    }

    &__list {
      display: grid;
      grid-template-columns: max-content minmax(0, 1fr);
      gap: $spacer * 0.25 $spacer;
      margin: 0;
      padding: $spacer;
      background: var(--bs-black);
      border-radius: var(--bs-border-radius-lg);
      font-family: var(--bs-font-monospace);
      font-size: $font-size-sm;
      color: var(--bs-light);

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

  &__links {
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
}
</style>
