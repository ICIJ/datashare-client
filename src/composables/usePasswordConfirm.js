import { computed, ref } from 'vue'

/**
 * A password typed twice, as in the create and edit user forms.
 *
 * @returns {{ password: Ref<string>, confirmPassword: Ref<string>, passwordMismatch: ComputedRef<boolean>,
 *   isPasswordValid: ComputedRef<boolean>, clearPasswords: Function }}
 */
export function usePasswordConfirm() {
  const password = ref('')
  const confirmPassword = ref('')

  // Only flagged once the confirmation has been started, not while it is still empty.
  const passwordMismatch = computed(() =>
    confirmPassword.value.length > 0 && password.value !== confirmPassword.value
  )

  // Both filled in (whitespace alone doesn't count) and equal.
  const isPasswordValid = computed(() =>
    !!password.value.trim().length && !!confirmPassword.value.trim().length && password.value === confirmPassword.value
  )

  function clearPasswords() {
    password.value = ''
    confirmPassword.value = ''
  }

  return { password, confirmPassword, passwordMismatch, isPasswordValid, clearPasswords }
}

export default usePasswordConfirm
