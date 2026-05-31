import { i18n } from '@lingui/core'

export type AppLocale = 'en' | 'fr'

export const defaultLocale: AppLocale = 'en'

// Catalogue vide au boot : évite de bloquer le rendu (et l’audio) en attendant le .po
i18n.load(defaultLocale, {})
i18n.activate(defaultLocale)

export async function loadCatalog(locale: AppLocale): Promise<void> {
  const { messages } = await import(`./locales/${locale}/messages.po`)
  i18n.load(locale, messages)
  i18n.activate(locale)
}

export { i18n }
