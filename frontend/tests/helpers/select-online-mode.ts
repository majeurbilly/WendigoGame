import { expect, type Page } from '@playwright/test'

/** Mode « Online » : clic sur le contrôle radio (souvent recouvert par un label custom Radix/shadcn). */
export async function selectOnlineGameMode(page: Page): Promise<void> {
  await page.getByRole('radio', { name: /Online/i }).click({ force: true })
  await expect(page.getByRole('radio', { name: /Online/i })).toBeChecked()
}
