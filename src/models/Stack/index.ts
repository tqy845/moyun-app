export default class Stack<T> {
  private items: T[]

  constructor() {
    this.items = []
  }

  // 推入元素
  push(...items: Array<T>): void {
    this.items.push(...items)
  }

  // 弹出元素
  pop(): T | undefined {
    return this.items.pop()
  }

  // 返回栈顶元素
  get peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  // 等待返回栈顶元素
  awaitPeek(timeout = 10 * 1000): Promise<T | undefined> {
    return new Promise<T>((resolve, reject) => {
      const now = Date.now()
      const item = this.items[this.items.length - 1]
      if (item) {
        resolve(item)
        return
      }
      // 等待栈有元素
      const timer = setInterval(() => {
        if (this.items.length > 0) {
          clearInterval(timer)
          resolve(this.items[this.items.length - 1])
          return
        }
        if (Date.now() - now > timeout) {
          clearInterval(timer)
          new Error('Await timeout')
          reject(undefined)
          return
        }
      }, 50)
    })
  }

  // 检查栈是否为空
  get isEmpty(): boolean {
    return this.items.length === 0
  }

  // 返回栈长度
  get size(): number {
    return this.items.length
  }

  // 清空栈
  clear(): void {
    this.items = []
  }

  // 返回栈元素数组
  toArray(): T[] {
    return this.items
  }
}
