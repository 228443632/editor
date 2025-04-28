/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 27/04/25 PM5:23
 */
const {uploadFiles} = require('@internal/scripts/utils.js')
const path = require('path')

const cwd = process.cwd()

uploadFiles({
  host: '10.86.120.10', // 服务器ip 116.62.4.240 49.235.180.55
  port: '22', // 端口一般默认22
  username: 'root', // 用户名
  password: 'admin', // 密码
  distPath: '/data/fr/editor', // 上传到服务器的位置
  localPath: path.resolve(cwd, 'dist'), // 本地打包的存放的地址
})
