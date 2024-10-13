import { MoYunModeEnum } from '@/constants'
import { defineStore } from 'pinia'
import { postNewFolder } from '@/api/dir.ts'
import { usePathStore } from '@/stores'
import Folder from '@/models/File/Folder'
import MYFile from '@/models/File/File';

export enum UploadEventFromEnum {
  outside = 'outside',
  inside = 'inside'
}

export const useFileStore = defineStore(`file-store`, () => {
  const uploadRef = ref<HTMLInputElement | null>(null)
  const _isShowUploadArea = ref(false)
  const mode = ref(MoYunModeEnum.MEDIUM_ICON)
  const { currentDir } = storeToRefs(usePathStore())

  const setUploadRef = (el: HTMLInputElement | null) => {
    if (!uploadRef.value && el) {
      uploadRef.value = el
    }
  }

  const triggerUpload = (from: UploadEventFromEnum = UploadEventFromEnum.inside) => {
    if (uploadRef.value) {
      uploadRef.value.setAttribute('from', from)
      uploadRef.value.click()
    }
  }

  const showUploadArea = () => {
    _isShowUploadArea.value = true
  }

  const hideUploadArea = () => {
    _isShowUploadArea.value = false
  }

  const createFolder = async () => {
    const { file } = await postNewFolder(currentDir.value.id)
    const fileInstance: Folder | MYFile = await currentDir.value.appendFile(file, false)
    await nextTick()
    // 触发重命名
    fileInstance.isRenaming.value = true
  }
  const createDocument = () => {
  }
  return {
    _isShowUploadArea,

    mode,
    setUploadRef,
    triggerUpload,
    showUploadArea,
    hideUploadArea,
    createFolder,
    createDocument
  }
})
