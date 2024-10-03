import { MoYunModeEnum } from '@/constants'

export default {
  videoThumbnail: async (file: File, ext: string, maxWidth = MoYunModeEnum.SUPER_BIG_ICON, maxHeight = MoYunModeEnum.SUPER_BIG_ICON) => {
    return new Promise<string>((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const fileURL = URL.createObjectURL(file)

      video.src = fileURL
      video.muted = true
      video.playsInline = true
      video.autoplay = false
      video.preload = 'metadata'

      // 当视频元数据加载完成时
      video.addEventListener('loadeddata', () => {
        // 设置视频时间到你想截取的帧
        video.currentTime = 5 // 你可以选择其他时间点

        video.addEventListener('timeupdate', function onTimeUpdate() {
          video.removeEventListener('timeupdate', onTimeUpdate)
          // 暂停视频
          video.pause()

          // 获取视频的宽高并计算缩放比例
          const videoWidth = video.videoWidth
          const videoHeight = video.videoHeight
          let scale = Math.min(maxWidth / videoWidth, maxHeight / videoHeight)

          if (scale > 1) scale = 1 // 不放大超过原始尺寸

          canvas.width = videoWidth * scale
          canvas.height = videoHeight * scale

          // 将视频当前帧绘制到 canvas 上
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

          // 将 canvas 转为 base64 数据URL
          const thumbnailDataURL = canvas.toDataURL(`image/${ext}`, 0.7)
          // 清理 URL 对象
          URL.revokeObjectURL(fileURL)
          // 返回生成的缩略图
          resolve(thumbnailDataURL)
        })
      })

      video.addEventListener('error', () => {
        URL.revokeObjectURL(fileURL)
        reject(new Error('视频处理出错'))
      })
    })
  }
}
