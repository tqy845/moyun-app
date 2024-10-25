import Base from '@/models/File/Base'

export const useFileAttrStore = defineStore(
  `fileAttrStore`,
  () => {
    const visibleRef = ref(false)
    const fileRef = ref<Base>()
    const show = (file: Base) => {
      fileRef.value = file
      visibleRef.value = true
    }

    const hide = () => {
      visibleRef.value = false
    }

    return {
      visibleRef,
      fileRef,
      show,
      hide
    }
  },
  {
    persist: [
      {
        debug: true,
        storage: sessionStorage
      }
    ]
  }
)
