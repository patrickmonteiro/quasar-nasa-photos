import { Dark, colors } from 'quasar'

// Quasar brand colors per theme (Deep Space / Lunar). They must match the
// --ignition, --orbit… tokens in src/css/qn-tokens.css.
const BRAND = {
  dark: {
    primary: '#ff6a2b',
    secondary: '#d9774a',
    accent: '#7fb2ff',
    positive: '#3ddc97',
    negative: '#ff6b85',
    info: '#7fb2ff',
    warning: '#ffc247'
  },
  light: {
    primary: '#a8380b',
    secondary: '#9a3412',
    accent: '#1d4ed8',
    positive: '#04694a',
    negative: '#be123c',
    info: '#1d4ed8',
    warning: '#f2b233'
  }
}

const STORAGE_KEY = 'qn-theme'

export function setTheme (isDark) {
  Dark.set(isDark)
  const theme = isDark ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  Object.entries(BRAND[theme]).forEach(([name, value]) => colors.setBrand(name, value))
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch (e) {
    // Storage unavailable (private mode); the choice just won't persist
  }
}

export default () => {
  let saved = null
  try {
    saved = localStorage.getItem(STORAGE_KEY)
  } catch (e) {}
  setTheme(saved !== 'light')
}
