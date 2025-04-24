/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 AM10:52
 */

import { isPlainObject } from '@tiptap/core'

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
  const keys = Object.keys({ ...source, ...target })
  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      // 如果是数组，直接覆盖
      if (Array.isArray(source[key])) {
        merged[key] = target[key]
      }
      // 如果是对象（非数组），合并第二级属性
      else if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        isPlainObject(source[key])
      ) {
        console.log('key', key, source[key], target[key])
        // @ts-expect-error
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

/**
 * 找出两个数组中发生单次交换的索引位置
 * @param {Array} arr1 - 原始数组
 * @param {Array} arr2 - 可能交换过的数组
 * @returns {[number, number] | null} 返回交换的索引 [i, j]，若无交换或不符合条件则返回 null
 */
export function findSingleSwapIndicesOptimized(arr1, arr2) {
  // 1. 检查数组长度是否一致
  if (arr1.length !== arr2.length) {
    throw new Error("数组长度必须相同");
  }

  const diffIndices = []; // 存储值不同的索引

  // 2. 遍历数组，记录所有不同的位置
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      diffIndices.push(i);
      // 如果发现超过2个不同位置，直接返回null（不满足单次交换）
      if (diffIndices.length > 2) {
        return null;
      }
    }
  }

  // 3. 检查是否恰好有两个不同位置，且满足交换条件
  if (diffIndices.length === 2) {
    const [i, j] = diffIndices;
    // 关键验证：arr1[i] === arr2[j] && arr1[j] === arr2[i]
    if (arr1[i] === arr2[j] && arr1[j] === arr2[i]) {
      return diffIndices; // 返回交换的索引
    }
  }

  // 4. 其他情况（无交换或交换不成立）
  return null;
}

// 示例用法
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [1, 4, 3, 2, 5];
console.log(findSingleSwapIndicesOptimized(arr1, arr2)); // 输出: [1, 3]（交换了索引1和3）

console.log(
  's',
  findSingleSwapIndicesOptimized(
    [
      '1e7968a2c380aeffc764',
      '16cd3c0a1b5a9c7de8bb',
      '950efc7c23640bc1bbc2',
      'ffd8f1a92c8488a6fb86',
      'c631a8c034f171796f33',
    ],
    [
      '16cd3c0a1b5a9c7de8bb',
      '950efc7c23640bc1bbc2',
      'ffd8f1a92c8488a6fb86',
      '1e7968a2c380aeffc764',
      'c631a8c034f171796f33',
    ],
  ),
)
