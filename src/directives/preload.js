import { loadRouteLocation } from 'vue-router'

/**
 * Delay (ms) before a hover/focus is treated as intent to navigate, rather
 * than a pointer passing through. Keeps a fast sweep down the sidebar from
 * queueing a chunk request per entry.
 */
const PRELOAD_DELAY = 80

/**
 * WeakMap of element -> pending preload timer, so it can be cancelled on
 * mouseleave/blur or when the directive re-binds to a new route location.
 */
const timers = new WeakMap()

/**
 * WeakMap of element -> current route location, kept fresh across re-renders.
 */
const targets = new WeakMap()

function cancel(el) {
  clearTimeout(timers.get(el))
}

function schedule(el) {
  cancel(el)
  const { to, router } = targets.get(el) ?? {}
  if (!to || !router) return
  timers.set(
    el,
    setTimeout(() => {
      // `loadRouteLocation` runs the same dynamic import() the router would
      // run on navigation and caches the result on the matched record, so
      // repeat calls (re-hover, the actual navigation) are a no-op. Catch to
      // swallow chunk-fetch failures (offline, stale hashes after a
      // redeploy) instead of an uncaught rejection.
      loadRouteLocation(router.resolve(to)).catch(() => {})
    }, PRELOAD_DELAY)
  )
}

/**
 * `v-preload="{ to, router }"` — preloads a route location's component
 * chunk(s) on hover/focus intent, before the user actually clicks. `router`
 * is passed explicitly (from the consuming component's `useRouter()`)
 * rather than pulled off `binding.instance`, which isn't reliably wired to
 * global properties for every host element a directive can land on.
 */
export const preload = {
  mounted(el, binding) {
    targets.set(el, binding.value)
    const onIntent = () => schedule(el)
    const onCancel = () => cancel(el)
    el.addEventListener('mouseenter', onIntent)
    el.addEventListener('focus', onIntent)
    el.addEventListener('mouseleave', onCancel)
    el.addEventListener('blur', onCancel)
    el._preloadHandlers = { onIntent, onCancel }
  },

  updated(el, binding) {
    targets.set(el, binding.value)
  },

  unmounted(el) {
    cancel(el)
    timers.delete(el)
    targets.delete(el)
    const { onIntent, onCancel } = el._preloadHandlers ?? {}
    el.removeEventListener('mouseenter', onIntent)
    el.removeEventListener('focus', onIntent)
    el.removeEventListener('mouseleave', onCancel)
    el.removeEventListener('blur', onCancel)
    delete el._preloadHandlers
  }
}
