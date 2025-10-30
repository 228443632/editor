/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 29/10/25 PM1:49
 */
import type { AttachNode, Styles, TNode } from 'tdesign-vue-next/es/common'
import type { ButtonProps } from 'tdesign-vue-next/es/button'
import type { DialogCloseContext } from 'tdesign-vue-next/es/dialog/type'

export interface TdDialogProps {
  attach?: AttachNode
  body?: string | TNode
  cancelBtn?: string | ButtonProps | TNode | null
  closeBtn?: string | boolean | TNode
  closeOnEscKeydown?: boolean
  closeOnOverlayClick?: boolean
  confirmBtn?: string | ButtonProps | TNode | null
  confirmLoading?: boolean
  confirmOnEnter?: boolean
  default?: string | TNode
  destroyOnClose?: boolean
  dialogClassName?: string
  dialogStyle?: Styles
  draggable?: boolean
  footer?: boolean | TNode
  header?: string | boolean | TNode
  mode?: 'modal' | 'modeless' | 'normal' | 'full-screen'
  placement?: 'top' | 'center'
  preventScrollThrough?: boolean
  showInAttachedElement?: boolean
  showOverlay?: boolean
  theme?: 'default' | 'info' | 'warning' | 'danger' | 'success'
  top?: string | number
  visible?: boolean
  width?: string | number
  zIndex?: number
  onBeforeClose?: () => void
  onBeforeOpen?: () => void
  onCancel?: (context: { e: MouseEvent }) => void
  onClose?: (context: DialogCloseContext) => void
  onCloseBtnClick?: (context: { e: MouseEvent }) => void
  onClosed?: () => void
  onConfirm?: (context: { e: MouseEvent | KeyboardEvent }) => void
  onEscKeydown?: (context: { e: KeyboardEvent }) => void
  onOpened?: () => void
  onOverlayClick?: (context: { e: MouseEvent }) => void
}
