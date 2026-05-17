import { I18nProvider } from '@lingui/react'
import { type ReactNode, useEffect } from 'react'
import { defaultLocale, i18n, loadCatalog } from '@/i18n'
import { useGameStore } from '@/store/useGameStore'

type I18nRootProps = {
  children: ReactNode
}

const I18nRoot = ({ children }: I18nRootProps) => {
  const language = useGameStore((state) => state.language)

  useEffect(() => {
    void loadCatalog(language).catch(() => loadCatalog(defaultLocale))
  }, [language])

  useEffect(() => {
    if (useGameStore.persist.hasHydrated()) {
      return
    }
    return useGameStore.persist.onFinishHydration(() => {
      const locale = useGameStore.getState().language
      void loadCatalog(locale).catch(() => loadCatalog(defaultLocale))
    })
  }, [])

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}

export default I18nRoot
