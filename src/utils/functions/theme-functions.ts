/**
 * @module theme-functions
 * @description 该模块用于处理主题切换
 * @version 0.1.0
 * @author 叫我白天.
 */

/**
 * 切换主题模式
 * @param isDark - 是否为深色模式
 */
function switchColorTheme(isDark: boolean) {
  if (isDark) {
    // 设置为深色模式
    document.documentElement.setAttribute('theme-mode', 'dark')
  } else {
    // 设置为浅色模式
    document.documentElement.setAttribute('theme-mode', 'light')
  }
}

/**
 * 切换为浅色主题模式
 */
function switchLightColorTheme() {
  switchColorTheme(false)
}

/**
 * 切换为深色主题模式
 */
function switchDarkColorTheme() {
  switchColorTheme(true)
}

/**
 * 自动切换主题模式
 * @param nightHour - 夜晚时间段，默认为18点
 */
function autoSwitchColorTheme(nightHour = 18) {
  const currentHour = new Date().getHours()
  const isNight = currentHour >= nightHour || currentHour < 6 // 夜晚时间段为晚上18点至次日早上6点

  switchColorTheme(isNight)
}

// 默认主题为浅色模式，如果没有设置过主题则为浅色模式
const themeMode = document.documentElement.getAttribute('theme-mode')
const themeUtils = {
  switchColorTheme,
  switchLightColorTheme,
  switchDarkColorTheme,
  autoSwitchColorTheme,
  theme: themeMode ?? 'light'
}

export default themeUtils
