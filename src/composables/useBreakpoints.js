import { ref, onMounted, onUnmounted, computed } from 'vue'

// Define constants for breakpoint names
export const BREAKPOINT_XS = 'xs'
export const BREAKPOINT_SM = 'sm'
export const BREAKPOINT_MD = 'md'
export const BREAKPOINT_LG = 'lg'
export const BREAKPOINT_XL = 'xl'
export const BREAKPOINT_XXL = 'xxl'

// Define constants for CSS variable names
const BREAKPOINT_VARIABLES = {
  [BREAKPOINT_XS]: '--bs-breakpoint-xs',
  [BREAKPOINT_SM]: '--bs-breakpoint-sm',
  [BREAKPOINT_MD]: '--bs-breakpoint-md',
  [BREAKPOINT_LG]: '--bs-breakpoint-lg',
  [BREAKPOINT_XL]: '--bs-breakpoint-xl',
  [BREAKPOINT_XXL]: '--bs-breakpoint-xxl'
}

// Function to get the CSS variable value
const getCssBreakpointValue = (variable) => {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue(variable), 10)
}

// Define breakpoints based on Bootstrap's CSS variables
const breakpoints = {
  [BREAKPOINT_XS]: getCssBreakpointValue(BREAKPOINT_VARIABLES[BREAKPOINT_XS]),
  [BREAKPOINT_SM]: getCssBreakpointValue(BREAKPOINT_VARIABLES[BREAKPOINT_SM]),
  [BREAKPOINT_MD]: getCssBreakpointValue(BREAKPOINT_VARIABLES[BREAKPOINT_MD]),
  [BREAKPOINT_LG]: getCssBreakpointValue(BREAKPOINT_VARIABLES[BREAKPOINT_LG]),
  [BREAKPOINT_XL]: getCssBreakpointValue(BREAKPOINT_VARIABLES[BREAKPOINT_XL]),
  [BREAKPOINT_XXL]: getCssBreakpointValue(BREAKPOINT_VARIABLES[BREAKPOINT_XXL])
}

export function useBreakpoints() {
  // Reactive reference for the current window width
  const windowWidth = ref(window.innerWidth)

  // ResizeObserver instance
  let resizeObserver = null

  // Function to observe window size changes
  const observeResize = () => {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        windowWidth.value = entry.contentRect.width
      }
    })
    resizeObserver.observe(document.documentElement)
  }

  // Function to stop observing window size changes
  const stopObservingResize = () => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  }

  // Computed property to determine the current breakpoint
  const currentBreakpoint = computed(() => {
    if (windowWidth.value >= breakpoints[BREAKPOINT_XXL]) return BREAKPOINT_XXL
    if (windowWidth.value >= breakpoints[BREAKPOINT_XL]) return BREAKPOINT_XL
    if (windowWidth.value >= breakpoints[BREAKPOINT_LG]) return BREAKPOINT_LG
    if (windowWidth.value >= breakpoints[BREAKPOINT_MD]) return BREAKPOINT_MD
    if (windowWidth.value >= breakpoints[BREAKPOINT_SM]) return BREAKPOINT_SM
    return BREAKPOINT_XS
  })

  // Reactive object to check if the current breakpoint is equal to or larger than the given size
  const breakpointUp = computed(() => ({
    [BREAKPOINT_XS]: windowWidth.value >= breakpoints[BREAKPOINT_XS],
    [BREAKPOINT_SM]: windowWidth.value >= breakpoints[BREAKPOINT_SM],
    [BREAKPOINT_MD]: windowWidth.value >= breakpoints[BREAKPOINT_MD],
    [BREAKPOINT_LG]: windowWidth.value >= breakpoints[BREAKPOINT_LG],
    [BREAKPOINT_XL]: windowWidth.value >= breakpoints[BREAKPOINT_XL],
    [BREAKPOINT_XXL]: windowWidth.value >= breakpoints[BREAKPOINT_XXL]
  }))

  // Reactive object to check if the current breakpoint is equal to or smaller than the given size
  const breakpointDown = computed(() => ({
    [BREAKPOINT_XS]: windowWidth.value <= breakpoints[BREAKPOINT_XS],
    [BREAKPOINT_SM]: windowWidth.value <= breakpoints[BREAKPOINT_SM],
    [BREAKPOINT_MD]: windowWidth.value <= breakpoints[BREAKPOINT_MD],
    [BREAKPOINT_LG]: windowWidth.value <= breakpoints[BREAKPOINT_LG],
    [BREAKPOINT_XL]: windowWidth.value <= breakpoints[BREAKPOINT_XL],
    [BREAKPOINT_XXL]: windowWidth.value <= breakpoints[BREAKPOINT_XXL]
  }))

  // Set up observer on component mount
  onMounted(observeResize)

  // Clean up observer on component unmount
  onUnmounted(stopObservingResize)

  // Return the current breakpoint and the new reactive objects
  return {
    currentBreakpoint,
    breakpointUp,
    breakpointDown
  }
}
