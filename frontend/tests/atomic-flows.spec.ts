import { expect, test, type Page } from '@playwright/test'
import { selectOnlineGameMode } from './helpers/select-online-mode'

type UniqueUser = {
  username: string
  email: string
  password: string
}

const DEFAULT_PASSWORD = 'Password123!'

/** Identifiants uniques (timestamp) pour éviter les collisions en base entre exécutions. */
const createUniqueUser = (prefix: string): UniqueUser => {
  const ts = Date.now()
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'user'
  return {
    username: `${safePrefix}-${ts}`,
    email: `${safePrefix}-${ts}@test.com`,
    password: DEFAULT_PASSWORD,
  }
}

const registerAndLandOnHome = async (page: Page, user: UniqueUser) => {
  await page.goto('/register')
  await page.getByLabel('Username').fill(user.username)
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL((url) => new URL(url).pathname === '/')
  await expect(page.getByText(`Welcome back, ${user.username}!`)).toBeVisible({ timeout: 15000 })
}

test.describe('Flux Utilisateur Atomiques', () => {
  test('un utilisateur peut s’inscrire et voir l’accueil', async ({ page }) => {
    const user = createUniqueUser('atomic')
    await registerAndLandOnHome(page, user)
  })

  test('un utilisateur peut créer un lobby en ligne (seul)', async ({ page }) => {
    const user = createUniqueUser('atomic-lobby')
    await registerAndLandOnHome(page, user)

    await selectOnlineGameMode(page)
    await page.getByRole('button', { name: 'Create Lobby' }).click()

    await expect(page).toHaveURL(/\/lobby\/[A-Za-z0-9]{4,12}(\/|$)/)
    await expect(page.getByRole('button', { name: /Quitter le lobby/i })).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(user.username)).toBeVisible({ timeout: 15000 })
  })
})
