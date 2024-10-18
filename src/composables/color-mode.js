import { ref, onMounted, onUnmounted } from 'vue'

export function useColorMode(element, defaultColorMode = 'light') {
  // Reactive reference to store the current color mode
  const colorMode = ref(defaultColorMode)

  // Function to find the closest parent with data-bs-theme attribute
  const findClosestThemeElement = () => {
    return element.value.closest('[data-bs-theme]')
  }

  // Function to update the color mode based on the closest parent
  const updateColorMode = () => {
    const themeElement = findClosestThemeElement()
    colorMode.value = themeElement ? themeElement.getAttribute('data-bs-theme') || defaultColorMode : defaultColorMode
  }

  // MutationObserver to watch for changes to the data-bs-theme attribute
  let observer = null

  onMounted(() => {
    // Set initial color mode
    updateColorMode()

    // Create a new MutationObserver
    observer = new MutationObserver(updateColorMode)

    // Start observing the closest element with the data-bs-theme attribute
    const themeElement = findClosestThemeElement()
    if (themeElement) {
      observer.observe(themeElement, {
        attributes: true,
        attributeFilter: ['data-bs-theme']
      })
    }
  })

  onUnmounted(() => {
    // Disconnect the observer when the component is unmounted
    if (observer) {
      observer.disconnect()
    }
  })

  // Return the reactive colorMode ref
  return {
    colorMode
  }
}
