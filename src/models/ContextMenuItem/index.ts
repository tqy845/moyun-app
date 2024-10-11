
import { usePathStore } from "@/stores"


export type ContextMenuItemType = {
    content: string
    value: string
    prefixIcon?: string
    action: () => void
    divider?: boolean
}

export class ContextMenuItem {
    static items: Array<ContextMenuItemType> = [];

    private constructor() { }

    static builder() {
        this.items = []
        return new ContextMenuItem();
    }

    // 分割线
    pushDivider() {
        const lastItem = ContextMenuItem.items.peek()
        if (lastItem) {
            lastItem.divider = true
        }
        return this
    }

    // 撤销
    pushRepeal() {
        ContextMenuItem.items.push({
            content: '撤销',
            value: 'repeal',
            prefixIcon: `rollback`,
            action: () => { }
        })
        return this
    }

    // 固定到快捷访问
    pushFixedQuick() {
        ContextMenuItem.items.push({
            content: '固定到快捷访问',
            value: 'fixed-quick',
            prefixIcon: `pin`,
            action: () => '',
            divider: true
        })
        return this
    }

    // 全部选中
    pushAllSelected() {
        ContextMenuItem.items.push({
            content: '全部选择',
            value: 'all',
            prefixIcon: `check-circle`,
            action: () => {
                const { allSelected } = usePathStore()
                allSelected()
            }
        })
        return this
    }

    // 全部取消选择
    pushAllCancel() {
        ContextMenuItem.items.push({
            content: '全部取消',
            value: 'all-cancel',
            prefixIcon: `minus-circle`,
            action: () => {
                const { clearSelected } = usePathStore()
                clearSelected()
            }
        })
        return this
    }

    // 反选
    pushReverseSelected() {
        ContextMenuItem.items.push({
            content: '反向选择',
            value: 'reverse',
            prefixIcon: `error-circle`,
            action: () => {
                const { reverseSelected } = usePathStore()
                reverseSelected()
            }
        })
        return this
    }

    build() {
        return ContextMenuItem.items
    }
}

