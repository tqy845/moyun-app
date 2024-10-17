import { FileExtensionEnum, SortModeEnum, SortTypeEnum } from '@/constants'
import Folder from '@/models/File/Folder'
import MYFile from '@/models/File/File'
import { Prototype } from '@/models/File/interface'
import { FileRawModel } from '@/api/models/fileModel'
import fileClass from '@/assets/fileClass.json'
import { fileUtils, videoUtils, imageUtils } from '@/utils/functions'
import { ContextMenu } from '@/models/ContextMenu'
import { usePathStore } from '@/stores'

export default {
  isFile(file: FileRawModel | MYFile | Folder) {
    return file.extension !== FileExtensionEnum.FOLDER
  },
  isFolder(file: FileRawModel | MYFile | Folder) {
    return file.extension === FileExtensionEnum.FOLDER
  },
  newFileObject(file: FileRawModel, options?: Prototype) {
    if (this.isFile(file)) {
      return new MYFile(file, options)
    } else {
      return new Folder(file, options)
    }
  },
  isDateType(value: any): boolean {
    return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))
  },
  getExtName(filename: string) {
    const index = filename.lastIndexOf('.')
    return index !== -1 ? filename.substring(index + 1) : ''
  },
  getNotExtName(filename: string) {
    const index = filename.lastIndexOf('.')
    return index !== -1 ? filename.substring(0, index) : filename
  },
  compareByAttr(type: SortTypeEnum, mode: SortModeEnum) {
    return (a: MYFile | Folder, b: MYFile | Folder) => {
      // 如果属性是时间类型，则将其转换为日期对象
      const aValue = this.isDateType(a[type]) ? new Date(a[type]!) : a[type]!
      const bValue = this.isDateType(b[type]) ? new Date(b[type]!) : b[type]!

      // 比较属性值
      let comparison = 0
      if (aValue < bValue) {
        comparison = -1
      } else if (aValue > bValue) {
        comparison = 1
      }

      // 根据排序模式调整比较结果
      if (mode === SortModeEnum.DOWN) {
        comparison *= -1 // 反转比较结果以实现降序排序
      }

      return comparison
    }
  },
  formatFileSize(value: number) {
    if (!value) {
      return '0'
    }
    const unitArr = new Array('Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB')
    let index = 0
    const srcsize = parseFloat(value.toString())
    index = Math.floor(Math.log(srcsize) / Math.log(1024))
    const size = srcsize / Math.pow(1024, index)
    return size.toFixed(2) + unitArr[index]
  },
  isImageType(ext: string) {
    return fileClass.image.includes(ext.toLowerCase())
  },
  isVideoType(ext: string) {
    return fileClass.video.includes(ext.toLowerCase())
  },
  isAudioType(ext: string) {
    return fileClass.audio.includes(ext.toLowerCase())
  },
  isDocumentType(ext: string) {
    return fileClass.document.includes(ext.toLowerCase())
  },
  isThumbnailType(ext: string) {
    return fileClass.image.concat(fileClass.video).includes(ext.toLowerCase())
  },
  generateThumbnail(
    file: File,
    ext: string,
    maxWidth = 512,
    maxHeight = 512
  ): Promise<string> {
    if (this.isImageType(ext)) {
      return imageUtils.imageThumbnail(file, 'webp', maxWidth, maxHeight)
    } else if (this.isVideoType(ext)) {
      return videoUtils.videoThumbnail(file, 'webp', maxWidth, maxHeight)
    }
    return Promise.reject('')
  },
  generateNewName(baseName: string, file: MYFile | Folder) {
    const { currentDirFiles } = usePathStore()
    let newName = `${baseName}${file.isFolder ? '' : '.' + file.extension}`;
    let count = 2;
    while (currentDirFiles.find(_file => _file.name === newName && _file.__prototype__.type === file.__prototype__.type)) {
      newName = `${baseName}(${count++})${file.isFolder ? '' : '.' + file.extension}`;
    }
    return newName
  },
  dataURLtoBlob(dataURL: string): Promise<Blob> {
    return new Promise((resolve) => {
      const arr = dataURL.split(',')
      const mime = arr?.[0].match(/:(.*?);/)?.[1]
      const bstr = atob(arr[1])
      const n = bstr.length
      const u8arr = new Uint8Array(n)

      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i)
      }

      resolve(new Blob([u8arr], { type: mime || 'image/webp' }))
    })
  },
  /**
   * 元信息转换为文件/文件夹实例
   * @param fileRawModel 文件原始数据
   * @returns 文件/文件夹实例
   */
  metadataConversionFileInstance(fileRawModel: FileRawModel) {
    return fileUtils.newFileObject(fileRawModel, {})
  }
}
