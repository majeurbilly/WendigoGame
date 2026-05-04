import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { selectOnlineGameMode } from './helpers/select-online-mode'

type BotIdentity = {
  username: string
  email: string
  password: string
}

type SimulatedPlayer = {
  page: Page
  identity: BotIdentity
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

const getPlayerCard = (page: Page, playerName: string) =>
  page.locator('div[class*="border-slate-800"]').filter({
    has: page.locator('span', { hasText: new RegExp(`^${playerName}$`) }),
  })

const claimSeat = async (page: Page) => {
  const claimSeatButton = page.getByRole('button', { name: /claim seat/i })
  await expect(claimSeatButton).toBeVisible({ timeout: 10000 })
  await expect(claimSeatButton).toBeEnabled()
  await claimSeatButton.click()

  await expect
    .poll(async () => {
      const seatedButtonVisible = await page.getByRole('button', { name: /^SEATED$/ }).isVisible()
      const actionLockedVisible = await page.getByText(/Action locked: Seated/i).isVisible()
      return seatedButtonVisible || actionLockedVisible
    })
    .toBeTruthy()
}

const selectVoteTarget = async (page: Page, targetName: string) => {
  const voteSelect = page.locator('select').first()
  await expect(voteSelect).toBeVisible({ timeout: 10000 })
  await voteSelect.selectOption({ label: targetName })

  const voteButton = page.getByRole('button', { name: /^VOTE TO LYNCH$/ })
  await expect(voteButton).toBeEnabled()
  await voteButton.click()

  await expect(page.getByText(new RegExp(`Action locked: Voted to lynch ${targetName}`))).toBeVisible({
    timeout: 15000,
  })
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
  const hostRuntimeErrors: string[] = []
  host.page.on('pageerror', (error) => {
    hostRuntimeErrors.push(`pageerror: ${error.message}`)
  })
  host.page.on('console', (message) => {
    if (message.type() === 'error') {
      hostRuntimeErrors.push(`console.error: ${message.text()}`)
    }
  })

  try {
    const hostIdentity = createIdentity(seed, 1)
    await registerAndLogin(host.page, hostIdentity)
    const guestIdentities = guests.map((_, guestIndex) => createIdentity(seed, guestIndex + 2))

    await selectOnlineGameMode(host.page)
    await host.page.getByRole('button', { name: 'Create Lobby' }).click()

    let lobbyCode = ''
    await host.page.waitForURL(
      (url) => {
        const path = url.pathname.replace(/\/+$/, '')
        const match = path.match(/\/lobby\/([A-Za-z0-9]{4,12})$/i)
        if (!match) {
          return false
        }
        lobbyCode = match[1].toUpperCase()
        return true
      },
      { timeout: 15000 }
    )
    expect(lobbyCode.length).toBeGreaterThan(0)
    await expect(host.page).toHaveURL(new RegExp(`/lobby/${lobbyCode}$`, 'i'))
    await expect(host.page.getByRole('button', { name: /Quitter le lobby/i })).toBeVisible({ timeout: 15000 })
    await expect(host.page.getByText('Connecting to server...')).not.toBeVisible({ timeout: 15000 })
    await expect(host.page.getByText(hostIdentity.username)).toBeVisible({ timeout: 15000 })

    await Promise.all(
      guests.map(async (guest, guestIndex) => {
        const identity = guestIdentities[guestIndex]
        await registerAndLogin(guest.page, identity)
        const lobbyCodeInput = guest.page.getByPlaceholder('Lobby code')
        await expect(lobbyCodeInput).toBeVisible({ timeout: 15000 })
        await expect(lobbyCodeInput).toBeEditable()
        await lobbyCodeInput.fill(lobbyCode)
        const joinButton = guest.page.getByRole('button', { name: 'Join' })
        await expect(joinButton).toBeEnabled()
        await Promise.all([
          guest.page.waitForURL(
            (url) => url.pathname.replace(/\/+$/, '').toUpperCase() === `/LOBBY/${lobbyCode}`,
            { timeout: 15000 }
          ),
          joinButton.click(),
        ])

        // Ensure the guest reached the actual lobby UI (not register/dashboard leftovers).
        await expect(guest.page.getByRole('button', { name: /Quitter le lobby/i })).toBeVisible({
          timeout: 15000,
        })
        await expect(guest.page.getByText('Connecting to server...')).not.toBeVisible({ timeout: 15000 })
        await expect(guest.page.getByText(hostIdentity.username)).toBeVisible({ timeout: 15000 })
      })
    )

    await expect(host.page).toHaveURL(new RegExp(`/lobby/${lobbyCode}$`, 'i'))
    await expect(host.page.getByRole('button', { name: /Quitter le lobby/i })).toBeVisible({ timeout: 15000 })
    expect(
      hostRuntimeErrors,
      `Host runtime errors detected before player-count assertion:\n${hostRuntimeErrors.join('\n')}`
    ).toEqual([])

    await expect(host.page.getByText(/pw-bot-/)).toHaveCount(5, { timeout: 15000 })

    await host.page.getByRole('button', { name: /start game/i }).click()

    const roleCheck = async (page: Page) => {
      const roleText = await page.getByText(/Your Role:/).first().textContent()
      return /WENDIGO|VILLAGER/i.test(roleText ?? '')
    }

    await expect
      .poll(async () => {
        const checks = await Promise.all([roleCheck(host.page), ...guests.map((guest) => roleCheck(guest.page))])
        return checks.every(Boolean)
      })
      .toBeTruthy()

    await Promise.all(
      [host.page, ...guests.map((guest) => guest.page)].map(async (page) => {
        await expect(page.getByText(/^CHAIR_SELECTION$/)).toBeVisible({ timeout: 30000 })
      })
    )

    await Promise.all([host.page, ...guests.map((guest) => guest.page)].map(async (page) => claimSeat(page)))

    await Promise.all(
      [host.page, ...guests.map((guest) => guest.page)].map(async (page) => {
        await expect(page.getByText(/^CHAIR_SELECTION$/)).not.toBeVisible({ timeout: 30000 })
      })
    )

    const allPlayers: SimulatedPlayer[] = [
      { page: host.page, identity: hostIdentity },
      ...guests.map((guest, guestIndex) => ({ page: guest.page, identity: guestIdentities[guestIndex] })),
    ]

    let wendigoPage: Page | undefined
    let wendigoIdentity: BotIdentity | undefined
    const villagerPages: Page[] = []
    const villagerIdentities: BotIdentity[] = []

    for (const simulatedPlayer of allPlayers) {
      const roleText = (await simulatedPlayer.page.getByText(/Your Role:/).first().textContent()) ?? ''
      const role = roleText.toUpperCase()

      if (role.includes('WENDIGO')) {
        wendigoPage = simulatedPlayer.page
        wendigoIdentity = simulatedPlayer.identity
      } else if (role.includes('VILLAGER')) {
        villagerPages.push(simulatedPlayer.page)
        villagerIdentities.push(simulatedPlayer.identity)
      }
    }

    expect(wendigoPage, 'Expected one Wendigo page after role distribution').toBeDefined()
    expect(villagerPages.length, 'Expected at least one villager page after role distribution').toBeGreaterThan(0)
    expect(wendigoIdentity, 'Expected a Wendigo identity to target a villager by name').toBeDefined()

    const wendigo = wendigoPage as Page
    const targetVillager = villagerIdentities[0]
    const targetVillagerName = targetVillager.username

    let hostNextPhase = ''
    await expect
      .poll(async () => {
        if (await host.page.getByText(/^NIGHT$/).isVisible()) {
          hostNextPhase = 'NIGHT'
          return true
        }
        if (await host.page.getByText(/^DAY$/).isVisible()) {
          hostNextPhase = 'DAY'
          return true
        }
        if (await host.page.getByText(/^ACCUSATION$/).isVisible()) {
          hostNextPhase = 'DAY'
          return true
        }
        return false
      })
      .toBeTruthy()

    if (hostNextPhase === 'NIGHT') {
      const targetSelect = wendigo.locator('select').first()
      await expect(targetSelect).toBeVisible({ timeout: 10000 })
      await targetSelect.selectOption({ label: targetVillagerName })

      const killButton = wendigo.getByRole('button', { name: /^KILL$/ })
      await expect(killButton).toBeEnabled()
      await killButton.click()

      await expect(
        wendigo.getByText(new RegExp(`Action locked: Targeting ${targetVillagerName} for a kill`))
      ).toBeVisible({
        timeout: 15000,
      })

      await Promise.all(
        villagerPages.map(async (villagerPage) => {
          const prayButton = villagerPage.getByRole('button', { name: /^PRAY$/ })
          if (await prayButton.isVisible()) {
            await expect(prayButton).toBeEnabled()
            await prayButton.click()
            await expect(villagerPage.getByText(/Action locked: Praying/i)).toBeVisible({ timeout: 15000 })
          }
        })
      )
      await Promise.all(
        allPlayers.map(async ({ page }) => {
          await expect(page.getByText(/^DAY$/)).toBeVisible({ timeout: 30000 })
        })
      )

      const deadPlayerCard = getPlayerCard(host.page, targetVillagerName)
      await expect(deadPlayerCard).toBeVisible({ timeout: 15000 })
      await expect(deadPlayerCard).toContainText('Dead')
    } else {
      await Promise.all(
        allPlayers.map(async ({ page }) => {
          const dayVisible = await page.getByText(/^DAY$/).isVisible()
          const accusationVisible = await page.getByText(/^ACCUSATION$/).isVisible()
          expect(dayVisible || accusationVisible).toBeTruthy()
        })
      )
    }

    const alivePlayers = await Promise.all(
      allPlayers.map(async (player) => {
        const canVote = await player.page.getByRole('button', { name: /^VOTE TO LYNCH$/ }).isVisible()
        return canVote ? player : null
      })
    )
    const alivePlayersFiltered = alivePlayers.filter((player): player is SimulatedPlayer => player !== null)
    expect(alivePlayersFiltered.length, 'Expected living players to be able to vote during day phase').toBeGreaterThan(1)

    const wendigoName = (wendigoIdentity as BotIdentity).username
    const fallbackVoteTarget =
      villagerIdentities.find((identity) => identity.username !== targetVillagerName)?.username ?? targetVillagerName

    for (const player of alivePlayersFiltered) {
      const voteTargetName = player.identity.username === wendigoName ? fallbackVoteTarget : wendigoName
      const voteTargetCard = getPlayerCard(player.page, voteTargetName)
      await expect(voteTargetCard).toBeVisible()
      await expect(voteTargetCard).toContainText('Alive')
      await selectVoteTarget(player.page, voteTargetName)
    }

    await Promise.all(
      allPlayers.map(async ({ page }) => {
        await expect(page.getByText(/THE VILLAGE SURVIVED/i)).toBeVisible({ timeout: 30000 })
      })
    )
  } finally {
    await Promise.all(allContexts.map(async (context) => context.close()))
  }
})
