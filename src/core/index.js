import Vue from 'vue'
import Core from './Core'

export { default as Core } from './Core'

/* eslint-disable no-new */
export function createCore (LocalVue = Vue) {
  const core = new Core(LocalVue)
  // Configure the core with server conf
  core.configure()
  // Create the core with all available plugins
  core.useAll()
  // Returns both the core
  return core
}
