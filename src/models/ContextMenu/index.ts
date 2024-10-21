import { ContentMenuItem, ContentMenuItemType, FileExtensionEnum } from "@/constants"
import { usePathStore, useFileStore, UploadEventFromEnum } from "@/stores"
import Folder from "../File/Folder"


type ColorType = "default" | "primary" | "danger" | "success" | "warning" | undefined

export class ContextMenu {
    private items: Array<ContentMenuItem> = []

    private constructor() { }

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
     * @param {ContentMenuItemType} [type="text"] - 菜单项类型
     * @param {ColorType} [color="primary"] - 菜单项颜色
     * @param {string} [shortcutKey="F5"] - 快捷键
     * @returns {ContextMenu}
     */
    appendRefresh(name: string = "刷新", type: ContentMenuItemType = 'text', color: ColorType = 'primary', shortcutKey: string = 'F5'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'refresh',
            color,
            shortcutKey,
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
     * @param {ContentMenuItemType} [type="text"] - 菜单项类型
     * @param {ColorType} [color="primary"] - 菜单项颜色
     * @returns {ContextMenu}
     */
    appendUploadArea(name: string = "上传文件", type: ContentMenuItemType = 'text', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            value: FileExtensionEnum.UPLOAD,
            prefixIcon: `cloudupload-fill`,
            color,
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
     * @param {ContentMenuItemType} [type="text"] - 菜单项类型
     * @param {ColorType} [color="primary"] - 菜单项颜色
     * @returns {ContextMenu}
     */
    appendUpload(name: string = "上传", type: ContentMenuItemType = 'text', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'cloud-upload',
            color,
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
     * @param {ContentMenuItemType} [type="text"] - 菜单项类型
     * @param {ColorType} [color="primary"] - 菜单项颜色
     * @returns {ContextMenu}
     */
    appendNewFolder(name: string = "新建文件夹", type: ContentMenuItemType = 'text', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'folder',
            color,
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
     * @param {ContentMenuItemType} [type="text"] - 菜单项类型
     * @param {ColorType} [color="primary"] - 菜单项颜色
     * @returns {ContextMenu}
     */
    appendNewDocument(name: string = "新建文本文档", type: ContentMenuItemType = 'text', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'file-1',
            color,
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
     * @param {ContentMenuItemType} [type="text"] - 菜单项类型
     * @returns {ContextMenu}
     */
    appendRepeal(name: string = "撤销", type: ContentMenuItemType = 'text'): ContextMenu {
        this.items.push({
            type,
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
     * @param {ContentMenuItemType} [type="text"] - 菜单项类型
     * @param {ColorType} [color="primary"] - 菜单项颜色
     * @returns {ContextMenu}
     */
    appendFixedQuick(name: string = '固定到快捷访问', type: ContentMenuItemType = 'text', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            value: 'fixed-quick',
            icon: `pin`,
            prefixIcon: `pin`,
            color,
            action: () => {
                const { currentDirSelectedFiles } = usePathStore()
                currentDirSelectedFiles.forEach(file => file.quick(true))
            }
        })
        return this
    }

    /**
     * 添加“从快捷访问取消固定”选项
     * @param {string} [name="从快捷访问取消固定"] - 菜单项名称
     * @param {ContentMenuItemType} [type="text"] - 菜单项类型
     * @returns {ContextMenu}
     */
    appendCancelFixedQuick(name: string = '从“快捷访问”取消固定', type: ContentMenuItemType = 'text'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'pin',
            action: () => {
                const { currentDirSelectedFiles } = usePathStore()
                currentDirSelectedFiles.forEach(file => file.quick(false))
            }
        })
        return this
    }

    /**
     * 添加“全部选择”选项
     * @param {string} [name="全部选择"] - 菜单项名称
     * @param {ContentMenuItemType} [type="text"] - 菜单项类型
     * @param {ColorType} [color="primary"] - 菜单项颜色
     * @returns {ContextMenu}
     */
    appendAllSelected(name: string = '全部选择', type: ContentMenuItemType = 'text', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            value: 'all',
            prefixIcon: `check-circle`,
            color,
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
     * @param {ContentMenuItemType} [type="text"] - 菜单项类型
     * @param {ColorType} [color="primary"] - 菜单项颜色
     * @returns {ContextMenu}
     */
    appendAllCancel(name: string = '全部取消', type: ContentMenuItemType = 'text', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            value: 'all-cancel',
            prefixIcon: `minus-circle`,
            color,
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
     * @param {ContentMenuItemType} [type="text"] - 菜单项类型
     * @param {ColorType} [color="primary"] - 菜单项颜色
     * @returns {ContextMenu}
     */
    appendReverseSelected(name: string = '反向选择', type: ContentMenuItemType = 'text', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            value: 'reverse',
            prefixIcon: `rollfront`,
            color,
            action: () => {
                const { reverseSelected } = usePathStore()
                reverseSelected()
            }
        })
        return this
    }

    appendOpen(name: string = "打开", type: ContentMenuItemType = 'text', shortcutKey: string = 'Enter'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'gesture-up-1',
            shortcutKey,
            action: (folder?: Folder) => {
                if (folder) {
                    folder.open()
                    return
                }
                const { currentDirSelectedFiles } = usePathStore()
                currentDirSelectedFiles.forEach(file => file.open())
            }
        })
        return this
    }

    appendLookAttr(name: string = '属性', type: ContentMenuItemType = 'text', shortcutKey: string = 'Alt+Enter'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'tools',
            shortcutKey,
            action: (folder?: Folder) => {
                if (folder) {
                    folder.detail()
                    return
                }
                const { currentDirSelectedFiles } = usePathStore()
                currentDirSelectedFiles.forEach(file => file.detail())
            }
        })
        return this
    }

    appendDownload(name: string = "下载", type: ContentMenuItemType = 'icon', shortcutKey: string = '', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'cloud-download',
            color,
            shortcutKey,
            action: () => {
                const { currentDirSelectedFiles } = usePathStore()
                currentDirSelectedFiles.forEach(file => file.download())
            }
        })
        return this
    }

    appendCut(name: string = '剪切', type: ContentMenuItemType = 'icon', shortcutKey: string = 'Ctrl+X', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'cut',
            shortcutKey,
            color,
            action: () => {
                const { currentDirSelectedFiles, currentActionFiles } = usePathStore()
                currentDirSelectedFiles.forEach(file => file.isCutting = true)
                currentActionFiles.clear()
                currentActionFiles.push(...currentDirSelectedFiles)
                console.log(currentActionFiles, currentDirSelectedFiles)
            }
        })
        return this
    }

    appendCopy(name: string = '复制', type: ContentMenuItemType = 'icon', shortcutKey: string = 'Ctrl+C', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'copy',
            shortcutKey,
            color,
            action: () => {
                const { currentDirSelectedFiles, currentActionFiles } = usePathStore()
                currentDirSelectedFiles.forEach(file => file.isCopying = true)
                currentActionFiles.clear()
                currentActionFiles.push(...currentDirSelectedFiles)
            }
        })
        return this
    }

    appendRename(name: string = '重命名', type: ContentMenuItemType = 'icon', shortcutKey: string = 'F2', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'edit-2',
            shortcutKey,
            color,
            action: () => {
                const { currentDirSelectedFiles } = usePathStore()
                currentDirSelectedFiles.forEach(file => file.isRenaming = true)
            }
        })
        return this
    }

    appendDelete(name: string = '删除', type: ContentMenuItemType = 'icon', shortcutKey: string = 'Delete', color: ColorType = 'danger'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'delete',
            shortcutKey,
            color,
            action: () => {
                const { currentDirSelectedFiles } = usePathStore()
                currentDirSelectedFiles.forEach(file => file.delete())
            }
        })
        return this
    }

    appendPaste(name: string = "粘贴", type: ContentMenuItemType = 'icon', color: ColorType = 'primary'): ContextMenu {
        this.items.push({
            type,
            name,
            icon: 'paste',
            color,
            action: () => {
                const { paste } = usePathStore()
                paste()
            }
        })
        return this
    }


    build(): Array<ContentMenuItem> {
        return this.items
    }
}
