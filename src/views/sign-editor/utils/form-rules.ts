/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 24/10/25 PM3:06
 */

import { getSize, isNullable } from 'sf-utils2'
/**
 * 表单规则
 */
export const formRules = {
  /** 必填 */
  required: [
    {
      validator: (val) => {
        if (isNullable(val))
          return { result: false, message: '必填', type: 'error' }
        if (!getSize(val)) {
          return { result: false, message: '必填', type: 'error' }
        }
        return { result: true }
      },
      message: '必填',
      type: 'error',
    },
  ],
}
