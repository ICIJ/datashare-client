import { ref, toRef, onMounted, onUnmounted } from 'vue'

export function useColorMode(element = window?.document?.body, defaultColorMode = 'light') {
  const elementRef = toRef(element)
  // Reactive reference to store the current color mode
  const colorMode = ref(defaultColorMode)

  // Function to find the closest parent with data-bs-theme attribute
  const findClosestThemeElement = () => elementRef.value.closest('[data-bs-theme]')

  // Function to update the color mode based on the closest parent
  const updateColorMode = () => {
    colorMode.value = findClosestThemeElement()?.getAttribute('data-bs-theme') ?? defaultColorMode
  }

  // MutationObserver to watch for changes to the data-bs-theme attribute
  let observer = null

  onMounted(() => {
    // Set initial color mode
    updateColorMode()
    // Create a new MutationObserver
    observer = new MutationObserver(updateColorMode)
    // Start getting the closest theme element (element with data-bs-theme attribute)
    const themeElement = findClosestThemeElement()
    // If the themeElement exists, observe it for changes to the data-bs-theme attribute
    if (themeElement) {
      observer.observe(themeElement, { attributes: true, attributeFilter: ['data-bs-theme'] })
    }
  })

  // Disconnect the observer when the component is unmounted
  onUnmounted(() => observer && observer.disconnect())

  return { colorMode }
}
