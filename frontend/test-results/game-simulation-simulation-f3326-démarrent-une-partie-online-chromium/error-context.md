# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game-simulation.spec.ts >> simulation E2E: 5 joueurs démarrent une partie online
- Location: tests/game-simulation.spec.ts:72:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /Quitter le lobby/i })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('button', { name: /Quitter le lobby/i })

```

# Test source

```ts
  15  | const BOT_PASSWORD = 'Password123!'
  16  | 
  17  | const createIdentity = (seed: string, index: number): BotIdentity => ({
  18  |   username: `pw-bot-${index}-${seed}`,
  19  |   email: `pw-bot-${index}-${seed}@test.com`,
  20  |   password: BOT_PASSWORD,
  21  | })
  22  | 
  23  | const registerAndLogin = async (page: Page, identity: BotIdentity) => {
  24  |   await page.goto('/register')
  25  |   await page.getByLabel('Username').fill(identity.username)
  26  |   await page.getByLabel('Email').fill(identity.email)
  27  |   await page.getByLabel('Password').fill(identity.password)
  28  |   await page.getByRole('button', { name: 'Create account' }).click()
  29  |   await expect(page.getByText(`Welcome back, ${identity.username}!`)).toBeVisible({ timeout: 15000 })
  30  | }
  31  | 
  32  | const createIsolatedPlayer = async (browser: Browser) => {
  33  |   const context = await browser.newContext()
  34  |   const page = await context.newPage()
  35  |   return { context, page }
  36  | }
  37  | 
  38  | const getPlayerCard = (page: Page, playerName: string) =>
  39  |   page.locator('div[class*="border-slate-800"]').filter({
  40  |     has: page.locator('span', { hasText: new RegExp(`^${playerName}$`) }),
  41  |   })
  42  | 
  43  | const claimSeat = async (page: Page) => {
  44  |   const claimSeatButton = page.getByRole('button', { name: /claim seat/i })
  45  |   await expect(claimSeatButton).toBeVisible({ timeout: 10000 })
  46  |   await expect(claimSeatButton).toBeEnabled()
  47  |   await claimSeatButton.click()
  48  | 
  49  |   await expect
  50  |     .poll(async () => {
  51  |       const seatedButtonVisible = await page.getByRole('button', { name: /^SEATED$/ }).isVisible()
  52  |       const actionLockedVisible = await page.getByText(/Action locked: Seated/i).isVisible()
  53  |       return seatedButtonVisible || actionLockedVisible
  54  |     })
  55  |     .toBeTruthy()
  56  | }
  57  | 
  58  | const selectVoteTarget = async (page: Page, targetName: string) => {
  59  |   const voteSelect = page.locator('select').first()
  60  |   await expect(voteSelect).toBeVisible({ timeout: 10000 })
  61  |   await voteSelect.selectOption({ label: targetName })
  62  | 
  63  |   const voteButton = page.getByRole('button', { name: /^VOTE TO LYNCH$/ })
  64  |   await expect(voteButton).toBeEnabled()
  65  |   await voteButton.click()
  66  | 
  67  |   await expect(page.getByText(new RegExp(`Action locked: Voted to lynch ${targetName}`))).toBeVisible({
  68  |     timeout: 15000,
  69  |   })
  70  | }
  71  | 
  72  | test('simulation E2E: 5 joueurs démarrent une partie online', async ({ browser }) => {
  73  |   const seed = Date.now().toString()
  74  |   const host = await createIsolatedPlayer(browser)
  75  |   const guests = await Promise.all([
  76  |     createIsolatedPlayer(browser),
  77  |     createIsolatedPlayer(browser),
  78  |     createIsolatedPlayer(browser),
  79  |     createIsolatedPlayer(browser),
  80  |   ])
  81  |   const allContexts: BrowserContext[] = [host.context, ...guests.map((guest) => guest.context)]
  82  |   const hostRuntimeErrors: string[] = []
  83  |   host.page.on('pageerror', (error) => {
  84  |     hostRuntimeErrors.push(`pageerror: ${error.message}`)
  85  |   })
  86  |   host.page.on('console', (message) => {
  87  |     if (message.type() === 'error') {
  88  |       hostRuntimeErrors.push(`console.error: ${message.text()}`)
  89  |     }
  90  |   })
  91  | 
  92  |   try {
  93  |     const hostIdentity = createIdentity(seed, 1)
  94  |     await registerAndLogin(host.page, hostIdentity)
  95  |     const guestIdentities = guests.map((_, guestIndex) => createIdentity(seed, guestIndex + 2))
  96  | 
  97  |     await selectOnlineGameMode(host.page)
  98  |     await host.page.getByRole('button', { name: 'Create Lobby' }).click()
  99  | 
  100 |     let lobbyCode = ''
  101 |     await host.page.waitForURL(
  102 |       (url) => {
  103 |         const path = url.pathname.replace(/\/+$/, '')
  104 |         const match = path.match(/\/lobby\/([A-Za-z0-9]{4,12})$/i)
  105 |         if (!match) {
  106 |           return false
  107 |         }
  108 |         lobbyCode = match[1].toUpperCase()
  109 |         return true
  110 |       },
  111 |       { timeout: 15000 }
  112 |     )
  113 |     expect(lobbyCode.length).toBeGreaterThan(0)
  114 |     await expect(host.page).toHaveURL(new RegExp(`/lobby/${lobbyCode}$`, 'i'))
> 115 |     await expect(host.page.getByRole('button', { name: /Quitter le lobby/i })).toBeVisible({ timeout: 15000 })
      |                                                                                ^ Error: expect(locator).toBeVisible() failed
  116 |     await expect(host.page.getByText('Connecting to server...')).not.toBeVisible({ timeout: 15000 })
  117 |     await expect(host.page.getByText(hostIdentity.username)).toBeVisible({ timeout: 15000 })
  118 | 
  119 |     await Promise.all(
  120 |       guests.map(async (guest, guestIndex) => {
  121 |         const identity = guestIdentities[guestIndex]
  122 |         await registerAndLogin(guest.page, identity)
  123 |         const lobbyCodeInput = guest.page.getByPlaceholder('Lobby code')
  124 |         await expect(lobbyCodeInput).toBeVisible({ timeout: 15000 })
  125 |         await expect(lobbyCodeInput).toBeEditable()
  126 |         await lobbyCodeInput.fill(lobbyCode)
  127 |         const joinButton = guest.page.getByRole('button', { name: 'Join' })
  128 |         await expect(joinButton).toBeEnabled()
  129 |         await Promise.all([
  130 |           guest.page.waitForURL(
  131 |             (url) => url.pathname.replace(/\/+$/, '').toUpperCase() === `/LOBBY/${lobbyCode}`,
  132 |             { timeout: 15000 }
  133 |           ),
  134 |           joinButton.click(),
  135 |         ])
  136 | 
  137 |         // Ensure the guest reached the actual lobby UI (not register/dashboard leftovers).
  138 |         await expect(guest.page.getByRole('button', { name: /Quitter le lobby/i })).toBeVisible({
  139 |           timeout: 15000,
  140 |         })
  141 |         await expect(guest.page.getByText('Connecting to server...')).not.toBeVisible({ timeout: 15000 })
  142 |         await expect(guest.page.getByText(hostIdentity.username)).toBeVisible({ timeout: 15000 })
  143 |       })
  144 |     )
  145 | 
  146 |     await expect(host.page).toHaveURL(new RegExp(`/lobby/${lobbyCode}$`, 'i'))
  147 |     await expect(host.page.getByRole('button', { name: /Quitter le lobby/i })).toBeVisible({ timeout: 15000 })
  148 |     expect(
  149 |       hostRuntimeErrors,
  150 |       `Host runtime errors detected before player-count assertion:\n${hostRuntimeErrors.join('\n')}`
  151 |     ).toEqual([])
  152 | 
  153 |     await expect(host.page.getByText(/pw-bot-/)).toHaveCount(5, { timeout: 15000 })
  154 | 
  155 |     await host.page.getByRole('button', { name: /start game/i }).click()
  156 | 
  157 |     const roleCheck = async (page: Page) => {
  158 |       const roleText = await page.getByText(/Your Role:/).first().textContent()
  159 |       return /WENDIGO|VILLAGER/i.test(roleText ?? '')
  160 |     }
  161 | 
  162 |     await expect
  163 |       .poll(async () => {
  164 |         const checks = await Promise.all([roleCheck(host.page), ...guests.map((guest) => roleCheck(guest.page))])
  165 |         return checks.every(Boolean)
  166 |       })
  167 |       .toBeTruthy()
  168 | 
  169 |     await Promise.all(
  170 |       [host.page, ...guests.map((guest) => guest.page)].map(async (page) => {
  171 |         await expect(page.getByText(/^CHAIR_SELECTION$/)).toBeVisible({ timeout: 30000 })
  172 |       })
  173 |     )
  174 | 
  175 |     await Promise.all([host.page, ...guests.map((guest) => guest.page)].map(async (page) => claimSeat(page)))
  176 | 
  177 |     await Promise.all(
  178 |       [host.page, ...guests.map((guest) => guest.page)].map(async (page) => {
  179 |         await expect(page.getByText(/^CHAIR_SELECTION$/)).not.toBeVisible({ timeout: 30000 })
  180 |       })
  181 |     )
  182 | 
  183 |     const allPlayers: SimulatedPlayer[] = [
  184 |       { page: host.page, identity: hostIdentity },
  185 |       ...guests.map((guest, guestIndex) => ({ page: guest.page, identity: guestIdentities[guestIndex] })),
  186 |     ]
  187 | 
  188 |     let wendigoPage: Page | undefined
  189 |     let wendigoIdentity: BotIdentity | undefined
  190 |     const villagerPages: Page[] = []
  191 |     const villagerIdentities: BotIdentity[] = []
  192 | 
  193 |     for (const simulatedPlayer of allPlayers) {
  194 |       const roleText = (await simulatedPlayer.page.getByText(/Your Role:/).first().textContent()) ?? ''
  195 |       const role = roleText.toUpperCase()
  196 | 
  197 |       if (role.includes('WENDIGO')) {
  198 |         wendigoPage = simulatedPlayer.page
  199 |         wendigoIdentity = simulatedPlayer.identity
  200 |       } else if (role.includes('VILLAGER')) {
  201 |         villagerPages.push(simulatedPlayer.page)
  202 |         villagerIdentities.push(simulatedPlayer.identity)
  203 |       }
  204 |     }
  205 | 
  206 |     expect(wendigoPage, 'Expected one Wendigo page after role distribution').toBeDefined()
  207 |     expect(villagerPages.length, 'Expected at least one villager page after role distribution').toBeGreaterThan(0)
  208 |     expect(wendigoIdentity, 'Expected a Wendigo identity to target a villager by name').toBeDefined()
  209 | 
  210 |     const wendigo = wendigoPage as Page
  211 |     const targetVillager = villagerIdentities[0]
  212 |     const targetVillagerName = targetVillager.username
  213 | 
  214 |     let hostNextPhase = ''
  215 |     await expect
```