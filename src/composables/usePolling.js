import find from 'lodash/find'
import isFunction from 'lodash/isFunction'
import { onBeforeUnmount, reactive } from 'vue'

export function usePolling() {
  const registeredPolls = reactive([])

  onBeforeUnmount(unregisteredPolls)

  function unregisteredPolls() {
    // Clear all polls (from a copy, as unregistering removes entries from the list)
    registeredPolls.slice().forEach(unregisteredPoll)
  }

  function unregisteredPoll({ id = null, fn = null } = {}) {
    // Allow to find the registered poll either by id or by function
    const index = registeredPolls.findIndex(poll => poll.id === id || poll.fn === fn)
    if (index > -1) {
      // Clear the timeout
      clearTimeout(registeredPolls[index].id)
      // Delete the function from the poll
      registeredPolls.splice(index, 1)
    }
  }

  function registerPoll({ fn, timeout = 2000, immediate = false } = {}) {
    // Schedule the poll first to get its id
    const id = schedulePoll({ fn, timeout, immediate })
    // And add it to the list to retrieve it later
    registeredPolls.push({ fn, id })
  }

  function registerPollOnce({ fn, ...rest } = {}) {
    // Find and unregister all matching poll functions
    unregisteredPoll({ fn })
    // Register the poll again with the new option
    return registerPoll({ fn, ...rest })
  }

  function schedulePoll({ fn, timeout, immediate = false }) {
    // Return the id of the setInterval
    return Number(
      setTimeout(async () => {
        const poll = find(registeredPolls, { fn })
        // Call the poll's promise, a rejected promise stops the poll
        const again = await Promise.resolve(fn()).catch(() => false)
        // The poll was unregistered or replaced while its function was running
        if (!registeredPolls.includes(poll)) {
          return
        }
        // Schedule the poll again only if its function returned true
        if (again) {
          // Update the poll id with the next one
          poll.id = schedulePoll({ fn, timeout })
        }
        else {
          unregisteredPoll(poll)
        }
      }, !immediate * callOrGetTimeout(timeout))
    )
  }

  function callOrGetTimeout(timeout) {
    if (isFunction(timeout)) {
      return timeout()
    }
    return Number(timeout)
  }

  return {
    unregisteredPolls,
    unregisteredPoll,
    registerPoll,
    registerPollOnce,
    schedulePoll,
    callOrGetTimeout
  }
}
