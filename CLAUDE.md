# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Datashare Client is a Vue 3 web application for document search and analysis, part of the ICIJ Datashare ecosystem. It provides a frontend interface for searching, viewing, and analyzing documents with features like batch search, named entity recognition, and customizable insights.

## Development Commands

### Essential Commands

```bash
# Install dependencies
yarn

# Start dev server with hot reload at localhost:9009
yarn serve

# Build for production
yarn build

# Run all unit tests
yarn test

# Run tests in watch mode
yarn test:unit:watch

# Lint all files
yarn lint

# Lint and auto-fix
yarn lint:fix

# Lint only modified files (git diff)
yarn lint:modified
```

### Documentation & Storybook

```bash
# Generate all documentation
yarn doc

# Run Storybook dev server on port 6006
yarn storybook

# Individual doc generators
yarn doc:api        # Generate API docs from JSDoc
yarn doc:hooks      # Generate hooks documentation
yarn doc:widgets    # Generate widgets documentation
yarn doc:storybook  # Build static Storybook
```

### Running with Backend

The client requires the Datashare backend running on port 8080 with CORS enabled:

```bash
datashare --tcpListenPort 8080
```

The dev server proxies API requests (`/api`, `/settings`, `/me`, `/auth`, `/version`) to `VITE_DEV_PROXY` environment variable (defaults to backend).

## Architecture

### Core Application Pattern

The application uses a **Core class pattern** (not a standard Vue pattern) that extends multiple mixins to provide plugin-like functionality:

- **Core** (`src/core/Core.js`): Central application class that orchestrates Vue app, router, state management, and plugins
- **Mixins**: Functional composition pattern that adds capabilities to Core
  - `ComponentsMixin`: Dynamic component registration
  - `FiltersMixin`: Search filter management
  - `HooksMixin`: Extension points for injecting components
  - `I18nMixin`: Internationalization helpers
  - `PipelinesMixin`: Data transformation pipelines
  - `ProjectsMixin`: Multi-project management
  - `WidgetsMixin`: Dashboard widget system

### State Management (Pinia)

All stores are located in `src/store/modules/`:
- `search.js`: Search queries, filters, and results
- `document.js`: Current document state
- `hooks.js`: Registered hook components
- `insights.js`: Dashboard widgets
- `task.js`: Background task monitoring
- And 12+ other domain-specific stores

Access stores via `core.stores.useSearchStore()` in components.

### Plugin Systems

**Hooks** allow injecting Vue components at predefined plugin points:

```javascript
// Register a hook
core.registerHook({
  target: 'document.header',  // Plugin point identifier
  name: 'my-custom-component',
  order: 10,                   // Lower = renders first
  definition: MyComponent
})
```

**Widgets** extend the Insights dashboard:

```javascript
// Register a widget
core.registerWidget({
  name: 'my-widget',
  type: 'WidgetText',
  title: 'My Widget',
  cols: 6,  // Bootstrap grid columns (1-12)
  card: true
})
```

### Routing & Authentication

- **Router**: Vue Router with hash history mode (`src/router/index.js`)
- **Guards**: Route protection in `src/router/guards/`
- **Modes**: Three authentication modes defined in `src/mode/index.js`:
  - `LOCAL`: Standalone with document management
  - `EMBEDDED`: Embedded mode with document management
  - `SERVER`: Server-authenticated without document management

### API Layer

- **Api class** (`src/api/index.js`): Axios-based HTTP client for backend communication
- **Elasticsearch** (`src/api/elasticsearch.js`): Direct Elasticsearch queries for search
- **Resources**: API resource classes in `src/api/resources/`

## Testing

### Test Structure

```
tests/unit/
  ├── api_mock.js       # Mock API responses
  ├── CoreSetup.js      # Test helper to create Core instances
  ├── setup.js          # Vitest global setup
  └── specs/            # Test files (134 spec files)
      ├── core/
      ├── components/
      └── store/
```

### Running Specific Tests

```bash
# Run tests matching pattern
yarn test <pattern>

# Examples:
yarn test search           # Tests with "search" in filename
yarn test SearchBar        # Specific component tests
```

### Writing Tests

- Use `CoreSetup` helper to create isolated Core instances
- Mock API with `api_mock.js`
- Tests run in jsdom environment (configured in `vitest.config.js`)

## Build System (Vite)

### Key Configuration

- **Auto-imports**: Phosphor icons and BootstrapVue components are auto-imported
- **Aliases**:
  - `@/` → `src/`
  - `~mixins` → `src/mixins`
  - `~tests` → `tests/`
  - `~storybook` → `.storybook/`
- **SCSS**: Global styles in `src/utils/settings.scss` are auto-imported
- **Dev Server**: Port 9009, proxies backend requests

### Environment Variables

Prefix with `VITE_` to expose to client code:
- `VITE_BASE`: Base path for deployment
- `VITE_DEV_PROXY`: Backend URL for dev proxy
- `VITE_DS_PREVIEW_HOST`: Document preview host

## Component Structure

Components follow a modular structure in `src/components/`:
- Each major feature has its own directory
- Reusable components are standalone
- Storybook stories in `src/stories/` mirror component structure

### Component Naming

- Components: PascalCase (e.g., `DocumentCard.vue`)
- Composables: `use*` pattern in `src/composables/`
- Stores: `use*Store()` pattern

## Styling

- **Bootstrap 5** via `bootstrap-vue-next`
- **ICIJ Murmur**: Design system library (`@icij/murmur-next`)
- **SCSS**: Preprocessor with global settings
- **Theme**: Supports light/dark mode via `useTheme` composable

## Linting

Uses ICIJ shared ESLint config (`@icij/eslint-config`) with:
- Vue plugin
- TypeScript support
- Stylistic rules
- Vitest plugin
- Storybook plugin

## Important Files

- `src/core/index.js`: Core initialization and export
- `src/main.js`: Application entry point
- `src/router/index.js`: Route definitions
- `src/store/pinia.js`: Pinia instance configuration
- `src/utils/settings.js`: Default application settings
- `vite.config.js`: Build and dev server configuration
- `vitest.config.js`: Test configuration

## Code Patterns

### Accessing Core in Components

Use the `useCore()` composable to access the core instance:

```javascript
import { useCore } from '@/composables/useCore'

// In component setup
const core = useCore()

// Access API
core.api.getSettings()

// Access stores
core.stores.useSearchStore()

// Access router
core.router.push('/documents')
```

### Event Bus

Global event bus for cross-component communication:

```javascript
// Emit event
core.emit('document:loaded', { id: '123' })

// Listen to event
core.on('document:loaded', (payload) => { ... })

// Remove listener
core.off('document:loaded', handler)
```

### Toast Notifications

Use the `useToast()` composable for toast notifications:

```javascript
import { useToast } from '@/composables/useToast'

// In component setup
const { toast } = useToast()

// Show notifications
toast.success('Operation completed')
toast.error('Something went wrong')
toast.warning('Warning message')
toast.info('Information message')
```

### Toasted Promises

The `useToast` composable provides a `toastedPromise` helper that automatically shows success/error toasts:

```javascript
import { useToast } from '@/composables/useToast'

const { toastedPromise } = useToast()

toastedPromise(
  api.saveDocument(data),
  {
    successMessage: 'Document saved!',
    errorMessage: 'Failed to save document'
  }
)
```

## Multi-Project Support

The application supports multiple document collections ("projects"):
- Current project stored in search store
- Switch projects to change active document collection
- Each project can have isolated hooks and widgets
- Use `registerHookForProject()` and `registerWidgetForProject()` for project-specific extensions
