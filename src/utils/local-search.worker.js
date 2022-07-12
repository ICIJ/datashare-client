import noop from 'lodash/noop'
import FakeWorker from './fake-worker.js'
import { addLocalSearchMarksClass } from './strings.js'

function searchAndReplace (content, localSearchTerm, callback = noop) {
  // We ensure the received data is well-formed before performing transformation
  if (content && localSearchTerm) {
    callback(addLocalSearchMarksClass(content, localSearchTerm))
  }
}

/**
 * This event listerner is binded to the Worker instance, created by host
 * scripts. The `self` refers to the DedicatedWorkerGlobalScope which is created
 * when the Worker is instanciated:
 *
 * @see https://developer.mozilla.org/fr/docs/Web/API/DedicatedWorkerGlobalScope
 */
self.addEventListener('message', ({ data }) => {
  searchAndReplace(data.content, data.localSearchTerm, self.postMessage)
})

/**
 * When using JSDOM to test this module, it is not loaded as wa worker but as
 * a regular ES module. This class create a simple wrapper to the module default
 * object so it can be use with or without Worker support.
 */
export default class LocalSearchWorker extends FakeWorker {
  postMessage (data) {
    // The `postMessage` needs to access the class scope so we use bind to
    // ensure the callback function won't change it.
    searchAndReplace(data.content, data.localSearchTerm, super.postMessage.bind(this))
  }
}
