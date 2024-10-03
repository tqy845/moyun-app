import { defineStore } from 'pinia'
import Folder from '@/models/File/Folder'
import File from '@/models/File/File'


export const usePreviewStore = defineStore(`preview-store`, () => {
  const visible = ref(false)
  const file = ref<File | Folder | null>(null)
  return {
    visible,
    file
  }
})
