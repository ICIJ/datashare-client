# Batch Search Edit Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a page to edit an existing batch search where visibility (Private/Shared) is editable in place, while title and description are shown disabled until the backend supports editing them.

**Architecture:** Reuse the creation form's general-details component (`TaskBatchSearchFormDetails`) by adding default-off props that disable individual fields. A new lean edit form (`TaskBatchSearchFormEdit`) loads the batch via `getBatchSearch`, renders the details step read-only except visibility, and saves through a new task-store wrapper around the existing `PATCH` API. A new view and route host it, and the existing (currently hidden, stubbed) Edit action is wired to navigate there.

**Tech Stack:** Vue 3 `<script setup>`, Pinia, Vue Router 4, BootstrapVue-style form components, vue-i18n, Vitest + @vue/test-utils.

**Reference spec:** `docs/superpowers/specs/2026-06-09-batch-search-edit-page-design.md`

**Note on commits:** `docs/superpowers/` is gitignored, so the plan/spec files are not committed. All source/test files in the tasks below ARE committed normally.

---

## File Structure

- **Modify** `src/lang/en.json`, `src/lang/de.json`, `src/lang/ja.json`, `src/lang/zh.json` — add `task.batch-search.edit.title`, `task.batch-search.form.editSuccess`, `task.batch-search.form.editError`.
- **Modify** `src/store/modules/task.js` — add + export `updateBatchSearch(id, published)`.
- **Modify** `src/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails.vue` — add `disabledName`, `disabledDescription`, `disabledProjects`, `hideVisibilityHint` props.
- **Create** `src/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.vue` — the edit form.
- **Create** `src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue` — the page/view.
- **Modify** `src/router/index.js` — add `task.batch-search.edit` route.
- **Modify** `src/components/BatchSearch/BatchSearchActions/BatchSearchActions.vue` — un-hide Edit button, navigate to edit page, remove dead modal code.
- **Delete** `src/components/BatchSearch/BatchSearchActions/BatchSearchActionsEditModal.vue`.
- **Create** `tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails.spec.js`.
- **Create** `tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.spec.js`.
- **Modify** `tests/unit/specs/components/BatchSearch/BatchSearchActions.spec.js` — revive/extend edit-button tests.

---

## Task 1: Add i18n keys

**Files:**
- Modify: `src/lang/en.json`
- Modify: `src/lang/de.json`
- Modify: `src/lang/ja.json`
- Modify: `src/lang/zh.json`

No automated test (translation JSON). A lint/build step validates JSON.

- [ ] **Step 1: Add the edit title and toast keys to `en.json`**

In `src/lang/en.json`, inside the `task.batch-search` block, the `form` object currently ends with (around lines 1209-1211):

```json
        "submit": "Create",
        "submitError": "Something went wrong, unable to run the batch search.",
        "submitSuccess": "Batch search created successfully."
      },
      "new": {
        "title": "Create new batch search"
      }
```

Change it to add the two `edit*` toast keys and an `edit` sibling of `new`:

```json
        "submit": "Create",
        "submitError": "Something went wrong, unable to run the batch search.",
        "submitSuccess": "Batch search created successfully.",
        "editError": "Something went wrong, unable to update the batch search.",
        "editSuccess": "Batch search updated successfully."
      },
      "new": {
        "title": "Create new batch search"
      },
      "edit": {
        "title": "Edit batch search"
      }
```

- [ ] **Step 2: Mirror the same three keys in `de.json`, `ja.json`, `zh.json`**

For each of `src/lang/de.json`, `src/lang/ja.json`, `src/lang/zh.json`, find the same `task.batch-search.form` block (the one containing `submitSuccess` for the batch search) and the adjacent `new.title`, and add the identical keys. Use English text as the placeholder value (these locales already contain English fallbacks elsewhere — match that convention):

```json
        "editError": "Something went wrong, unable to update the batch search.",
        "editSuccess": "Batch search updated successfully."
```

and the `edit` block after `new`:

```json
      "edit": {
        "title": "Edit batch search"
      }
```

- [ ] **Step 3: Verify JSON is valid**

Run: `node -e "['en','de','ja','zh'].forEach(l=>JSON.parse(require('fs').readFileSync('src/lang/'+l+'.json','utf8')))" && echo OK`
Expected: prints `OK` with no parse error.

- [ ] **Step 4: Commit**

```bash
git add src/lang/en.json src/lang/de.json src/lang/ja.json src/lang/zh.json
git commit -m "i18n: add batch search edit title and update toasts"
```

---

## Task 2: Add `updateBatchSearch` store wrapper

**Files:**
- Modify: `src/store/modules/task.js`
- Test: `tests/unit/specs/store/modules/task.spec.js`

The API method `updateBatchSearch(batchId, published)` already exists in `src/api/index.js` (no change needed). We add a store wrapper mirroring `relaunchBatchSearch`.

- [ ] **Step 1: Write the failing test**

In `tests/unit/specs/store/modules/task.spec.js`, first ensure the apiInstance mock exposes `updateBatchSearch`. Find the `vi.mock('@/api/apiInstance', ...)` block and add `updateBatchSearch: vi.fn()` alongside the other mocked methods. Then add this test inside the top-level `describe`:

```js
it('should delegate updateBatchSearch to the api', async () => {
  const store = useTaskStore()
  await store.updateBatchSearch('uuid-1', true)
  expect(api.updateBatchSearch).toHaveBeenCalledWith('uuid-1', true)
})
```

If the spec file does not already import the api mock as `api`, add at the top:

```js
import { apiInstance as api } from '@/api/apiInstance'
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/store/modules/task.spec.js -t "updateBatchSearch"`
Expected: FAIL — `store.updateBatchSearch is not a function`.

- [ ] **Step 3: Add the store wrapper**

In `src/store/modules/task.js`, after the `relaunchBatchSearch` definition (around line 36):

```js
  const updateBatchSearch = async (id, published) => {
    await api.updateBatchSearch(id, published)
  }
```

Then add `updateBatchSearch` to the returned object (in the `return { ... }` block near line 136, next to `relaunchBatchSearch`):

```js
    relaunchBatchSearch,
    updateBatchSearch,
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/store/modules/task.spec.js -t "updateBatchSearch"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/modules/task.js tests/unit/specs/store/modules/task.spec.js
git commit -m "feat(store): add updateBatchSearch wrapper for batch search visibility"
```

---

## Task 3: Add disable/hint props to `TaskBatchSearchFormDetails`

**Files:**
- Modify: `src/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails.vue`
- Test: `tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails.spec.js` (create)

All four props default to `false`/`undefined`, so the creation form is unaffected.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails.spec.js`:

```js
import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchFormDetails from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails'

describe('TaskBatchSearchFormDetails', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    core.config.set('projects', [{ name: 'local-datashare' }])
  })

  function mountWith(props = {}) {
    return shallowMount(TaskBatchSearchFormDetails, {
      global: { plugins },
      props: {
        name: 'My batch',
        description: 'desc',
        visibility: false,
        selectedProjects: [{ name: 'local-datashare' }],
        ...props
      }
    })
  }

  it('leaves all fields enabled by default', () => {
    const wrapper = mountWith()
    expect(wrapper.find('b-form-input-stub').attributes('disabled')).toBeFalsy()
    expect(wrapper.find('b-form-textarea-stub').attributes('disabled')).toBeFalsy()
    expect(wrapper.find('project-dropdown-selector-stub').attributes('disabled')).toBeFalsy()
  })

  it('disables the name input when disabledName is true', () => {
    const wrapper = mountWith({ disabledName: true })
    expect(wrapper.find('b-form-input-stub').attributes('disabled')).toBe('true')
  })

  it('disables the description textarea when disabledDescription is true', () => {
    const wrapper = mountWith({ disabledDescription: true })
    expect(wrapper.find('b-form-textarea-stub').attributes('disabled')).toBe('true')
  })

  it('disables the projects selector when disabledProjects is true', () => {
    const wrapper = mountWith({ disabledProjects: true })
    expect(wrapper.find('project-dropdown-selector-stub').attributes('disabled')).toBe('true')
  })

  it('suppresses the visibility hint when hideVisibilityHint is true', () => {
    const wrapper = mountWith({ hideVisibilityHint: true })
    const visibilityFieldset = wrapper
      .findAll('form-fieldset-i18n-stub')
      .find(c => c.attributes('name') === 'visibility')
    expect(visibilityFieldset.attributes('description-key')).toBe('')
  })

  it('keeps the default visibility hint when hideVisibilityHint is false', () => {
    const wrapper = mountWith()
    const visibilityFieldset = wrapper
      .findAll('form-fieldset-i18n-stub')
      .find(c => c.attributes('name') === 'visibility')
    expect(visibilityFieldset.attributes('description-key')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails.spec.js`
Expected: FAIL — the disabled/`description-key` assertions fail because the props don't exist yet.

- [ ] **Step 3: Add the props and bind them**

In `src/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails.vue`, after the `defineModel` calls (after line 19), add:

```js
defineProps({
  disabledName: {
    type: Boolean,
    default: false
  },
  disabledDescription: {
    type: Boolean,
    default: false
  },
  disabledProjects: {
    type: Boolean,
    default: false
  },
  hideVisibilityHint: {
    type: Boolean,
    default: false
  }
})
```

Bind `:disabled` on the name input:

```html
      <b-form-input
        v-model="name"
        type="text"
        name="name"
        :disabled="disabledName"
        :placeholder="t('task.batch-search.form.name.placeholder')"
      />
```

Bind `:disabled` on the projects selector:

```html
      <project-dropdown-selector
        v-model="selectedProjects"
        :disabled="disabledProjects"
        :projects="allProjects"
      />
```

Bind `:disabled` on the description textarea:

```html
      <b-form-textarea
        v-model="description"
        name="description"
        :rows="2"
        :max-rows="8"
        :disabled="disabledDescription"
        :placeholder="t('task.batch-search.form.description.placeholder')"
      />
```

Add `:description-key` to the visibility `form-fieldset-i18n` (the one with `name="visibility"`):

```html
      <form-fieldset-i18n
        name="visibility"
        force-compact
        translation-key="task.batch-search.form.visibility"
        :description-key="hideVisibilityHint ? '' : undefined"
        label-class="pt-md-0"
        :icon="IPhQuotes"
      >
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails.spec.js`
Expected: PASS (all 6 tests).

- [ ] **Step 5: Confirm the creation form still mounts**

Run: `yarn test:unit tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchForm.spec.js`
Expected: PASS (no regression — new props default off).

- [ ] **Step 6: Commit**

```bash
git add src/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails.vue tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails.spec.js
git commit -m "feat(batch-search): add disable/hint props to form details fieldset"
```

---

## Task 4: Create `TaskBatchSearchFormEdit` component

**Files:**
- Create: `src/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.vue`
- Test: `tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.spec.js`

Loads the batch on mount, renders the details step read-only except visibility, saves visibility, toasts, and redirects to the results list.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.spec.js`:

```js
import { flushPromises, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchFormEdit from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getBatchSearch: vi.fn(),
    updateBatchSearch: vi.fn()
  }
}))

describe('TaskBatchSearchFormEdit', () => {
  let plugins

  beforeEach(() => {
    vi.clearAllMocks()
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    core.config.set('projects', [{ name: 'local-datashare' }])
    api.getBatchSearch.mockResolvedValue({
      uuid: 'uuid-1',
      name: 'My batch',
      description: 'A description',
      published: true,
      projects: ['local-datashare']
    })
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  async function mountEdit() {
    const wrapper = shallowMount(TaskBatchSearchFormEdit, {
      global: { plugins },
      props: { indices: 'local-datashare', uuid: 'uuid-1' }
    })
    await flushPromises()
    return wrapper
  }

  it('fetches the batch search on mount and seeds visibility', async () => {
    const wrapper = await mountEdit()
    expect(api.getBatchSearch).toHaveBeenCalledWith('uuid-1')
    expect(wrapper.vm.$.setupState.visibility).toBe(true)
    expect(wrapper.vm.$.setupState.name).toBe('My batch')
  })

  it('saves visibility and shows a success toast on submit', async () => {
    api.updateBatchSearch.mockResolvedValue()
    const wrapper = await mountEdit()
    vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()
    vi.spyOn(wrapper.vm.$toast, 'success')
    vi.spyOn(wrapper.vm.$toast, 'error')

    await wrapper.find('form-creation-stub').trigger('submit')
    await flushPromises()

    expect(api.updateBatchSearch).toHaveBeenCalledWith('uuid-1', true)
    expect(wrapper.vm.$toast.success).toHaveBeenCalledOnce()
    expect(wrapper.vm.$toast.error).not.toHaveBeenCalled()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
      name: 'task.batch-search-results.list',
      params: { indices: 'local-datashare', uuid: 'uuid-1' }
    })
  })

  it('shows an error toast when the update fails', async () => {
    api.updateBatchSearch.mockRejectedValue(new Error('500'))
    const wrapper = await mountEdit()
    vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()
    vi.spyOn(wrapper.vm.$toast, 'success')
    vi.spyOn(wrapper.vm.$toast, 'error')

    await wrapper.find('form-creation-stub').trigger('submit')
    await flushPromises()

    expect(wrapper.vm.$toast.error).toHaveBeenCalledOnce()
    expect(wrapper.vm.$toast.success).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.spec.js`
Expected: FAIL — cannot resolve `TaskBatchSearchFormEdit` (file does not exist).

- [ ] **Step 3: Create the component**

Create `src/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.vue`:

```vue
<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import IPhFloppyDisk from '~icons/ph/floppy-disk'

import FormCreation from '@/components/Form/FormCreation'
import TaskBatchSearchFormDetails from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails'
import { useCore } from '@/composables/useCore'
import { useToast } from '@/composables/useToast'
import { useTaskStore } from '@/store/modules/task'

const { indices, uuid } = defineProps({
  indices: {
    type: String,
    required: true
  },
  uuid: {
    type: String,
    required: true
  }
})

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()
const router = useRouter()
const taskStore = useTaskStore()

const name = ref('')
const description = ref('')
const visibility = ref(false)
const selectedProjects = ref([])

async function load() {
  const batchSearch = await core.api.getBatchSearch(uuid)
  name.value = batchSearch.name ?? ''
  description.value = batchSearch.description ?? ''
  visibility.value = !!batchSearch.published
  selectedProjects.value = (batchSearch.projects ?? []).map(project => ({ name: project }))
}

onMounted(load)

function reset() {
  load()
}

async function submit() {
  try {
    await taskStore.updateBatchSearch(uuid, visibility.value)
    await router.push({ name: 'task.batch-search-results.list', params: { indices, uuid } })
    toast.success(t('task.batch-search.form.editSuccess'))
  }
  catch {
    toast.error(t('task.batch-search.form.editError'))
  }
}
</script>

<template>
  <form-creation
    class="task-batch-search-form-edit d-flex flex-column gap-4"
    content-class-list="d-flex flex-column gap-3"
    :submit-label="t('global.save')"
    :submit-icon="IPhFloppyDisk"
    @reset="reset"
    @submit="submit"
  >
    <task-batch-search-form-details
      v-model:name="name"
      v-model:description="description"
      v-model:visibility="visibility"
      v-model:selected-projects="selectedProjects"
      disabled-name
      disabled-description
      disabled-projects
      hide-visibility-hint
    />
  </form-creation>
</template>
```

Note: `FormCreation`'s `valid` prop defaults to `true`, so the Save button is always enabled — correct here since visibility always holds a boolean.

- [ ] **Step 4: Verify `global.save` exists; if not, use a literal label**

Run: `node -e "const e=require('./src/lang/en.json'); console.log(e.global && e.global.save)"`
Expected: prints a string (e.g. `Save`). If it prints `undefined`, change `:submit-label="t('global.save')"` to `:submit-label="t('task.batch-search.form.submit')"` is NOT appropriate (that says "Create"); instead add a `global.save` key (`"save": "Save"`) to all four locale files and commit it as part of this task.

- [ ] **Step 5: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.spec.js`
Expected: PASS (all 3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.vue tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.spec.js
git commit -m "feat(batch-search): add visibility-only edit form component"
```

---

## Task 5: Create `TaskBatchSearchEdit` view

**Files:**
- Create: `src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue`

Mirrors `TaskBatchSearchNew.vue`. No dedicated unit test (thin wrapper); it is exercised through the route in Task 6's manual verification and the form's own tests.

- [ ] **Step 1: Create the view**

Create `src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue`:

```vue
<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskBatchSearchFormEdit from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit'

defineProps({
  indices: {
    type: String,
    required: true
  },
  uuid: {
    type: String,
    required: true
  }
})
</script>

<template>
  <page-header no-toggle-settings />
  <page-container fluid>
    <task-batch-search-form-edit
      :indices="indices"
      :uuid="uuid"
    />
  </page-container>
</template>
```

- [ ] **Step 2: Verify the file parses (lint)**

Run: `yarn lint src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue`
Expected: no errors. (`lint` is bare `eslint`, so pass the file path as the pattern.)

- [ ] **Step 3: Commit**

```bash
git add src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue
git commit -m "feat(batch-search): add edit page view"
```

---

## Task 6: Add the edit route

**Files:**
- Modify: `src/router/index.js`

- [ ] **Step 1: Add the route**

In `src/router/index.js`, inside the `task.batch-search` route's `children` array, add the following entry immediately after the `task.batch-search.new` route (after its closing `}`, around line 259) and before the `:indices/:uuid` route:

```js
              {
                path: ':indices/:uuid/edit',
                name: 'task.batch-search.edit',
                props: true,
                component: () => import('@/views/Task/TaskBatchSearch/TaskBatchSearchEdit'),
                meta: {
                  title: 'task.batch-search.edit.title'
                }
              },
```

The static `edit` segment outranks the existing `:indices/:uuid/:query` dynamic route in Vue Router, so the order relative to that route does not cause a conflict; placing it after `new` keeps related routes grouped.

- [ ] **Step 2: Verify routes resolve in tests (no broken imports)**

Run: `yarn test:unit tests/unit/specs/components/BatchSearch/BatchSearchActions.spec.js`
Expected: PASS (route table still builds; this spec uses the router).

- [ ] **Step 3: Commit**

```bash
git add src/router/index.js
git commit -m "feat(batch-search): add edit page route"
```

---

## Task 7: Wire entry point and remove the dead modal

**Files:**
- Modify: `src/components/BatchSearch/BatchSearchActions/BatchSearchActions.vue`
- Delete: `src/components/BatchSearch/BatchSearchActions/BatchSearchActionsEditModal.vue`
- Test: `tests/unit/specs/components/BatchSearch/BatchSearchActions.spec.js`

- [ ] **Step 1: Update the failing/skipped test**

In `tests/unit/specs/components/BatchSearch/BatchSearchActions.spec.js`:

1. Ensure `BatchSearchActionsEdit` is imported (it already is).
2. In the `'with a successful task'` block, change the props to include projects:

```js
      const props = { batchSearch: { uuid: '12', projects: ['local-datashare'] } }
```

3. Replace the existing `it.skip('should display a button to edit the batchSearch' ...)` with:

```js
    it('should display a button to edit the batchSearch', () => {
      expect(wrapper.findComponent(BatchSearchActionsEdit).exists()).toBe(true)
    })

    it('navigates to the edit page when the edit button is clicked', async () => {
      const push = vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()
      await wrapper.findComponent(BatchSearchActionsEdit).vm.$emit('click')
      expect(push).toHaveBeenCalledWith({
        name: 'task.batch-search.edit',
        params: { indices: 'local-datashare', uuid: '12' }
      })
    })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/BatchSearch/BatchSearchActions.spec.js`
Expected: FAIL — the edit button is hidden (`v-if="false"`) so it doesn't exist, and there is no navigation handler.

- [ ] **Step 3: Update `BatchSearchActions.vue`**

In `src/components/BatchSearch/BatchSearchActions/BatchSearchActions.vue`:

Remove the modal import (delete this line):

```js
import BatchSearchActionsEditModal from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsEditModal'
```

Add `useRouter` to the `vue-router` import region — add near the top with the other imports:

```js
import { useRouter } from 'vue-router'
```

Remove the edit-modal prompt wiring (delete this line):

```js
const { prompt: showEditModal } = usePromptModal(BatchSearchActionsEditModal)
```

Add a router instance near the other composable setup (after `const { t } = useI18n()`):

```js
const router = useRouter()
```

Delete the stubbed `edit()` and `editPromptModal()` functions entirely:

```js
async function edit() {
  console.log('Not implemented yet')
}
```
```js
async function editPromptModal() {
  const { name, description } = batchSearch
  const values = await showEditModal({ name, description })
  // Only a valid submit returns value. Cancel or modal hide returns null.
  if (values) {
    await edit(values)
  }
}
```

Add a navigation handler in their place:

```js
function goToEdit() {
  const indices = (batchSearch.projects ?? []).join(',')
  router.push({ name: 'task.batch-search.edit', params: { indices, uuid: batchSearch.uuid } })
}
```

In the template, change the edit button — remove `v-if="false"` and point the click handler at `goToEdit`:

```html
    <batch-search-actions-edit
      :hide-label="hideLabels"
      :square="hideLabels"
      @click="goToEdit()"
    />
```

- [ ] **Step 4: Delete the dead modal component**

```bash
git rm src/components/BatchSearch/BatchSearchActions/BatchSearchActionsEditModal.vue
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/BatchSearch/BatchSearchActions.spec.js`
Expected: PASS (edit button exists and navigation is called).

- [ ] **Step 6: Verify no lingering references to the deleted modal**

Run: `grep -rn "BatchSearchActionsEditModal" src/ tests/`
Expected: no output (no remaining references).

- [ ] **Step 7: Commit**

```bash
git add src/components/BatchSearch/BatchSearchActions/BatchSearchActions.vue tests/unit/specs/components/BatchSearch/BatchSearchActions.spec.js
git commit -m "feat(batch-search): enable edit action to open edit page; remove stubbed modal"
```

---

## Task 8: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full batch-search-related test suite**

Run:
```bash
yarn test:unit \
  tests/unit/specs/store/modules/task.spec.js \
  tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails.spec.js \
  tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.spec.js \
  tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchForm.spec.js \
  tests/unit/specs/components/BatchSearch/BatchSearchActions.spec.js
```
Expected: all suites PASS.

- [ ] **Step 2: Lint the changed files**

Run: `yarn lint src tests`
Expected: no new lint errors.

- [ ] **Step 3: Manual smoke test (optional but recommended)**

Start the dev server (`yarn serve` or the project's documented command), open a batch search list, click the Edit action on a batch search, confirm:
- The edit page loads with name/description/projects **disabled** and pre-filled.
- The "This option can be changed later (either way)" hint is **absent**.
- Visibility radios are editable.
- Saving shows the success toast and redirects to the batch search results page.

---

## Self-Review Notes

- **Spec coverage:** API/store (Task 2), routing (Task 6), entry point + modal removal (Task 7), four disable/hint props (Task 3), edit form + view (Tasks 4–5), i18n (Task 1), tests for all three touched/new pieces (Tasks 2,3,4,7), plus the visibility-hint suppression requirement (Task 3, dedicated tests). All covered.
- **Backend constraint honored:** only `published` is sent (`updateBatchSearch(uuid, visibility)`); name/description are disabled, not submitted.
- **Type/name consistency:** store method `updateBatchSearch(id, published)` used consistently in store, form, and tests; route name `task.batch-search.edit` consistent across router, view import, and actions navigation; props `disabledName`/`disabledDescription`/`disabledProjects`/`hideVisibilityHint` consistent between component and form usage (kebab-case in template).
- **Future work:** when the backend persists name/description, drop `disabled-name`/`disabled-description` on the edit form and extend `api.updateBatchSearch` + the store wrapper + submit call to include them.
