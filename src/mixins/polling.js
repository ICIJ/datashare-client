import { find, findIndex, filter, isFunction } from 'lodash'

/**
 * This mixin provides an unified way to poll data from an arbitrary source
 * on a regular interval.
 */
export default {
  data() {
    return {
      registeredPolls: []
    }
  },
  beforeDestroy() {
    this.unregisteredPolls()
  },
  methods: {
    unregisteredPolls() {
      // Clear all polls
      this.registeredPolls.forEach(this.unregisteredPoll)
    },
    unregisteredPoll({ id }) {
      const index = findIndex(this.registeredPolls, { id })
      // Clear the timeout
      clearTimeout(id)
      // Delete the function from the poll
      this.registeredPolls.splice(index, 1)
    },
    registerPoll({ fn, timeout = 2000, immediate = false } = {}) {
      // Scheddule the poll first to get its id
      const id = this.schedulePoll({ fn, timeout, immediate })
      // And add it to the list to retrieve it later
      this.registeredPolls.push({ fn, id })
    },
    registerPollOnce({ fn, ...rest } = {}) {
      // Find all matching poll functions
      filter(this.registeredPolls, { fn }).forEach(this.unregisteredPoll)
      // Register the poll again with the new option
      return this.registerPoll({ fn, ...rest })
    },
    schedulePoll({ fn, timeout, immediate = false }) {
      // Return the id of the setInterval
      return setTimeout(async () => {
        const poll = find(this.registeredPolls, { fn })
        try {
          // Call the poll's promise, shedule it again only if it returns true
          if (await fn()) {
            // Update the poll id with the next one
            poll.id = this.schedulePoll({ fn, timeout })
          } else {
            this.unregisteredPoll(poll)
          }
          // Reject promise triggers unregistering of the poll
        } catch (_) {
          this.unregisteredPoll(poll)
        }
        // If immediate is true, the timeout is set to 0
      }, !immediate * this.callOrGetTimeout(timeout))
    },
    callOrGetTimeout(timeout) {
      if (isFunction(timeout)) {
        return timeout()
      }
      return Number(timeout)
    }
  }
}
