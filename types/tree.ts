/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 07/08/24 3:25 PM
 */

export interface ITreeItemBase {
  id: string

  pid: string
}

export interface ITreeItem<T extends ITreeItem<T>> {
  readonly __id__: string

  readonly __pId__: string

  /**
   * 父节点
   */
  __parentNode__: T

  /**
   * 所有children
   */
  __allChildren__: T[]

  /**
   * 当前节点深度
   */
  __level__: number

  /**
   * 同__level__
   */
  __depth__: number

  /**
   * 当前节点经过的路径（节点路径）
   */
  __pathList__: string[]

  /**
   * 当前节点经过的路径（节点__id__集合）
   */
  __pathIds__: string[]

  /**
   *
   */
  __pathNodes__: T[]

  /**
   * 根节点
   */
  __rootNode__: T

  id: string

  pid: string
}
