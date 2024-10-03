/**
 * 生成指定长度范围内的随机名称
 * @param {number} minLength - 生成的随机名称的最短长度
 * @param {number} maxLength - 生成的随机名称的最长长度
 * @returns {string} - 随机生成的名称
 */
function generateRandomName(minLength: number, maxLength: number) {
  if (minLength < 1 || minLength > maxLength) {
    throw new Error('长度必须大于1，最小长度不大于最大长度')
  }

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength
  let randomName = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    randomName += characters.charAt(randomIndex)
  }

  return randomName
}

/**
 * 将字符串首字母大写
 * @param str - 需要转换的字符串
 */
function toPascalCase(str: string) {
  if (!str) return
  // 将字符串按空格或者其他分隔符分割成单词数组
  const words = str.split(/[\s-_]+/)

  // 将每个单词的首字母大写，并拼接成新的字符串
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('')
}

const baseUtils: Record<string, Function> = {
  generateRandomName,
  toPascalCase
}

export default baseUtils
