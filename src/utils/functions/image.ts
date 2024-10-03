import { MoYunModeEnum } from '@/constants'

export default {
  imageThumbnail: async (file: File, ext: string, maxWidth = MoYunModeEnum.SUPER_BIG_ICON, maxHeight = MoYunModeEnum.SUPER_BIG_ICON) => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()
      const canvas = document.createElement('canvas')

      // 读取图像文件
      reader.onload = (event) => {
        img.src = event.target?.result as string

        img.onload = () => {
          // 计算缩略图尺寸
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height *= maxWidth / width))
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width *= maxHeight / height))
              height = maxHeight
            }
          }

          // 设置 canvas 尺寸
          canvas.width = width
          canvas.height = height

          // 将图像绘制到 canvas 上
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)

            // 导出 canvas 为 base64 缩略图
            const thumbnail = canvas.toDataURL(`image/${ext}`, 0.7) // 调整质量参数 (0.7)
            resolve(thumbnail)
          } else {
            reject(new Error('图片处理出错'))
          }
        }

        img.onerror = (e) => reject(new Error('Image loading error: ' + e))
      }

      reader.onerror = (e) => reject(new Error('File reading error: ' + e))
      reader.readAsDataURL(file) // 读取文件为 data URL
    })
  }
}