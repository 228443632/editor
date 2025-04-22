/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 AM10:52
 */

/**
 * 合并两个对象的前两级属性，数组直接覆盖
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的新对象
 */
export function shallowMergeWithArrayOverride(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
) {
  const merged = { ...source }
  Object.keys(source).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      // 如果是数组，直接覆盖
      if (Array.isArray(source[key])) {
        merged[key] = target[key]
      }
      // 如果是对象（非数组），合并第二级属性
      else if (typeof source[key] === 'object' && source[key] !== null) {
        console.log('key', key, source[key], target[key])
        merged[key] = { ...source[key], ...(target[key] || {}) }
      }
      // 基本类型，直接覆盖
      else {
        merged[key] = target[key]
      }
    }
  })

  return merged
}
