// lib/preferences.jsx — small global UI preferences: language (it/en) and
// theme (dark/light). Both persist to localStorage and default from the
// browser (navigator.language / prefers-color-scheme) on first visit.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translate } from './translations'

const PrefsContext = createContext(null)

const LANG_KEY = 'portfolio_lang'
const THEME_KEY = 'portfolio_theme'

function detectLang() {
  if (typeof navigator === 'undefined') return 'it'
  return navigator.language?.toLowerCase().startsWith('it') ? 'it' : 'en'
}

function detectTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function PrefsProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || detectLang())
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || detectTheme())

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang)
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const value = useMemo(() => ({
    lang,
    setLang,
    toggleLang: () => setLang(l => (l === 'it' ? 'en' : 'it')),
    theme,
    setTheme,
    toggleTheme: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')),
    t: (path) => translate(lang, path),
  }), [lang, theme])

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs() {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs() must be used inside <PrefsProvider>')
  return ctx
}
