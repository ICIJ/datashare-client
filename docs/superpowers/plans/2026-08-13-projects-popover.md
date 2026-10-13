# Projects Popover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace inline lists of project buttons with a single anchor button that opens a scrollable popover, and make every popover in the application open on click instead of hover.

**Architecture:** One global `BPopover` default in `Core.useBootstrapVue()` switches all popovers to click-only. A new `ProjectsButton` component renders a `ProjectButton` when there is one project and an anchor button plus `AppPopover` when there are several. `DisplayProjectList` becomes a thin wrapper over it, so the six table call sites need no edits.

**Tech Stack:** Vue 3 (`<script setup>`), bootstrap-vue-next 0.42, vue-i18n, Vitest, Vue Test Utils, Storybook.

**Spec:** `docs/superpowers/specs/2026-08-13-projects-popover-design.md`

## Global Constraints

- No em dash characters in any file written by this plan.
- No single-line `if` statements without braces.
- Prefer intermediary named variables over dense one-liners.
- Implement exactly what the spec describes. Anything extra goes in a follow-up list, not the diff.
- Run tests with `yarn vitest --run <path>`. Lint with `yarn lint`.
- Do not commit the untracked `eng.traineddata` artifact.
- The popover does NOT toggle visibility under jsdom. Never write a unit test that claims to assert popover open/close behavior; those tests pass or fail for unrelated reasons. See the spec's "Verification constraints".

---

### Task 1: Click-only popovers

Switches every `<b-popover>` in the application to click-to-open and click-outside-to-close, and removes hover and focus as triggers.

**Files:**
- Modify: `src/core/Core.js:145-149`
- Test: `tests/unit/specs/core/CoreBootstrapDefaults.spec.js` (create)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: a global `BPopover` default of `{ click: true }`. Task 2's `AppPopover` usage relies on it, and passes no trigger prop of its own.

**Background the implementer needs.** `bootstrap-vue-next` resolves a popover's triggers like this:

```js
// node_modules/bootstrap-vue-next/dist/floatingUi-DAKhZxeT.mjs:2180-2187
if (props.hover !== void 0 || props.focus !== void 0 || props.click !== void 0) {
  return { hover: props.hover ?? false, focus: props.focus ?? false, click: props.click ?? false }
}
return { hover: true, focus: true, click: false }
```

Setting `click` alone therefore turns hover and focus off. Click-outside dismissal is wired only when the click trigger is active (same file, `:2238`), so the single flag delivers both halves of the requirement.

`BPopover` reads global defaults via `useDefaults(_props, 'BPopover')` (`:1968`), and `createBootstrap` provides its `components` option as that defaults registry (`dist/src/plugins/createBootstrap/index.mjs`). The option is currently `components: true`, which provides `ref(true)` and has no effect.

The injection key is a **string**, not a symbol. `Object.getOwnPropertySymbols` on the provides object returns nothing; use `Reflect.ownKeys`. This cost real debugging time during planning, hence the explicit test below.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/core/CoreBootstrapDefaults.spec.js`:

```js
import { Core } from '@/core/Core'

describe('Core bootstrap defaults', () => {
  const collectProvided = (plugin) => {
    const provided = {}
    plugin.install({ provide: (key, value) => (provided[key] = value), use: () => {} })
    return Reflect.ownKeys(provided).map((key) => provided[key])
  }

  it('should make every popover open on click instead of hover', () => {
    const core = Core.init().useBootstrapVue()
    const [defaults] = collectProvided(core.bootstrapVue)
    expect(defaults?.value?.BPopover?.click).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest --run tests/unit/specs/core/CoreBootstrapDefaults.spec.js`
Expected: FAIL with `AssertionError: expected undefined to be true`

- [ ] **Step 3: Write minimal implementation**

In `src/core/Core.js`, replace the body of `useBootstrapVue()` at line 146:

```js
  useBootstrapVue() {
    // `components` doubles as bootstrap-vue-next's global defaults registry. Popovers
    // default to hover and focus triggers, and only wire click-outside dismissal when
    // the click trigger is active, so this one default makes every popover in the
    // application open on click and close on click outside.
    this._bootstrapVue = createBootstrap({ components: { BPopover: { click: true } }, directives: true })
    this.use(this.bootstrapVue)
    return this
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest --run tests/unit/specs/core/CoreBootstrapDefaults.spec.js`
Expected: PASS

- [ ] **Step 5: Run the popover specs that already exist, to check for regressions**

Run: `yarn vitest --run tests/unit/specs/components/Document/DocumentDownloadPopover tests/unit/specs/components/Display/DisplayEmail.spec.js`
Expected: PASS. Both use `CoreSetup.init().useAll()`, which installs the plugin, and neither drives its popover by hover.

- [ ] **Step 6: Verify the actual behavior in a browser**

jsdom cannot show this. Run `yarn serve` and check, recording the result in the pull request:

- a document's share and download popovers open on click, not on hover
- clicking outside closes them
- an entity mention in a document opens its popover on click, not on hover
- an email cell in a table opens its popover on click, not on hover
- Escape closes an open popover

If Escape does not close it, note that and stop: it is a new requirement to raise with the reviewer, not something to silently add.

- [ ] **Step 7: Commit**

```bash
git add src/core/Core.js tests/unit/specs/core/CoreBootstrapDefaults.spec.js
git commit -m "fix(popover): open popovers on click and close them on click outside icij/datashare#2320"
```

---

### Task 2: The `ProjectsButton` component

Builds the component in isolation, with its i18n key, unit spec, and Storybook story. Nothing consumes it yet.

**Files:**
- Create: `src/components/Project/ProjectsButton.vue`
- Modify: `src/lang/en.json`
- Create: `tests/unit/specs/components/Project/ProjectsButton.spec.js`
- Create: `src/stories/components/Project/ProjectsButton.stories.js`

**Interfaces:**
- Consumes: the global click default from Task 1. `ProjectsButton` passes no trigger prop to `AppPopover`.
- Produces: `ProjectsButton`, a component with a single prop `projects` of type `[Array, String]` defaulting to `[]`. Task 3 renders it as `<projects-button :projects="..." />`.

**Design constraints the implementer needs.**

The target button must NOT call the slot's `toggle`. With the click trigger active, `BPopover` attaches its own click listener to the target element (`floatingUi-DAKhZxeT.mjs:2214`); adding a second handler toggles twice and the popover never opens. The established pattern in this repo is `I18nLocaleDropdown.vue:42-57`, where the target button carries no toggle handler at all.

`ProjectThumbnail` requires `project` to be an Object (`ProjectThumbnail.vue:26-29`), but `projects` may contain strings. Resolve each one the way `ProjectLabel.vue:38-44` does.

- [ ] **Step 1: Add the i18n key**

In `src/lang/en.json`, add a top-level key next to the other project keys. Only `en.json` needs it: `Core.useI18n()` sets `fallbackLocale` to the default locale (`Core.js:130-131`), so other locales fall back to English until translated.

```json
"projectsButton": {
  "projectsCount": "no projects | 1 project | {count} projects"
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/unit/specs/components/Project/ProjectsButton.spec.js`:

```js
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectsButton from '@/components/Project/ProjectsButton'

describe('ProjectsButton.vue', () => {
  const { plugins, config } = CoreSetup.init().useAll().useRouterWithoutGuards()

  beforeAll(() => {
    config.set('projects', [
      { name: 'banana-papers', label: 'Banana Papers' },
      { name: 'lux-leaks', label: 'LuxLeaks' },
      { name: 'citrus-confidential', label: 'Citrus Confidential' }
    ])
  })

  // The real popover never toggles under jsdom, so it is stubbed the same way
  // DocumentDownloadPopover.spec.js does. Open and close behavior is verified manually.
  const AppPopoverStub = {
    name: 'AppPopover',
    props: ['title'],
    template: '<div class="app-popover-stub"><slot name="target" /><slot /></div>'
  }

  const mountButton = (projects) => {
    return mount(ProjectsButton, {
      global: { plugins, stubs: { AppPopover: AppPopoverStub } },
      props: { projects }
    })
  }

  it('should render a single project button and no popover for one project', () => {
    const wrapper = mountButton(['banana-papers'])
    expect(wrapper.findAllComponents({ name: 'ProjectButton' })).toHaveLength(1)
    expect(wrapper.find('.app-popover-stub').exists()).toBe(false)
  })

  it('should render nothing for zero projects', () => {
    const wrapper = mountButton([])
    expect(wrapper.findAllComponents({ name: 'ProjectButton' })).toHaveLength(0)
    expect(wrapper.find('.app-popover-stub').exists()).toBe(false)
  })

  it('should accept a bare string as a single project', () => {
    const wrapper = mountButton('banana-papers')
    expect(wrapper.findAllComponents({ name: 'ProjectButton' })).toHaveLength(1)
  })

  it('should render a popover with the pluralised count for several projects', () => {
    const wrapper = mountButton(['banana-papers', 'lux-leaks', 'citrus-confidential'])
    expect(wrapper.find('.app-popover-stub').exists()).toBe(true)
    expect(wrapper.find('.projects-button__label').text()).toBe('3 projects')
  })

  it('should render exactly two thumbnails on the anchor whatever the project count', () => {
    const wrapper = mountButton(['banana-papers', 'lux-leaks', 'citrus-confidential'])
    const thumbnails = wrapper.findAll('.projects-button__thumbnails__item')
    expect(thumbnails).toHaveLength(2)
  })

  it('should list one project button per project inside the popover', () => {
    const projects = ['banana-papers', 'lux-leaks', 'citrus-confidential']
    const wrapper = mountButton(projects)
    const buttons = wrapper.find('.projects-button__list').findAllComponents({ name: 'ProjectButton' })
    expect(buttons).toHaveLength(3)
  })

  it('should pass each project through to its button in the popover', () => {
    const wrapper = mountButton(['banana-papers', 'lux-leaks'])
    const [first] = wrapper.find('.projects-button__list').findAllComponents({ name: 'ProjectButton' })
    expect(first.props('project')).toBe('banana-papers')
  })
})
```

Note: there is deliberately no unit test for the absence of the popover header's close
button. `AppPopoverStub` never renders `AppPopoverHeader`, so any such assertion would
pass whatever the component does. That check lives in Step 7's browser verification.

- [ ] **Step 3: Run tests to verify they fail**

Run: `yarn vitest --run tests/unit/specs/components/Project/ProjectsButton.spec.js`
Expected: FAIL with a resolution error for `@/components/Project/ProjectsButton`

- [ ] **Step 4: Write the component**

Create `src/components/Project/ProjectsButton.vue`:

```vue
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import isObject from 'lodash/isObject'
import isString from 'lodash/isString'

import AppPopover from '@/components/AppPopover/AppPopover'
import ProjectButton from '@/components/Project/ProjectButton'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'
import { useCore } from '@/composables/useCore'

defineOptions({ name: 'ProjectsButton' })

const props = defineProps({
  /**
   * The projects to display. A bare string is treated as a single project.
   */
  projects: {
    type: [Array, String],
    default: () => []
  }
})

const THUMBNAILS_COUNT = 2

const { t } = useI18n()
const core = useCore()

const projectList = computed(() => {
  return isString(props.projects) ? [props.projects] : props.projects
})

const hasSingleProject = computed(() => projectList.value.length === 1)
const hasPopover = computed(() => projectList.value.length > 1)
const thumbnails = computed(() => projectList.value.slice(0, THUMBNAILS_COUNT))
const label = computed(() => t('projectsButton.projectsCount', projectList.value.length))

const resolveProject = (project) => {
  if (isObject(project)) {
    return core?.findProject(project.name) ?? project
  }
  return core?.findProject(project) ?? { name: project }
}
</script>

<template>
  <project-button
    v-if="hasSingleProject"
    :project="projectList[0]"
  />
  <app-popover
    v-else-if="hasPopover"
    :title="label"
    class="projects-button__popover"
  >
    <template #target="{ visible }">
      <b-button
        class="projects-button"
        variant="outline-secondary"
        :aria-expanded="visible"
      >
        <span class="projects-button__thumbnails">
          <project-thumbnail
            v-for="(project, index) in thumbnails"
            :key="index"
            :project="resolveProject(project)"
            :rounded="1"
            no-caption
            width="1.25em"
            class="projects-button__thumbnails__item"
          />
        </span>
        <span class="projects-button__label ms-2">{{ label }}</span>
      </b-button>
    </template>
    <div class="projects-button__list d-flex flex-wrap gap-2">
      <project-button
        v-for="(project, index) in projectList"
        :key="index"
        :project="project"
      />
    </div>
  </app-popover>
</template>

<style lang="scss">
.projects-button {
  --bs-btn-color: var(--bs-body-color);
  --bs-btn-border-color: var(--bs-light);
  --bs-btn-bg: var(--bs-body-bg);
  --bs-btn-hover-bg: var(--bs-btn-bg);
  --bs-btn-hover-color: var(--bs-btn-color);
  --bs-btn-hover-border-color: var(--bs-primary);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex-wrap: nowrap;

  &__thumbnails {
    display: inline-flex;
    align-items: center;

    // Overlap the thumbnails, matching ProjectDropdownSelectorButtonContent.
    &__item:not(:first-of-type) {
      box-shadow: -1px 0 0 0 var(--bs-body-bg);
      margin-left: -0.5em;
    }
  }

  // Three columns of project buttons on a wide viewport. The vw ceiling is what makes
  // the list collapse to a single column on narrow screens, per the responsive frame.
  &__popover {
    --bs-popover-max-width: min(33rem, 90vw);
  }

  &__list {
    max-height: 20rem;
    overflow-y: auto;
  }
}
</style>
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `yarn vitest --run tests/unit/specs/components/Project/ProjectsButton.spec.js`
Expected: PASS

- [ ] **Step 6: Add the Storybook story**

Create `src/stories/components/Project/ProjectsButton.stories.js`, following `ProjectButton.stories.js`:

```js
import ProjectsButton from '@/components/Project/ProjectsButton'

export default {
  title: 'Components/Project/ProjectsButton',
  tags: ['autodocs'],
  component: ProjectsButton,
  args: {
    projects: [
      { name: 'banana-papers', label: 'Banana Papers' },
      { name: 'lux-leaks', label: 'LuxLeaks' }
    ]
  }
}

export const Default = {}

export const SingleProject = {
  args: {
    projects: [{ name: 'banana-papers', label: 'Banana Papers' }]
  }
}

export const ManyProjects = {
  args: {
    projects: [
      'apple-secrets',
      'average-scandal',
      'banana-papers',
      'blue-berries',
      'citrus-confidential',
      'figcen-files',
      'green-files',
      'litchee-secrets',
      'lux-leaks',
      'old-projects',
      'pear-project',
      'strawberry-secrets'
    ]
  }
}
```

- [ ] **Step 7: Check the story in the browser**

Run `yarn storybook` and open `Components/Project/ProjectsButton`. Confirm against the Figma frames in icij/datashare#2320:

- the anchor shows two overlapped thumbnails and the count
- clicking opens the popover, hovering does not
- the list scrolls vertically when there are twelve projects
- a project button inside the popover gets a pink border on hover
- clicking outside closes the popover
- the popover header shows the count and **no close button**. If a close button appears,
  `AppPopoverHeader.vue:38-48` is rendering its default; suppress it by adding an empty
  close template inside the `app-popover`:

```vue
    <template #close><span /></template>
```

- [ ] **Step 8: Lint and commit**

```bash
yarn lint src/components/Project/ProjectsButton.vue src/stories/components/Project/ProjectsButton.stories.js tests/unit/specs/components/Project/ProjectsButton.spec.js
git add src/components/Project/ProjectsButton.vue src/stories/components/Project/ProjectsButton.stories.js tests/unit/specs/components/Project/ProjectsButton.spec.js src/lang/en.json
git commit -m "feat(project): add a projects button opening a popover with the project list icij/datashare#2320"
```

---

### Task 3: Use `ProjectsButton` in tables and the batch search card

Routes every existing project list through the new component.

**Files:**
- Modify: `src/components/Display/DisplayProjectList.vue`
- Modify: `src/components/BatchSearch/BatchSeachCard/BatchSearchCardDetails.vue:244-257`
- Test: `tests/unit/specs/components/Display/DisplayProjectList.spec.js` (create)

**Interfaces:**
- Consumes: `ProjectsButton` from Task 2, with its `projects` prop of type `[Array, String]`.
- Produces: nothing further.

`DisplayProjectList` keeps its existing `values` prop so its six call sites stay untouched:

- `src/views/Task/TaskBoard/TaskBoardLatest.vue:182`
- `src/views/Task/TaskBatchSearch/TaskBatchSearchList.vue:118`
- `src/views/Task/TaskBatchDownload/TaskBatchDownloadList.vue:99`
- `src/views/Task/TaskDocuments/TaskDocumentsList.vue:96`
- `src/views/Task/TaskEntities/TaskEntitiesList.vue:103`
- `src/components/Settings/SettingsSnapshots/SettingsSnapshotsList.vue:111`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/components/Display/DisplayProjectList.spec.js`:

```js
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayProjectList from '@/components/Display/DisplayProjectList'

describe('DisplayProjectList.vue', () => {
  const { plugins, config } = CoreSetup.init().useAll().useRouterWithoutGuards()

  beforeAll(() => {
    config.set('projects', [
      { name: 'banana-papers', label: 'Banana Papers' },
      { name: 'lux-leaks', label: 'LuxLeaks' }
    ])
  })

  const mountList = (values) => {
    return mount(DisplayProjectList, { global: { plugins }, props: { values } })
  }

  it('should delegate its values to a projects button', () => {
    const values = ['banana-papers', 'lux-leaks']
    const wrapper = mountList(values)
    const button = wrapper.findComponent({ name: 'ProjectsButton' })
    expect(button.exists()).toBe(true)
    expect(button.props('projects')).toEqual(values)
  })

  it('should pass a bare string through unchanged', () => {
    const wrapper = mountList('banana-papers')
    expect(wrapper.findComponent({ name: 'ProjectsButton' }).props('projects')).toBe('banana-papers')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest --run tests/unit/specs/components/Display/DisplayProjectList.spec.js`
Expected: FAIL, because `DisplayProjectList` still renders `ProjectLink` elements and no `ProjectsButton`

- [ ] **Step 3: Rewrite `DisplayProjectList`**

Replace the whole of `src/components/Display/DisplayProjectList.vue`:

```vue
<script setup>
import ProjectsButton from '@/components/Project/ProjectsButton'

defineOptions({ name: 'DisplayProjectList' })

defineProps({
  values: {
    type: [Array, String],
    default: () => []
  }
})
</script>

<template>
  <projects-button :projects="values" />
</template>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest --run tests/unit/specs/components/Display/DisplayProjectList.spec.js`
Expected: PASS

- [ ] **Step 5: Replace the inline list in the batch search card**

In `src/components/BatchSearch/BatchSeachCard/BatchSearchCardDetails.vue`, replace the block at lines 250-256:

```vue
          <div class="d-flex flex-wrap gap-2">
            <project-button
              v-for="(project, index) in projects"
              :key="index"
              :project="project"
            />
          </div>
```

with:

```vue
          <projects-button :projects="projects" />
```

Then update the imports in that file's `<script setup>`: remove the now-unused `ProjectButton` import and add `import ProjectsButton from '@/components/Project/ProjectsButton'`. Check first whether `ProjectButton` is used elsewhere in the file before removing its import.

- [ ] **Step 6: Run the specs for every touched consumer**

Run:

```bash
yarn vitest --run \
  tests/unit/specs/components/Display/DisplayProjectList.spec.js \
  tests/unit/specs/components/Project/ProjectsButton.spec.js \
  tests/unit/specs/components/BatchSearch \
  tests/unit/specs/views/Task \
  tests/unit/specs/components/Settings
```

Expected: PASS. Any failure here is a real regression from the swap, since these suites previously saw a flat list of links and now see a single button.

- [ ] **Step 7: Run the full suite**

Run: `yarn vitest --run`
Expected: PASS. Report any pre-existing failures separately from ones this change introduced.

- [ ] **Step 8: Check the real application**

Run `yarn serve` and confirm the popover appears on the taskboard, the batch search list, the batch downloads list, and a batch search card.

- [ ] **Step 9: Lint and commit**

```bash
yarn lint src/components/Display/DisplayProjectList.vue src/components/BatchSearch/BatchSeachCard/BatchSearchCardDetails.vue tests/unit/specs/components/Display/DisplayProjectList.spec.js
git add src/components/Display/DisplayProjectList.vue src/components/BatchSearch/BatchSeachCard/BatchSearchCardDetails.vue tests/unit/specs/components/Display/DisplayProjectList.spec.js
git commit -m "feat(project): show projects in a popover across tables and batch search cards icij/datashare#2323"
```

---

## Suggested follow-ups

Not in this plan's scope:

- Extract the shared project resolver duplicated between `ProjectLabel.vue:38-44` and `ProjectsButton.vue`.
- Consolidate the overlapping-thumbnail group with `ProjectDropdownSelectorButtonContent.vue:69-99`, which implements the same visual with an extra `+` badge.
- Translate `projectsButton.projectsCount` into the non-English locales.
- Decide whether `eng.traineddata`, which the test suite writes into the repo root untracked, belongs in `.gitignore`.
