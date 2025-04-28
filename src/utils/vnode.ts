/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 28/04/25 AM10:49
 */
import { isFunction } from 'sf-utils2'

export function toValue<T>(source: T | (() => T) | Ref<T>): T {
  return isFunction(source)
    ? source() // 处理 Getter 函数
    : isRef(source)
      ? source.value // 处理 Ref
      : (source as T) // 返回普通值
}
