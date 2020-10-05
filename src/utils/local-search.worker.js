import FakeWorker from './fake-worker.js'
import { addLocalSearchMarks } from './strings.js'

async function searchAndReplace (content, localSearchTerm) {
  // We ensure the received data is well-formed before performing transformation
  if (content && localSearchTerm) {
    return addLocalSearchMarks(content, localSearchTerm)
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
  searchAndReplace(data.content, data.localSearchTerm).then(self.postMessage)
})

/**
 * When using JSDOM to test this module, it is not loaded as wa worker but as
 * a regular ES module. This class create a simple wrapper to the module default
 * object so it can be use with or without Worker support.
 */
export default class LocalSearchWorker extends FakeWorker {
  postMessage (data) {
    searchAndReplace(data.content, data.localSearchTerm).then(super.postMessage)
  }
}
