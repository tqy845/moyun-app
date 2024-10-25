import { MoYunModeEnum } from '@/constants'
import { defineStore } from 'pinia'
import { postNewFolder } from '@/api/dir.ts'
import { usePathStore } from '@/stores'
import { MYF } from '@/models/File'

export enum UploadEventFromEnum {
  outside = 'outside',
  inside = 'inside'
}

const copyOptions = () => ({
  totalNumber: 0,
  progress: 0,
  name: ""
})

export const useFileStore = defineStore(`file-store`, () => {
  const uploadRef = ref<HTMLInputElement | null>(null)
  const copyVisibleRef = ref(false)
  const copyOptionsRef = ref(copyOptions())
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

  const switchCopyHint = async (status: boolean) => {
    await nextTick()
    const fn = () => {
      copyVisibleRef.value = status
      Object.assign(copyOptionsRef.value, copyOptions())
    }
    if (!status) {
      setTimeout(fn, 500)
      return
    }
    fn()
  }

  const createFolder = async () => {
    const { file } = await postNewFolder(currentDir.value!.id)
    const fileInstance: MYF = await currentDir.value!.appendFile(file, false)
    await nextTick()
    // 触发重命名
    fileInstance.isRenaming = true
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
    createDocument,

    copyVisibleRef,
    copyOptionsRef,
    switchCopyHint
  }
})
