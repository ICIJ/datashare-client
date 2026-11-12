<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { Api } from '@/api'
import { ERROR_REASONS } from '@/enums/errorReasons'
import ErrorLinks from '@/views/Error/ErrorLinks'
import ErrorTroubleshooting from '@/views/Error/ErrorTroubleshooting'
import { useAuth } from '@/composables/useAuth'
import { useMode } from '@/composables/useMode'
import { useTroubleshootingDetails } from '@/composables/useTroubleshootingDetails'
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
const { isAuthenticated } = useAuth()
const { isServer } = useMode()
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
  return Object.hasOwn(ERROR_REASONS, key) ? ERROR_REASONS[key] : null
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

const logoutLink = Api.getFullUrl(import.meta.env.VITE_DS_AUTH_SIGNOUT)

const actionHandlers = {
  retry: () => window.location.reload(),
  back: () => router.back(),
  home: () => router.push('/')
}

const actionIcons = {
  retry: IPhArrowClockwise,
  back: IPhArrowLeft
}

// history.state is not reactive: this is a snapshot taken when the error page opens.
const canGoBack = Boolean(router?.options.history.state.back)
const canLogout = computed(() => isServer.value && isAuthenticated.value)

const isActionVisible = (name) => {
  if (name === 'back') {
    return canGoBack
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
    href: name === 'logout' ? logoutLink : undefined,
    onClick: actionHandlers[name]
  }))
})

const backgroundCode = computed(() => resolvedCode.value)
const backgroundIcon = computed(() => errorCase.value?.icon ?? IPhSmileySad)

const { rows: troubleshootingRows, text: troubleshootingText } = useTroubleshootingDetails({
  code: () => props.code,
  message: errorMessage,
  reason: resolvedReason,
  details: () => props.details
})
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
            :href="action.href"
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
      <error-troubleshooting
        :rows="troubleshootingRows"
        :text="troubleshootingText"
      />
      <error-links :is-authenticated="isAuthenticated" />
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
}
</style>
