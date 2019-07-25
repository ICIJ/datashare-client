
import FakeWorker from './fake-worker.js'
import { addLocalSearchMarks } from './strings.js'

self.addEventListener('message', ({ data }) => {
  const result = addLocalSearchMarks(data.content, data.localSearchTerm)
  // Send the data to the worker host
  self.postMessage(result)
})

export default class LocalSearchWorker extends FakeWorker {
  postMessage (data) {
    const result = addLocalSearchMarks(data.content, data.localSearchTerm)
    // Send the data to parent method (which pass the data to the host)
    super.postMessage(result)
  }
}
