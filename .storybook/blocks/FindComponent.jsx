import React from 'react'

import { useOf, Unstyled, Source } from '@storybook/addon-docs/blocks'
import { join, relative } from 'path'

export const FindComponent = (args) => {
  const resolvedOf = useOf(args.of || 'story', ['story', 'meta'])
  const component = resolvedOf.story.component
  const componentName = component.__name
  const componentFile = component.__file.split('.').slice(0, -1).join('.')
  const componentPath = relative(join(import.meta.env.VITE_CWD, "src/components"), componentFile)
  const componentCode = `const ${componentName} = await datashare.findComponent("${componentPath}")`
  const registerCode = `
// It's usualy safer to wait for the app to be ready
document.addEventListener('datashare:ready', async () => {

  // Load the component from Datashare core
  const ${componentName} = await datashare.findComponent("${componentPath}")

  // Create a custom Vue 3 component
  const definition = {
    name: "${componentName}Wrapper",
    components: { 
      // Register the component we loaded from Datashare core
      ${componentName} 
    },
    template: \`
      <div>
        This is a custom component that will be mounted in the app sidebar.
        <${componentName} />
      </div>
    \`
  }

  // Register the component with Datashare's plugin system
  // This will mount the component bellow the page header
  datashare.registerHook({ target: 'page-header:after', definition })
})
  `
  return (
    <Unstyled>
      <div className="border p-3 rounded shadow-sm">
        <details>
          <summary className="fw-bold link-action">
            How to use this component?
          </summary>
          <div className="bg-action-subtle p-3 rounded my-3">
            This component can be used in Datashare from your plugin using the following code:
            <Source code={componentCode} language="js" />
            Then you build your vue component as usual, and register it with the Datashare plugin system:
            <Source code={registerCode} language='js' />
          </div>
        </details>
        <details>
          <summary className="fw-bold link-action">
            How does this work?
          </summary>
          <div className="bg-action-subtle p-3 rounded my-3">
            Datashare's plugin system works by defining "<a href="./?path=/docs/plugin-hooks--docs" className="fw-bold">hook</a>" targets 
            throughout the core UI where external code can be injected at runtime. You can call a single 
            registration method, providing the name of the hook slot (e.g., <code>page-header:after</code>) and 
            a Vue 3 component definition. Then Datashare will seamlessly mount your component into that location. 
            Under the hood, the framework maintains a registry of these hooks and, once the app is 
            initialized, iterates through them to render each custom component in its designated
            slot, all without altering the core code.
          </div>
        </details>
      </div>
    </Unstyled>
  );
}