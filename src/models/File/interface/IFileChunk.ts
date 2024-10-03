/**
 * 文件块接口
 */
export interface IFileChunk {
  /**
   * 文件名
   */
  fileName: string
  /**
   * 文件ID
   */
  fileId: number
  /**
   * 父级ID
   */
  parentId: number
  /**
   * 哈希值
   */
  hash: string
}
