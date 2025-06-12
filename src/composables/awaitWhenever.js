import { toValue } from 'vue'

/**
 * If `conditionRef` is a function that returns true or is true, it awaits `fn`.
 * Otherwise, it calls `fn` without awaiting.
 *
 * @param {Function} fn - The function to be executed.
 * @param {Ref|Function} conditionRef - A reactive reference or a function that determines whether to await `fn`.
 */
export const awaitWhenever = async (fn, conditionRef) => {
  if ((typeof conditionRef === 'function' && conditionRef()) || toValue(conditionRef)) {
    await fn()
    return
  }
  fn()
}
