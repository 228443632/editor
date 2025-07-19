export const shortId = (length = 8) =>
  Math.random()
    .toString(36)
    .substring(2, length + 2)

/**
 * 生成UUId
 * @returns {string}
 */
export function simpleUUID() {
  // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
