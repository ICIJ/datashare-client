# Projects popover

Implements [icij/datashare#2323](https://github.com/ICIJ/datashare/issues/2323),
following the design in [icij/datashare#2320](https://github.com/ICIJ/datashare/issues/2320).

## Goal

When a row or a card references more than one project, replace the inline list of
project buttons with a single anchor button. Clicking it opens a scrollable popover
listing every project.

A second, independent requirement ships in the same change: every popover in the
application opens on click and closes on click outside. Hover and focus no longer
open or close a popover.

## Part 1: click-only popovers

### Current behavior

`bootstrap-vue-next` 0.42 computes a popover's triggers from three optional props.
When none is set, it falls back to hover and focus:

```js
// node_modules/bootstrap-vue-next/dist/floatingUi-DAKhZxeT.mjs:2180-2187
if (props.hover !== void 0 || props.focus !== void 0 || props.click !== void 0) {
  return { hover: props.hover ?? false, focus: props.focus ?? false, click: props.click ?? false }
}
return { hover: true, focus: true, click: false }
```

Click-outside dismissal is wired only when the click trigger is active:

```js
// node_modules/bootstrap-vue-next/dist/floatingUi-DAKhZxeT.mjs:2238-2239
if (showRef.value && computedTriggers.value.click && !props.noAutoClose && !props.manual)
  hide$12('click-outside')
```

Both halves of the requirement therefore come from the single `click` flag.

Three components currently rely on the hover default:

| Component | Anchor |
|---|---|
| `src/components/AppPopover/AppPopover.vue:30` | base for `DocumentSharePopover` and `DocumentDownloadPopover`, both anchored on buttons |
| `src/components/Entity/EntityPopover/EntityPopover.vue:52` | entity mentions inside document text |
| `src/components/Display/DisplayEmail.vue:52` | an email string in a table cell |

`KeyboardShortcutsPopover` (via `AppSidebarFooterKeyboardShortcutsPopover.vue:18`) and
`I18nLocaleDropdown.vue:37` already pass `click` explicitly and need no change.

### Change

Set the trigger once, as a global component default:

```js
// src/core/Core.js:146
this._bootstrapVue = createBootstrap({ components: { BPopover: { click: true } }, directives: true })
```

This works because `createBootstrap` provides its `components` option verbatim as the
defaults registry, and `BPopover` reads that registry:

```js
// node_modules/bootstrap-vue-next/dist/src/plugins/createBootstrap/index.mjs
const val = pluginData?.components ?? {}
app.provide(defaultsKey, ref(val))
```

```js
// node_modules/bootstrap-vue-next/dist/floatingUi-DAKhZxeT.mjs:1968
const props = useDefaults(_props, 'BPopover')
```

The option is currently `components: true`, which provides `ref(true)` as the defaults
object and has no effect. Replacing it with a real object is a strict improvement.

`BTooltip` is a separate defaults key, so tooltips keep their hover behavior.

### Consequences

Two user-visible behavior changes ship with this, deliberately:

- Entity mentions in the document text no longer reveal their popover on hover.
  Readers must click the mention.
- Email cells in tables no longer reveal contact details on hover.

### Verification constraints

Both points below were established empirically with a throwaway probe spec during
planning, not assumed.

**The defaults mechanism works.** Setting `createBootstrap({ components: { BPopover: { id: 'FROM_DEFAULTS' } } })`
and mounting `AppPopover` through `CoreSetup.init().useAll()` produced a popover element
carrying `id="FROM_DEFAULTS"`. `CoreSetup` extends `Core` and its `plugins` getter
includes `this.bootstrapVue` (`tests/unit/CoreSetup.js:11-20`), so any spec built on
`CoreSetup` inherits the global default. No existing spec needs a mount change.

**The behavior itself is not observable in jsdom.** The popover's content is rendered
into the DOM at all times with `display: none` toggled on the `.popover` wrapper, and
under jsdom that wrapper stayed `display: none` through `mouseenter`, `mouseleave`, and
`click`, in both the patched and unpatched builds. No `update:modelValue` was ever
emitted. Presence-based and `v-model`-based assertions are therefore both insensitive:
they pass or fail for reasons unrelated to the trigger configuration.

This is consistent with the existing `DocumentDownloadPopover.spec.js:39-41`, which
stubs `AppPopover` with a plain `<div>` rather than driving the real popover.

Consequence for this change: the click-only behavior is verified by a unit test on the
**configuration** (the defaults registry contains `BPopover.click === true`) plus
**manual browser verification** of the actual open/close interaction. Writing a jsdom
test that claims to prove the interaction would be writing a test that cannot fail.

## Part 2: `ProjectsButton`

### Component

New file: `src/components/Project/ProjectsButton.vue`.

Props:

- `projects`: an `Array | String` of the projects to display. A bare string is normalised to
  a single-element array, matching `DisplayProjectList.vue:13`.

Rendering rules:

- **0 or 1 project.** Render the existing `ProjectButton` directly. No popover, no
  anchor. Issue #2320's body says the popover appears when the count "exceeds 2", but
  the later scoping comment on the same issue says "There is a popover only when there
  are more than 1 project. If there is one project, Datashare displays existing
  ProjectButton". The comment is authoritative.
- **2 or more projects.** Render an anchor button wrapping an `AppPopover`.

### Anchor button

Styled as a `ProjectButton` (same `variant="outline-secondary"`, same CSS custom
properties) but not a link. Content:

1. The first two project thumbnails, overlapped.
2. The label `{n} projects`, pluralised.

The overlap reuses the pattern already established in
`ProjectDropdownSelectorButtonContent.vue:77-80`:

```scss
&:not(:first-of-type) &__thumbnail {
  box-shadow: -1px 0 0 0 #fff;
  margin-left: -1em;
}
```

That component is not reused as-is: when the project count exceeds its slice size it
turns the last thumbnail into a grey `+` badge (`:82-97`), which the Figma frame for
this feature does not show. Only the overlap declarations are borrowed. Consolidating
the two into one shared thumbnail-group component is a follow-up, not in scope.

The thumbnail count is fixed at two regardless of project count, so the button keeps a
constant width across table rows.

### Popover

Built on `AppPopover`, which now inherits the click-only trigger from Part 1.

- **Title.** The same pluralised `{n} projects` string, passed via `AppPopover`'s
  `title` prop.
- **Close button.** Suppressed. `AppPopoverHeader.vue:38-48` renders a default close
  button in its `#close` slot; the Figma frame shows no close control, so
  `ProjectsButton` passes an empty `#close` slot.
- **Body.** A `d-flex flex-wrap gap-2` of `ProjectButton`s, one per project, each linking
  to `project.view.overview.insights`. The pink hover border the design calls for already
  exists on `ProjectButton.vue:65`
  (`--bs-btn-hover-border-color: var(--bs-primary)`), so no new hover styling is needed.
- **Size.** `--bs-popover-max-width` sized to fit three columns of project buttons, with
  a `max-height` and `overflow-y: auto` on the body so long lists scroll vertically.
  Below the `sm` breakpoint the body collapses to a single column, matching the
  responsive frame.

### Accessibility

The anchor is a real `<button>`, so Enter and Space activate it and screen readers
announce it. `aria-expanded` reflects the popover's visibility.

Escape-to-close must be verified against `bootstrap-vue-next`'s click trigger and added
explicitly if the library does not already handle it.

### Wiring

`DisplayProjectList.vue` becomes a thin wrapper that renders `ProjectsButton`. Its six
call sites therefore need no changes:

- `src/views/Task/TaskBoard/TaskBoardLatest.vue:182`
- `src/views/Task/TaskBatchSearch/TaskBatchSearchList.vue:118`
- `src/views/Task/TaskBatchDownload/TaskBatchDownloadList.vue:99`
- `src/views/Task/TaskDocuments/TaskDocumentsList.vue:96`
- `src/views/Task/TaskEntities/TaskEntitiesList.vue:103`
- `src/components/Settings/SettingsSnapshots/SettingsSnapshotsList.vue:111`

`BatchSearchCardDetails.vue:251` replaces its inline `v-for` over `ProjectButton` with a
single `ProjectsButton`.

### Internationalisation

One new pluralised key in `src/lang/en.json`, following the existing convention at
`searchBarInputDropdownForProjects.projectsCount`:

```json
"projectsButton": {
  "projectsCount": "no projects | 1 project | {count} projects"
}
```

Called as `t('projectsButton.projectsCount', projects.length)`, as at
`ProjectDropdownSelectorButtonContent.vue:62`. Only `en.json` needs the key:
`Core.useI18n()` sets `fallbackLocale` to the default locale (`Core.js:130-131`), so the
other locales fall back to English until translated.

## Testing

`tests/unit/specs/components/Project/ProjectsButton.spec.js`:

- one project renders a `ProjectButton` and no popover
- two or more projects render the anchor button with the pluralised count
- the anchor shows exactly two thumbnails, whatever the project count
- the popover lists one `ProjectButton` per project, each linking to the project's
  insights route

Popover open/close is not asserted here. Per the verification constraints above, the
popover does not toggle under jsdom, so the spec stubs `AppPopover` the way
`DocumentDownloadPopover.spec.js` does and asserts the rendered content only.

A spec on `Core.useBootstrapVue()` asserting the defaults registry it builds contains
`BPopover.click === true`.

Manual browser verification, recorded in the pull request:

- clicking the anchor opens the popover, hovering it does not
- clicking outside closes the popover
- the same for the document share and download popovers, entity mentions, and email
  cells
- Escape closes the popover, or an explicit handler is added if it does not

A Storybook story alongside `src/stories/components/Project/ProjectButton.stories.js`,
with cases for one, two, and twelve projects.

## Out of scope

- Consolidating `ProjectsButton`'s thumbnail group with
  `ProjectDropdownSelectorButtonContent`.
- Any change to `BTooltip` behavior.
- Translating the new i18n key into locales other than English.
