import { ContentMenuItem, ContentMenuItemType, FileExtensionEnum } from "@/constants"
import { usePathStore, useFileStore, UploadEventFromEnum } from "@/stores"

export class ContextMenu {
    private items: Array<ContentMenuItem> = []

    private constructor() {
    }

    static builder() {
        return new ContextMenu()
    }

    /**
     * 添加分割线
     * @returns {ContextMenu}
     */
    appendDivider(): ContextMenu {
        const lastItem = this.items.peek()
        if (lastItem) {
            lastItem.divider = true
        }
        return this
    }

    /**
     * 添加“刷新”选项
     * @param {string} [name="刷新"] - 菜单项名称
     * @returns {ContextMenu}
     */
    appendRefresh(name: string = "刷新"): ContextMenu {
        this.items.push({
            type: 'text',
            name,
            icon: 'refresh',
            color: 'primary',
            shortcutKey: `F5`,
            action: () => {
                const { children } = usePathStore()
                children.peek()!.refresh()
            }
        })
        return this
    }

    /**
     * 添加“上传文件区域”选项
     * @param {string} [name="上传文件"] - 菜单项名称
     * @returns {ContextMenu}
     */
    appendUploadArea(name: string = "上传文件"): ContextMenu {
        this.items.push({
            type: "text",
            name,
            value: FileExtensionEnum.UPLOAD,
            prefixIcon: `cloudupload-fill`,
            moreIcon: true,
            action: () => {
                const { showUploadArea } = useFileStore()
                showUploadArea()
            }
        })
        return this
    }

    /**
     * 添加“上传”选项
     * @param {string} [name="上传"] - 菜单项名称
     * @returns {ContextMenu}
     */
    appendUpload(name: string = "上传"): ContextMenu {
        this.items.push({
            type: 'text',
            name,
            icon: 'cloud-upload',
            color: 'primary',
            shortcutKey: ``,
            action: () => {
                const { triggerUpload } = useFileStore()
                triggerUpload(UploadEventFromEnum.outside)
            }
        })
        return this
    }

    /**
     * 添加“新建文件夹”选项
     * @param {string} [name="新建文件夹"] - 菜单项名称
     * @returns {ContextMenu}
     */
    appendNewFolder(name: string = "新建文件夹"): ContextMenu {
        this.items.push({
            type: 'text',
            name,
            icon: 'folder',
            color: 'primary',
            shortcutKey: ``,
            value: FileExtensionEnum.FOLDER,
            prefixIcon: `folder`,
            action: () => {
                const { createFolder } = useFileStore()
                createFolder()
            }
        })
        return this
    }

    /**
     * 添加“新建文本文档”选项
     * @param {string} [name="新建文本文档"] - 菜单项名称
     * @returns {ContextMenu}
     */
    appendNewDocument(name: string = "新建文本文档"): ContextMenu {
        this.items.push({
            type: 'text',
            name,
            icon: 'file-1',
            color: 'primary',
            shortcutKey: ``,
            value: FileExtensionEnum.FILE,
            prefixIcon: `file-1`,
            action: () => {
                const { createDocument } = useFileStore()
                createDocument()
            }
        })
        return this
    }

    /**
     * 添加“撤销”选项
     * @param {string} [name="撤销"] - 菜单项名称
     * @returns {ContextMenu}
     */
    appendRepeal(name: string = "撤销"): ContextMenu {
        this.items.push({
            type: "text",
            name,
            value: 'repeal',
            prefixIcon: `rollback`,
            action: () => { }
        })
        return this
    }

    /**
     * 添加“固定到快捷访问”选项
     * @param {string} [name="固定到快捷访问"] - 菜单项名称
     * @returns {ContextMenu}
     */
    appendFixedQuick(name: string = '固定到快捷访问'): ContextMenu {
        this.items.push({
            type: "text",
            name,
            value: 'fixed-quick',
            prefixIcon: `pin`,
            icon: "pin",
            action: () => {
                const { currentDirFiles } = usePathStore()
                currentDirFiles.forEach(file => file.quick(true))
            }
        })
        return this
    }


    appendCancelFixedQuick() {
        this.items.push({
            type: 'text',
            name: '从“快捷访问”取消固定',
            icon: 'pin',
            action: () => {
                const { currentDirFiles } = usePathStore()
                currentDirFiles.forEach(file => file.quick(false))
            }
        })
        return this
    }

    /**
     * 添加“全部选择”选项
     * @param {string} [name="全部选择"] - 菜单项名称
     * @returns {ContextMenu}
     */
    appendAllSelected(name: string = '全部选择'): ContextMenu {
        this.items.push({
            type: "text",
            name,
            value: 'all',
            prefixIcon: `check-circle`,
            action: () => {
                const { allSelected } = usePathStore()
                allSelected()
            }
        })
        return this
    }

    /**
     * 添加“全部取消选择”选项
     * @param {string} [name="全部取消"] - 菜单项名称
     * @returns {ContextMenu}
     */
    appendAllCancel(name: string = '全部取消'): ContextMenu {
        this.items.push({
            type: "text",
            name,
            value: 'all-cancel',
            prefixIcon: `minus-circle`,
            action: () => {
                const { clearSelected } = usePathStore()
                clearSelected()
            }
        })
        return this
    }

    /**
     * 添加“反向选择”选项
     * @param {string} [name="反向选择"] - 菜单项名称
     * @returns {ContextMenu}
     */
    appendReverseSelected(name: string = '反向选择'): ContextMenu {
        this.items.push({
            type: "text",
            name,
            value: 'reverse',
            prefixIcon: `error-circle`,
            action: () => {
                const { reverseSelected } = usePathStore()
                reverseSelected()
            }
        })
        return this
    }

    appendOpen(name: string = "打开") {
        this.items.push({
            type: 'text',
            name,
            icon: 'gesture-up-1',
            shortcutKey: `Enter`,
            action: () => {
                const { currentDirFiles } = usePathStore()
                currentDirFiles.forEach(file => file.open())
            }
        })
        return this
    }

    appendLookAttr(name: string = '属性') {
        this.items.push({
            type: 'text',
            name,
            icon: 'tools',
            shortcutKey: `Alt+Enter`,
            action: () => {
                const { currentDirFiles } = usePathStore()
                currentDirFiles.forEach(file => file.detail())
            }
        })
        return this
    }

    appendDownload(name: string = "下载", type: ContentMenuItemType = "icon") {
        this.items.push({
            type,
            name,
            icon: 'cloud-download',
            color: 'primary',
            action: () => {
                const { currentDirFiles } = usePathStore()
                currentDirFiles.forEach(file => file.download())
            }
        })
        return this
    }

    appendCut() {
        this.items.push({
            type: 'icon',
            name: '剪切',
            icon: 'cut',
            shortcutKey: `Ctrl+X`,
            color: 'primary',
            action: () => {
                const { currentDirFiles } = usePathStore()
                currentDirFiles.forEach(file => file.isShearing.value = true)
            }
        })
        return this
    }

    appendCopy() {
        this.items.push({
            type: 'icon',
            name: '复制',
            icon: 'copy',
            shortcutKey: `Ctrl+C`,
            color: 'primary',
            action: () => {
                const { currentDirFiles } = usePathStore()
                currentDirFiles.forEach(file => file.isCopying.value = true)
            }
        })
        return this
    }


    appendRename() {
        this.items.push({
            type: 'icon',
            name: '重命名',
            icon: 'edit-2',
            shortcutKey: `F2`,
            color: 'primary',
            action: () => {
                const { currentDirFiles } = usePathStore()
                currentDirFiles.forEach(file => file.isRenaming.value = true)
            }
        })
        return this
    }

    appendDelete() {
        this.items.push({
            type: 'icon',
            name: '删除',
            icon: 'delete',
            shortcutKey: `Delete`,
            color: 'danger',
            action: () => {
                const { currentDirFiles } = usePathStore()
                currentDirFiles.forEach(file => file.delete())
            }
        })
        return this
    }


    /**
     * 构建菜单
     * @returns {ContentMenuItem[]}
     */
    build(): ContentMenuItem[] {
        return this.items
    }
}
