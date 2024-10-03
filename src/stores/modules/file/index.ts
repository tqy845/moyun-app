import {  MoYunModeEnum } from '@/constants'
import { defineStore } from 'pinia'
import { postNewFolder } from '@/api/dir.ts'
import { usePathStore } from '@/stores'

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
    await currentDir.value.appendFile(file)
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
