import React from 'react'
import { useOf, Unstyled, Source } from '@storybook/addon-docs/blocks'
import { basename, relative } from 'path'

const HOOK_TARGET = 'page-header:after'
const HOOK_DOCS_PATH = './?path=/docs/plugin-hooks--docs'

/**
 * Finds the import path of a Vue component based on the story kind.
 * It searches for a Vue file in the components directory that matches the story kind.
 * @param {string} storyKind - The kind of the story, typically in the format 'Category/ComponentName'.
 * @returns {string|null} - The relative import path of the component, or null if not found.
 */
function findComponentImportPath(storyKind) {
  const token = `${storyKind}.vue`.toLowerCase()
  const modules = import.meta.glob('/src/components/**/*.vue', { eager: false })
  const match = Object.keys(modules).find(path => path.toLowerCase().endsWith(token))
  // If no match found, return null
  return match ? relative('/src/components', match).split('.').shift() : null
}

/**
 * Builds the component information object from the import path.
 * It extracts the base name and the name of the component.
 * @param {string} importPath - The import path of the component.
 * @returns {Object} - An object containing the import path and the component name. 
 */
function buildComponentInfo(importPath) {
  const base = basename(importPath)
  const name = base.split('.').shift()
  return { importPath, name }
}

/**
 * Generates the code snippet to load a Vue component using Datashare.
 * It uses the `datashare.findComponent` method to load the component dynamically.
 * @param {Object} info - The component information object containing importPath and name.
 * @returns {string} - The code snippet to load the component.
 */
function makeLoadCode({ importPath, name }) {
  return `const ${name} = await datashare.findComponent("${importPath}")`
}

/**
 * Generates the code snippet to register a Vue component in a specific hook target.
 * It listens for the 'datashare:ready' event and registers the component with a Vue definition.
 * @param {Object} info - The component information object containing importPath and name.
 * @returns {string} - The code snippet to register the component.
 */
function makeRegisterCode({ importPath, name }) {
  return `
// wait for Datashare app to be ready
document.addEventListener('datashare:ready', async () => {
  const ${name} = await datashare.findComponent("${importPath}")

  const definition = {
    name: "${name}Wrapper",
    components: { ${name} },
    template: \`
      <div>
        This is a custom component mounted below the header.
        <${name} />
      </div>
    \`
  }

  datashare.registerHook({ target: "${HOOK_TARGET}", definition })
})
`
}

/**
 * UsageDetails component displays how to use the custom Vue component.
 * @param {Object} props - The properties passed to the component.
 * @param {Function} props.loadCode - The function to load the component.
 * @param {Function} props.registerCode - The function to register the component.
 * @returns {JSX.Element} - A details element with usage instructions and code snippets.
 */
function UsageDetails({ loadCode, registerCode }) {
  return (
    <details>
      <summary className="fw-bold link-action">
        How to use this component?
      </summary>
      <div className="bg-action-subtle p-3 rounded my-3">
        Use in your plugin:
        <Source code={loadCode} language="js" />
        Then register your Vue component:
        <Source code={registerCode} language="js" />
      </div>
    </details>
  )
}

/**
 * HowItWorks component explains how the hook system works in Datashare.
 * It provides a summary of the hook registration process and how custom components are mounted.
 * @returns {JSX.Element} - A details element with an explanation of the hook system. 
 */
function HowItWorks() {
  return (
    <details>
      <summary className="fw-bold link-action">
        How does this work?
      </summary>
      <div className="bg-action-subtle p-3 rounded my-3">
        Datashare's plugin system works by defining <a href={HOOK_DOCS_PATH} className="fw-bold">hook</a> 
        targets throughout the core UI where external code can be injected at runtime.
        You can call a single registration method, providing the name of the hook slot
        (e.g., <code>page-header:after</code>) and a Vue 3 component definition.
        Then Datashare will seamlessly mount your component into that location.

        Under the hood, the framework maintains a registry of these hooks and, once
        the app is initialized, iterates through them to render each custom component
        in its designated slot.
      </div>
    </details>
  )
}

/**
 * FindComponent component is the main component that integrates the functionality
 * to find and display information about a Vue component based on the current story.
 * It uses the `useOf` hook to access the current story and finds the component import path.
 * If a valid import path is found, it builds the component information and generates
 * the code snippets for loading and registering the component.
 * @returns {JSX.Element|null} - Returns the component details or null if no import path is found.
 */
export const FindComponent = () => {
  const { story } = useOf('story')
  const importPath = findComponentImportPath(story.kind)

  if (!importPath) return null

  const info = buildComponentInfo(importPath)
  const loadCode = makeLoadCode(info)
  const registerCode = makeRegisterCode(info)

  return (
    <Unstyled>
      <div className="border p-3 rounded shadow-sm">
        <UsageDetails loadCode={loadCode} registerCode={registerCode} />
        <HowItWorks />
      </div>
    </Unstyled>
  )
}
