import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'
import styles from './LobbyPanorama.module.css'

/** Chemin public Vite : fichier dans `public/assets/images/`. */
export const LOBBY_PANORAMA_DEFAULT_IMAGE_SRC = '/assets/images/panorama_360_final.jpg'

export type LobbyPanoramaProps = {
  /** URL absolue depuis la racine du site (dossier `public`). */
  imageSrc?: string
  /** Durée d’un cycle complet (0 → -50 %), en secondes. */
  scrollDurationSeconds?: number
  /** Remplit un parent `position: relative` (ex. `absolute inset-0` équivalent). */
  fillParent?: boolean
  className?: string
}

/**
 * Fresque panoramique plein écran avec défilement infini seamless (effet 360°).
 * Calques : piste animée → vignette → `#fire-stage` pour effets futurs.
 */
export default function LobbyPanorama({
  imageSrc = LOBBY_PANORAMA_DEFAULT_IMAGE_SRC,
  scrollDurationSeconds = 120,
  fillParent = false,
  className,
}: LobbyPanoramaProps) {
  const cssVars = {
    '--lobby-panorama-duration': `${scrollDurationSeconds}s`,
  } as CSSProperties

  return (
    <div
      className={cn(
        styles.root,
        fillParent ? styles.rootFillParent : styles.rootViewport,
        className
      )}
    >
      <div className={styles.sliderTrack} style={cssVars}>
        <div className={styles.panel}>
          <img
            className={styles.image}
            src={imageSrc}
            alt=""
            decoding="async"
            draggable={false}
          />
        </div>
        <div className={styles.panel} aria-hidden>
          <img
            className={styles.image}
            src={imageSrc}
            alt=""
            decoding="async"
            draggable={false}
          />
        </div>
      </div>

      <div className={styles.vignette} aria-hidden />

      <div id="fire-stage" className={styles.fireStage} aria-hidden />
    </div>
  )
}
