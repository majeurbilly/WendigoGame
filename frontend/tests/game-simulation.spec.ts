import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'

type BotIdentity = {
  username: string
  email: string
  password: string
}

const BOT_PASSWORD = 'Password123!'

const createIdentity = (seed: string, index: number): BotIdentity => ({
  username: `pw-bot-${index}-${seed}`,
  email: `pw-bot-${index}-${seed}@test.com`,
  password: BOT_PASSWORD,
})

const registerAndLogin = async (page: Page, identity: BotIdentity) => {
  await page.goto('/register')
  await page.getByLabel('Username').fill(identity.username)
  await page.getByLabel('Email').fill(identity.email)
  await page.getByLabel('Password').fill(identity.password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText(`Welcome back, ${identity.username}!`)).toBeVisible({ timeout: 15000 })
}

const createIsolatedPlayer = async (browser: Browser) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  return { context, page }
}

test('simulation E2E: 5 joueurs démarrent une partie online', async ({ browser }) => {
  const seed = Date.now().toString()
  const host = await createIsolatedPlayer(browser)
  const guests = await Promise.all([
    createIsolatedPlayer(browser),
    createIsolatedPlayer(browser),
    createIsolatedPlayer(browser),
    createIsolatedPlayer(browser),
  ])
  const allContexts: BrowserContext[] = [host.context, ...guests.map((guest) => guest.context)]

  try {
    const hostIdentity = createIdentity(seed, 1)
    await registerAndLogin(host.page, hostIdentity)

    await host.page.getByRole('radio', { name: 'Online (en ligne)' }).check()
    await host.page.getByRole('button', { name: 'Create Lobby' }).click()
    await expect(host.page).toHaveURL(/\/lobby\/[A-Z0-9]{4,12}$/)

    const lobbyUrlMatch = host.page.url().match(/\/lobby\/([A-Z0-9]{4,12})$/)
    expect(lobbyUrlMatch).not.toBeNull()
    const lobbyCode = lobbyUrlMatch?.[1] ?? ''

    await Promise.all(
      guests.map(async (guest, guestIndex) => {
        const identity = createIdentity(seed, guestIndex + 2)
        await registerAndLogin(guest.page, identity)
        await guest.page.getByPlaceholder('Lobby code').fill(lobbyCode)
        await guest.page.getByRole('button', { name: 'Join' }).click()
        await expect(guest.page).toHaveURL(new RegExp(`/lobby/${lobbyCode}$`))
      })
    )

    await expect(host.page.getByText(/pw-bot-/)).toHaveCount(5, { timeout: 15000 })

    await host.page.getByRole('button', { name: /start game/i }).click()

    const roleCheck = async (page: Page) => {
      const roleText = await page.getByText(/Your Role:/).first().textContent()
      return /WENDIGO|VILLAGER/i.test(roleText ?? '')
    }

    await expect
      .poll(async () => {
        const checks = await Promise.all([roleCheck(host.page), ...guests.map((guest) => roleCheck(guest.page))])
        return checks.some(Boolean)
      })
      .toBeTruthy()
  } finally {
    await Promise.all(allContexts.map(async (context) => context.close()))
  }
})
