# Datashare Client API

This documentation is intended to help you create plugins for Datashare client.
All methods currently exposed in the [Core](#Core) class are available to a
global variable called `datashare`.

**Example**
```js
datashare.replaceWidget('default-text', {
  card: true,
  cols: 6,
  type: 'WidgetText',
  content: "Welcome to my amazing project dashboard!",
  title: "Secret Project",
  order: "-1"
})
```

## Classes

<dl>
<dt><a href="#Core">Core</a></dt>
<dd><p>Class representing the core application with public methods for plugins.</p>
</dd>
</dl>

## Mixins

<dl>
<dt><a href="#FiltersMixin">FiltersMixin</a></dt>
<dd><p>Mixin class extending the core to add helpers for filters.</p>
</dd>
<dt><a href="#HooksMixin">HooksMixin</a></dt>
<dd><p>Mixin class extending the core to add helpers for hooks.</p>
</dd>
<dt><a href="#PipelinesMixin">PipelinesMixin</a></dt>
<dd><p>Mixin class extending the core to add helpers for pipelines.</p>
</dd>
<dt><a href="#ProjectsMixin">ProjectsMixin</a></dt>
<dd><p>Mixin class extending the core to add helpers for projects.</p>
</dd>
<dt><a href="#WidgetsMixin">WidgetsMixin</a></dt>
<dd><p>Mixin class extending the core to add helpers for widgets.</p>
</dd>
</dl>

<a name="Core"></a>

## Core
Class representing the core application with public methods for plugins.

**Kind**: global class  
**Mixes**: [<code>FiltersMixin</code>](#FiltersMixin), [<code>HooksMixin</code>](#HooksMixin), [<code>PipelinesMixin</code>](#PipelinesMixin), [<code>ProjectsMixin</code>](#ProjectsMixin), [<code>WidgetsMixin</code>](#WidgetsMixin)  

* [Core](#Core)
    * [new Core(LocalVue)](#new_Core_new)
    * _instance_
        * [.ready](#Core+ready) : <code>Promise.&lt;Object&gt;</code>
        * ~~[.app](#Core+app) : [<code>Core</code>](#Core)~~
        * [.core](#Core+core) : [<code>Core</code>](#Core)
        * [.localVue](#Core+localVue) : <code>Vue</code>
        * [.store](#Core+store) : <code>Vuex.Store</code>
        * [.auth](#Core+auth) : <code>Auth</code>
        * [.config](#Core+config) : <code>Object</code>
        * [.api](#Core+api) : <code>Api</code>
        * [.use(Plugin, options)](#Core+use) ⇒ [<code>Core</code>](#Core)
        * [.useAll()](#Core+useAll) ⇒ [<code>Core</code>](#Core)
        * [.useI18n()](#Core+useI18n) ⇒ [<code>Core</code>](#Core)
        * [.useBootstrapVue()](#Core+useBootstrapVue) ⇒ [<code>Core</code>](#Core)
        * [.useRouter()](#Core+useRouter) ⇒ [<code>Core</code>](#Core)
        * [.useCommons()](#Core+useCommons) ⇒ [<code>Core</code>](#Core)
        * [.useWait()](#Core+useWait) ⇒ [<code>Core</code>](#Core)
        * [.useCore()](#Core+useCore) ⇒ [<code>Core</code>](#Core)
        * [.configure()](#Core+configure) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.mount([selector])](#Core+mount) ⇒ <code>Vue</code>
        * [.defer()](#Core+defer)
        * [.dispatch(name, ...args)](#Core+dispatch) ⇒ [<code>Core</code>](#Core)
        * [.getUser()](#Core+getUser) : <code>Promise.&lt;Object&gt;</code>
    * _static_
        * [.init(...options)](#Core.init) ⇒ [<code>Core</code>](#Core)

<a name="new_Core_new"></a>

### new Core(LocalVue)
Create an application


| Param | Type | Description |
| --- | --- | --- |
| LocalVue | <code>Object</code> | The Vue class to instantiate the application with. |

<a name="Core+ready"></a>

### datashare.ready : <code>Promise.&lt;Object&gt;</code>
Get a promise that is resolved when the application is ready

**Kind**: instance property of [<code>Core</code>](#Core)  
**Fullfil**: <code>Object</code> The actual application core instance.  
<a name="Core+app"></a>

### ~~datashare.app : [<code>Core</code>](#Core)~~
***Deprecated***

The application core instance. Deprecated in favor or the `app` property.

**Kind**: instance property of [<code>Core</code>](#Core)  
<a name="Core+core"></a>

### datashare.core : [<code>Core</code>](#Core)
The application core instance

**Kind**: instance property of [<code>Core</code>](#Core)  
<a name="Core+localVue"></a>

### datashare.localVue : <code>Vue</code>
The Vue class to instantiate the application with

**Kind**: instance property of [<code>Core</code>](#Core)  
<a name="Core+store"></a>

### datashare.store : <code>Vuex.Store</code>
The Vuex instance

**Kind**: instance property of [<code>Core</code>](#Core)  
<a name="Core+auth"></a>

### datashare.auth : <code>Auth</code>
The Auth module instance

**Kind**: instance property of [<code>Core</code>](#Core)  
<a name="Core+config"></a>

### datashare.config : <code>Object</code>
The configuration object provided by Murmur

**Kind**: instance property of [<code>Core</code>](#Core)  
<a name="Core+api"></a>

### datashare.api : <code>Api</code>
The Datashare api interface

**Kind**: instance property of [<code>Core</code>](#Core)  
<a name="Core+use"></a>

### datashare.use(Plugin, options) ⇒ [<code>Core</code>](#Core)
Add a Vue plugin to the instance's LocalVue

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: [<code>Core</code>](#Core) - the current instance of Core  

| Param | Type | Description |
| --- | --- | --- |
| Plugin | <code>Object</code> | The actual Vue plugin class |
| options | <code>Object</code> | Option to pass to the plugin |

<a name="Core+useAll"></a>

### datashare.useAll() ⇒ [<code>Core</code>](#Core)
Configure all default Vue plugins for this application

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: [<code>Core</code>](#Core) - the current instance of Core  
<a name="Core+useI18n"></a>

### datashare.useI18n() ⇒ [<code>Core</code>](#Core)
Configure vue-i18n plugin

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: [<code>Core</code>](#Core) - the current instance of Core  
<a name="Core+useBootstrapVue"></a>

### datashare.useBootstrapVue() ⇒ [<code>Core</code>](#Core)
Configure bootstrap-vue plugin

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: [<code>Core</code>](#Core) - the current instance of Core  
<a name="Core+useRouter"></a>

### datashare.useRouter() ⇒ [<code>Core</code>](#Core)
Configure vue-router plugin

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: [<code>Core</code>](#Core) - the current instance of Core  
<a name="Core+useCommons"></a>

### datashare.useCommons() ⇒ [<code>Core</code>](#Core)
Configure most common Vue plugins (Murmur, VueProgressBar, VueShortkey, VueScrollTo and VueCalendar)

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: [<code>Core</code>](#Core) - the current instance of Core  
<a name="Core+useWait"></a>

### datashare.useWait() ⇒ [<code>Core</code>](#Core)
Configure vue-wait plugin

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: [<code>Core</code>](#Core) - the current instance of Core  
<a name="Core+useCore"></a>

### datashare.useCore() ⇒ [<code>Core</code>](#Core)
Add a $core property to the instance's Vue

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: [<code>Core</code>](#Core) - the current instance of Core  
<a name="Core+configure"></a>

### datashare.configure() ⇒ <code>Promise.&lt;Object&gt;</code>
Load settings from the server and instantiate most the application configuration.

**Kind**: instance method of [<code>Core</code>](#Core)  
**Fullfil**: [<code>Core</code>](#Core) - The instance of the core application  
**Reject**: <code>Object</code> - The Error object  
<a name="Core+mount"></a>

### datashare.mount([selector]) ⇒ <code>Vue</code>
Mount the instance's vue application

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: <code>Vue</code> - The instantiated Vue  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [selector] | <code>String</code> | <code>#app</code> | Query selector to the mounting point |

<a name="Core+defer"></a>

### datashare.defer()
Build a promise to be resolved when the application is configured.

**Kind**: instance method of [<code>Core</code>](#Core)  
<a name="Core+dispatch"></a>

### datashare.dispatch(name, ...args) ⇒ [<code>Core</code>](#Core)
Dispatch an event from the document root, passing the core application through event message.

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: [<code>Core</code>](#Core) - the current instance of Core  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the event to fire |
| ...args | <code>Mixed</code> | Additional params to pass to the event |

<a name="Core+getUser"></a>

### datashare.getUser() : <code>Promise.&lt;Object&gt;</code>
Get the current signed user. If none, redirect to the login page.

**Kind**: instance method of [<code>Core</code>](#Core)  
**Fullfil**: <code>Object</code> Current user  
<a name="Core.init"></a>

### Core.init(...options) ⇒ [<code>Core</code>](#Core)
instantiate a Core class (useful for chaining usage or mapping)

**Kind**: static method of [<code>Core</code>](#Core)  

| Param | Type | Description |
| --- | --- | --- |
| ...options | <code>Mixed</code> | Options to pass to the Core constructor |

<a name="FiltersMixin"></a>

## FiltersMixin
Mixin class extending the core to add helpers for filters.

**Kind**: global mixin  

* [FiltersMixin](#FiltersMixin)
    * [.registerFilter(...args)](#FiltersMixin+registerFilter)
    * [.unregisterFilter(name)](#FiltersMixin+unregisterFilter)
    * [.registerFilterForProject(name, ...args)](#FiltersMixin+registerFilterForProject)
    * [.unregisterFilterForProject(name, name)](#FiltersMixin+unregisterFilterForProject)

<a name="FiltersMixin+registerFilter"></a>

### datashare.registerFilter(...args)
Register a filter

**Kind**: instance method of [<code>FiltersMixin</code>](#FiltersMixin)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>Mixed</code> | Filter's options. |
| args.name | <code>String</code> | Name of the filter |
| args.type | <code>String</code> | Type of the filter. |
| args.options | <code>Object</code> | Options to pass to the filter contructor |

<a name="FiltersMixin+unregisterFilter"></a>

### datashare.unregisterFilter(name)
Unregister a filter

**Kind**: instance method of [<code>FiltersMixin</code>](#FiltersMixin)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the filter to unregister |

<a name="FiltersMixin+registerFilterForProject"></a>

### datashare.registerFilterForProject(name, ...args)
Register a filter only for a specific project

**Kind**: instance method of [<code>FiltersMixin</code>](#FiltersMixin)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the project |
| ...args | <code>Mixed</code> | Filter's options. |
| args.name | <code>String</code> | Name of the filter |
| args.type | <code>String</code> | Type of the filter. |
| args.options | <code>Object</code> | Options to pass to the filter contructor |

<a name="FiltersMixin+unregisterFilterForProject"></a>

### datashare.unregisterFilterForProject(name, name)
Unregister a filter only for a specific project

**Kind**: instance method of [<code>FiltersMixin</code>](#FiltersMixin)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the project |
| name | <code>String</code> | Name of the filter |

<a name="HooksMixin"></a>

## HooksMixin
Mixin class extending the core to add helpers for hooks.

**Kind**: global mixin  

* [HooksMixin](#HooksMixin)
    * [.registerHook(...args)](#HooksMixin+registerHook)
    * [.unregisterHook(name)](#HooksMixin+unregisterHook)
    * [.resetHook(name)](#HooksMixin+resetHook)
    * [.resetHooks()](#HooksMixin+resetHooks)
    * [.registerHookForProject(project, options)](#HooksMixin+registerHookForProject)

<a name="HooksMixin+registerHook"></a>

### datashare.registerHook(...args)
Register a hook

**Kind**: instance method of [<code>HooksMixin</code>](#HooksMixin)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>Mixed</code> | Hook's options |
| args.name | <code>String</code> | Name of the hook |
| args.target | <code>String</code> | Target of the hook |
| args.order | <code>Number</code> | Priority of the hook |
| args.definition | <code>Object</code> | Options to pass to the hook contructor |

<a name="HooksMixin+unregisterHook"></a>

### datashare.unregisterHook(name)
Unregister a specific hook

**Kind**: instance method of [<code>HooksMixin</code>](#HooksMixin)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the hook |

<a name="HooksMixin+resetHook"></a>

### datashare.resetHook(name)
Unregister all hooks from a target

**Kind**: instance method of [<code>HooksMixin</code>](#HooksMixin)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the target |

<a name="HooksMixin+resetHooks"></a>

### datashare.resetHooks()
Unregister all hooks, on every targets

**Kind**: instance method of [<code>HooksMixin</code>](#HooksMixin)  
<a name="HooksMixin+registerHookForProject"></a>

### datashare.registerHookForProject(project, options)
Register a hook for a specific project

**Kind**: instance method of [<code>HooksMixin</code>](#HooksMixin)  

| Param | Type | Description |
| --- | --- | --- |
| project | <code>String</code> | Project to add this hook to |
| options | <code>Object</code> | Hook's options |
| options.name | <code>String</code> | Name of the hoo |
| options.target | <code>String</code> | Target of the hook |
| options.order | <code>Number</code> | Priority of the hook |
| options.definition | <code>Object</code> | Options to pass to the hook contructor |

<a name="PipelinesMixin"></a>

## PipelinesMixin
Mixin class extending the core to add helpers for pipelines.

**Kind**: global mixin  

* [PipelinesMixin](#PipelinesMixin)
    * [.registerPipeline(...args, category)](#PipelinesMixin+registerPipeline)
    * [.unregisterPipeline(name)](#PipelinesMixin+unregisterPipeline)
    * [.registerPipelineForProject(project, ...args, category)](#PipelinesMixin+registerPipelineForProject)
    * [.unregisterPipelineForProject(project, name)](#PipelinesMixin+unregisterPipelineForProject)

<a name="PipelinesMixin+registerPipeline"></a>

### datashare.registerPipeline(...args, category)
Register a pipeline

**Kind**: instance method of [<code>PipelinesMixin</code>](#PipelinesMixin)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>Mixed</code> | Pipeline's options. |
| args.name | <code>String</code> | Name of the pipeline |
| args.type | <code>String</code> \| <code>function</code> | Type of the pipeline. |
| category | <code>String</code> | The pipeline to target |

<a name="PipelinesMixin+unregisterPipeline"></a>

### datashare.unregisterPipeline(name)
Unregister a pipeline

**Kind**: instance method of [<code>PipelinesMixin</code>](#PipelinesMixin)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the pipeline |

<a name="PipelinesMixin+registerPipelineForProject"></a>

### datashare.registerPipelineForProject(project, ...args, category)
Register a pipeline for a specific project

**Kind**: instance method of [<code>PipelinesMixin</code>](#PipelinesMixin)  

| Param | Type | Description |
| --- | --- | --- |
| project | <code>String</code> | Name of the project |
| ...args | <code>Mixed</code> | Pipeline's options. |
| args.name | <code>String</code> | Name of the pipeline |
| args.type | <code>String</code> \| <code>function</code> | Type of the pipeline. |
| category | <code>String</code> | The pipeline to target |

<a name="PipelinesMixin+unregisterPipelineForProject"></a>

### datashare.unregisterPipelineForProject(project, name)
Unregister a pipeline for a specific project

**Kind**: instance method of [<code>PipelinesMixin</code>](#PipelinesMixin)  

| Param | Type | Description |
| --- | --- | --- |
| project | <code>String</code> | Name of the project |
| name | <code>String</code> | Name of the pipeline |

<a name="ProjectsMixin"></a>

## ProjectsMixin
Mixin class extending the core to add helpers for projects.

**Kind**: global mixin  

* [ProjectsMixin](#ProjectsMixin)
    * [.toggleForProject(name, withFn, withoutFn)](#ProjectsMixin+toggleForProject)
    * [.createDefaultProject()](#ProjectsMixin+createDefaultProject) ⇒ <code>Promise:Object</code>

<a name="ProjectsMixin+toggleForProject"></a>

### datashare.toggleForProject(name, withFn, withoutFn)
Call a function when a project is selected

**Kind**: instance method of [<code>ProjectsMixin</code>](#ProjectsMixin)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the project |
| withFn | <code>function</code> | Function to call when the project is selected |
| withoutFn | <code>function</code> | Function to call when the project is unselected |

<a name="ProjectsMixin+createDefaultProject"></a>

### datashare.createDefaultProject() ⇒ <code>Promise:Object</code>
Create a default project on Datashare using the API

**Kind**: instance method of [<code>ProjectsMixin</code>](#ProjectsMixin)  
**Returns**: <code>Promise:Object</code> - The HTTP response object  
<a name="WidgetsMixin"></a>

## WidgetsMixin
Mixin class extending the core to add helpers for widgets.

**Kind**: global mixin  

* [WidgetsMixin](#WidgetsMixin)
    * [.registerWidget(...args)](#WidgetsMixin+registerWidget)
    * [.unregisterWidget(name)](#WidgetsMixin+unregisterWidget)
    * [.clearWidgets()](#WidgetsMixin+clearWidgets)
    * [.registerWidgetForProject(project, options)](#WidgetsMixin+registerWidgetForProject)
    * [.replaceWidget(name, options)](#WidgetsMixin+replaceWidget)
    * [.replaceWidgetForProject(project, name, options)](#WidgetsMixin+replaceWidgetForProject)

<a name="WidgetsMixin+registerWidget"></a>

### datashare.registerWidget(...args)
Register a widget

**Kind**: instance method of [<code>WidgetsMixin</code>](#WidgetsMixin)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| ...args | <code>Mixed</code> |  | Widget's options passed to widget constructor |
| args.name | <code>String</code> |  | Name of the widget |
| args.card | <code>Boolean</code> |  | Either or not this widget should be a `card` component from Boostrap. |
| args.cols | <code>Number</code> |  | Number of columns to fill in the grid (from 1 to 12) |
| [args.type] | <code>String</code> | <code>WidgetEmpty</code> | Type of the widget |

<a name="WidgetsMixin+unregisterWidget"></a>

### datashare.unregisterWidget(name)
Unregister a widget

**Kind**: instance method of [<code>WidgetsMixin</code>](#WidgetsMixin)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the widget to unregister |

<a name="WidgetsMixin+clearWidgets"></a>

### datashare.clearWidgets()
Unregister all widgets

**Kind**: instance method of [<code>WidgetsMixin</code>](#WidgetsMixin)  
<a name="WidgetsMixin+registerWidgetForProject"></a>

### datashare.registerWidgetForProject(project, options)
Register a widget for a specific project

**Kind**: instance method of [<code>WidgetsMixin</code>](#WidgetsMixin)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| project | <code>String</code> |  | Name of the project to add this widget to |
| options | <code>Object</code> |  | Widget's options passed to widget constructor |
| options.name | <code>String</code> |  | Name of the widget |
| options.card | <code>Boolean</code> |  | Either or not this widget should be a `card` component from Boostrap |
| options.cols | <code>Number</code> |  | Number of columns to fill in the grid (from 1 to 12) |
| [options.type] | <code>String</code> | <code>WidgetEmpty</code> | Type of the widget |

<a name="WidgetsMixin+replaceWidget"></a>

### datashare.replaceWidget(name, options)
Replace an existing widget

**Kind**: instance method of [<code>WidgetsMixin</code>](#WidgetsMixin)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>String</code> |  | Name of the widget to replace |
| options | <code>Object</code> |  | Widget's options passed to widget constructor. |
| options.card | <code>Boolean</code> |  | Either or not this widget should be a `card` component from Boostrap |
| options.cols | <code>Number</code> |  | Number of columns to fill in the grid (from 1 to 12) |
| [options.type] | <code>String</code> | <code>WidgetEmpty</code> | Type of the widget |

**Example**  
```js
datashare.replaceWidget('default-text', {
 card: true,
 cols: 6,
 type: 'WidgetText',
 content: "Welcome to my amazing project dashboard!",
 title: "Secret Project",
 order: "-1"
})
```
<a name="WidgetsMixin+replaceWidgetForProject"></a>

### datashare.replaceWidgetForProject(project, name, options)
Replace an existing widget for a specific project

**Kind**: instance method of [<code>WidgetsMixin</code>](#WidgetsMixin)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| project | <code>String</code> |  | Name of the project to add this widget to |
| name | <code>String</code> |  | Name of the widget to replace |
| options | <code>Object</code> |  | Widget's options passed to widget constructor |
| options.card | <code>Boolean</code> |  | Either or not this widget should be a `card` component from Boostrap |
| options.cols | <code>Number</code> |  | Number of columns to fill in the grid (from 1 to 12) |
| [options.type] | <code>String</code> | <code>WidgetEmpty</code> | Type of the widget |

