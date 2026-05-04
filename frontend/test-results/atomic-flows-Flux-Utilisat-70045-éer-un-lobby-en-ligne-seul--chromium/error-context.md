# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: atomic-flows.spec.ts >> Flux Utilisateur Atomiques >> un utilisateur peut créer un lobby en ligne (seul)
- Location: tests/atomic-flows.spec.ts:40:3

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

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - heading "kingDOM" [level=1] [ref=e6]
        - generic [ref=e7]:
          - button "Audio settings" [ref=e8] [cursor=pointer]:
            - img
          - button "Logout" [ref=e9] [cursor=pointer]
    - main [ref=e10]:
      - generic [ref=e11]:
        - heading "Welcome back, atomic-lobby-1777683139294!" [level=2] [ref=e12]
        - generic [ref=e13]:
          - generic [ref=e14]:
            - generic [ref=e16]: Games played
            - paragraph [ref=e18]: "0"
          - generic [ref=e19]:
            - generic [ref=e21]: Wins as Wendigo
            - paragraph [ref=e23]: "0"
          - generic [ref=e24]:
            - generic [ref=e26]: Wins as Villager
            - paragraph [ref=e28]: "0"
        - generic [ref=e29]:
          - generic [ref=e30]:
            - generic [ref=e32]: Create Game
            - generic [ref=e33]:
              - generic [ref=e34]:
                - paragraph [ref=e35]: Mode de partie
                - generic [ref=e36]:
                  - generic [ref=e37] [cursor=pointer]:
                    - radio "Local (présentiel)" [checked] [ref=e38]
                    - generic [ref=e39]: Local (présentiel)
                  - generic [ref=e40] [cursor=pointer]:
                    - radio "Online (en ligne)" [ref=e41]
                    - generic [ref=e42]: Online (en ligne)
              - button "Create Lobby" [ref=e43] [cursor=pointer]
          - generic [ref=e44]:
            - generic [ref=e46]: Join Game
            - generic [ref=e47]:
              - textbox "Lobby code" [ref=e48]
              - button "Join" [ref=e49] [cursor=pointer]
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { expect, test, type Page } from '@playwright/test'
  2  | import { selectOnlineGameMode } from './helpers/select-online-mode'
  3  | 
  4  | type UniqueUser = {
  5  |   username: string
  6  |   email: string
  7  |   password: string
  8  | }
  9  | 
  10 | const DEFAULT_PASSWORD = 'Password123!'
  11 | 
  12 | /** Identifiants uniques (timestamp) pour éviter les collisions en base entre exécutions. */
  13 | const createUniqueUser = (prefix: string): UniqueUser => {
  14 |   const ts = Date.now()
  15 |   const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'user'
  16 |   return {
  17 |     username: `${safePrefix}-${ts}`,
  18 |     email: `${safePrefix}-${ts}@test.com`,
  19 |     password: DEFAULT_PASSWORD,
  20 |   }
  21 | }
  22 | 
  23 | const registerAndLandOnHome = async (page: Page, user: UniqueUser) => {
  24 |   await page.goto('/register')
  25 |   await page.getByLabel('Username').fill(user.username)
  26 |   await page.getByLabel('Email').fill(user.email)
  27 |   await page.getByLabel('Password').fill(user.password)
  28 |   await page.getByRole('button', { name: 'Create account' }).click()
  29 | 
  30 |   await expect(page).toHaveURL((url) => new URL(url).pathname === '/')
  31 |   await expect(page.getByText(`Welcome back, ${user.username}!`)).toBeVisible({ timeout: 15000 })
  32 | }
  33 | 
  34 | test.describe('Flux Utilisateur Atomiques', () => {
  35 |   test('un utilisateur peut s’inscrire et voir l’accueil', async ({ page }) => {
  36 |     const user = createUniqueUser('atomic')
  37 |     await registerAndLandOnHome(page, user)
  38 |   })
  39 | 
  40 |   test('un utilisateur peut créer un lobby en ligne (seul)', async ({ page }) => {
  41 |     const user = createUniqueUser('atomic-lobby')
  42 |     await registerAndLandOnHome(page, user)
  43 | 
  44 |     await selectOnlineGameMode(page)
  45 |     await page.getByRole('button', { name: 'Create Lobby' }).click()
  46 | 
  47 |     await expect(page).toHaveURL(/\/lobby\/[A-Za-z0-9]{4,12}(\/|$)/)
> 48 |     await expect(page.getByRole('button', { name: /Quitter le lobby/i })).toBeVisible({ timeout: 15000 })
     |                                                                           ^ Error: expect(locator).toBeVisible() failed
  49 |     await expect(page.getByText(user.username)).toBeVisible({ timeout: 15000 })
  50 |   })
  51 | })
  52 | 
```