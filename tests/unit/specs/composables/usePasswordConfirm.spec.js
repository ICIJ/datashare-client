import { usePasswordConfirm } from '@/composables/usePasswordConfirm.js'

describe('usePasswordConfirm', () => {
  it('is valid only when both passwords are filled in and equal', () => {
    const { password, confirmPassword, isPasswordValid } = usePasswordConfirm()
    expect(isPasswordValid.value).toBe(false)
    password.value = 'secret'
    expect(isPasswordValid.value).toBe(false)
    confirmPassword.value = 'other'
    expect(isPasswordValid.value).toBe(false)
    confirmPassword.value = 'secret'
    expect(isPasswordValid.value).toBe(true)
  })

  it('does not count whitespace alone as a password', () => {
    const { password, confirmPassword, isPasswordValid } = usePasswordConfirm()
    password.value = '   '
    confirmPassword.value = '   '
    expect(isPasswordValid.value).toBe(false)
  })

  it('only flags a mismatch once the confirmation has been started', () => {
    const { password, confirmPassword, passwordMismatch } = usePasswordConfirm()
    password.value = 'secret'
    expect(passwordMismatch.value).toBe(false)
    confirmPassword.value = 'sec'
    expect(passwordMismatch.value).toBe(true)
  })

  it('clears both passwords', () => {
    const { password, confirmPassword, clearPasswords } = usePasswordConfirm()
    password.value = 'secret'
    confirmPassword.value = 'secret'
    clearPasswords()
    expect([password.value, confirmPassword.value]).toEqual(['', ''])
  })
})
