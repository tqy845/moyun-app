import { CONTEXT_MENU_ITEM, FileExtensionEnum } from "@/constants"
import { usePathStore, useFileStore, UploadEventFromEnum } from "@/stores"

export class ContextMenu {
    private items: Array<CONTEXT_MENU_ITEM> = []

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
            action: () => '',
            divider: true
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

    /**
     * 构建菜单
     * @returns {CONTEXT_MENU_ITEM[]}
     */
    build(): CONTEXT_MENU_ITEM[] {
        return this.items
    }
}
