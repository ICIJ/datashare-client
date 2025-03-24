import { find, findIndex, noop, isFunction } from 'lodash'
import { onBeforeUnmount, reactive } from 'vue'

export function usePolling() {
  const registeredPolls = reactive([])

  onBeforeUnmount(unregisteredPolls)

  function unregisteredPolls() {
    // Clear all polls
    registeredPolls.forEach(unregisteredPoll)
  }

  function unregisteredPoll({ id = null, fn = noop } = {}) {
    // Allow to find the registered poll etheir by id or by function
    const index = findIndex(registeredPolls, { id }) ?? findIndex(registeredPolls, { fn })
    // Clear the timeout
    clearTimeout(id)
    // Delete the function from the poll
    registeredPolls.splice(index, 1)
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
        try {
          // Call the poll's promise, schedule it again only if it returns true
          if (await fn()) {
            // Update the poll id with the next one
            poll.id = schedulePoll({ fn, timeout })
          } else {
            unregisteredPoll(poll)
          }
          // Reject promise triggers unregistering of the poll
        } catch (_) {
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
