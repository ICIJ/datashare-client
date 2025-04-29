// This code snippet is designed to share Vue's core functionality with plugins written by users. Vue 3's modular
// nature allows developers to import only what they need, but this can become cumbersome or inconsistent
// when integrating third-party plugins or user-generated extensions that might also rely on Vue.

// To streamline this and avoid redundancy, we use a global variable approach. Once the __VUE_SHARED__ object
// is assigned to the window object, it can be accessed by any plugin or extension that needs it. For instance,
// with Vite we use the https://github.com/crcong/vite-plugin-externals to replace the Vue dependencies with
// the global __VUE_SHARED__ object.
import * as __VUE_SHARED__ from 'vue'
import * as __PINIA_SHARED__ from 'pinia'

Object.assign(window, { __VUE_SHARED__, __PINIA_SHARED__ })
