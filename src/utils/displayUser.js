export default function (userId, currentUserId = 'local') {
  return userId === currentUserId ? 'you' : userId
}
