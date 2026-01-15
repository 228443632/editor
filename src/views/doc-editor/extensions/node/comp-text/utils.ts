/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 07/01/26 PM3:02
 */
import orderPartyBServicePayablePng from '@/assets/images/order-party-b-service-payable.png'
import orderSubjectClaimPng from '@/assets/images/order-subject-claim.png'
import { getHttpBlob } from 'sf-utils2'
import { blobToBase64 } from 'file64'

export const imgMap = shallowReactive({
  /** 是否初始化结束 */
  __initial: false,

  /** 订单 - 应支付乙方的委托服务报酬 */
  orderPartyBServicePayable: orderPartyBServicePayablePng,

  /** 订单 - 标的债权 */
  orderSubjectClaim: orderSubjectClaimPng,
})

/**
 * 加载图片转base64
 */
export async function loadImgToBase64() {
  if (imgMap.__initial) return
  const pendings = []
  Object.keys(imgMap).forEach((key) => {
    const value = imgMap[key]
    pendings.push(
      getHttpBlob(value).then(async (blob: Blob) => {
        // console.log('blob', blob)
        imgMap[key] = await blobToBase64(blob)
      }),
    )
  })
  await Promise.all(pendings)
}
