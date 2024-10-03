export default class Queue<T> {
  private items: T[]

  constructor() {
    this.items = []
  }

  // 入队列
  enqueue(item: T): void {
    this.items.push(item)
  }

  // 出队列
  dequeue(): T | undefined {
    return this.items.shift()
  }

  // 返回队头元素
  front(): T | undefined {
    return this.items[0]
  }

  // 检查队列是否为空
  isEmpty(): boolean {
    return this.items.length === 0
  }

  // 返回队列长度
  size(): number {
    return this.items.length
  }

  // 清空队列
  clear(): void {
    this.items = []
  }

  // 转数组
  toArray(): T[] {
    return this.items
  }
}
